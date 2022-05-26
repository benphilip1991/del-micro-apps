var userName = '';
var appId = '';
var appData = {}
var map;
var mapCenter;
var mapWorkout;
var lats = [];
var longs = [];
var timeSteps = [];
var locationTrace = [];
var workoutIndex = 0;
var curLocationGroup = L.featureGroup();
var prevLocationGroup = L.featureGroup();
var showWorkoutFlag = false;
var isWorkoutActive = false;
var stepCountLatest = 0;
var startStepCount = 0;

var appData = {
    "workouts": []
}
var curWorkout;

//WebView Id setter function called by container
function setAppId(appId) {
    this.appId = appId;
    initApp()
}

//Location callback to be called by container
function locationCallback(dataType, location) {
    if (!this.showWorkoutFlag) {
        var circleOptions = {
            color: '#5ee2f5',
            fillColor: '#5ee2f5',
            fillOpacity: 0.2
        }
        console.log(JSON.stringify(location));
        var coordinates = JSON.parse(location);
        if (dataType == "location" && Object.keys(coordinates).length > 0) {
            var lat = coordinates.latitude;
            var long = coordinates.longitude;
            var accuracy = coordinates.accuracy;
            //clear previour marker
            this.curLocationGroup.clearLayers();
            this.map = this.map.setView([lat, long]);
            //draw new marker
            var locationMarker = L.marker([lat, long]);
            var accCircle = L.circle([lat, long], accuracy, circleOptions);
            locationMarker.addTo(this.curLocationGroup);
            accCircle.addTo(this.curLocationGroup);
            this.map.addLayer(this.curLocationGroup);
        }
    }
}

//Pedomater callback to be called by container
function pedometerCallback(dataType, steps) {
    if (dataType == "step_count") {
        document.getElementById('step-count').innerHTML = steps
        this.stepCountLatest = steps
    }
}

function hrCallback(dataType, hr) {
    var hrData;
    if (dataType == "heart_rate") {
        hrData = JSON.parse(hr);
        document.getElementById("heart-rate").innerHTML = hrData.heart_rate;
    }
}

//Function to initialize app 
function initApp() {
    let callbackRequests = {
        "appId": this.appId,
        "requests": [{
            "resource": "access_pedometer",
            "callback": "pedometerCallback"
        }, {
            "resource": "access_location",
            "callback": "locationCallback"
        }, {
            "resource": "access_heart_rate",
            "callback": "hrCallback"
        }]
    }

    DelUtils.setCallbackRequest(JSON.stringify(callbackRequests));
    this.userName = DelUtils.getUserName();

    //document.querySelector("#username").innerHTML = this.userName;

    //Set map tiles after load
    initMap();

    //Get all app-specific data information
    getAppData();

    //Refresh tabs to view workouts
    refreshWorkoutsPane();

    // setTimeout(callNotif, 5000);
}

function callNotif() {
    DelUtils.createNotification(this.appId, "Start your workout by tapping on the button!");
}

//Function to initialize the map (compulsory)
function initMap() {
    this.mapCenter = [0, 0];
    this.map = L.map('map-box').setView(this.mapCenter, 16);

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributor'
    }).addTo(this.map);
}

// Second map instance for previous workouts
function initMapPrevWorkouts() {
    this.mapCenter = [0, 0];
    this.mapWorkout = L.map('map-box-old').setView(this.mapCenter, 16);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributor'
    }).addTo(this.mapWorkout);
}

//Function to get all app specific data
function getAppData() {
    console.log("Getting app data");
    tempAppData = JSON.parse(DelUtils.getAppData(this.appId));
    if (Object.keys(tempAppData).length > 0) {
        this.appData = tempAppData;
    } else {
        //initialize with empty template object
        saveData();
    }
}

//Function to display/refresh workouts
function refreshWorkoutsPane() {
    console.log(JSON.stringify(this.appData.workouts));
    if (this.appData['workouts'].length > 0) {
        document.getElementById('workoutName').innerHTML = this.appData['workouts'][workoutIndex].name;
    } else {
        document.getElementById('workoutName').innerHTML = "No workouts"
    }
}

//Function to start a workout
function startWorkout() {
    var today = new Date();
    var dateTime = getSummaryDateString(today);

    this.startStepCount = this.stepCountLatest;

    this.curWorkout = {
        "name": dateTime,
        "startTime": today,
        "endTime": null
    };
    var loggerRequests = {
        "appId": this.appId,
        "requests": [{
            "resource": "access_pedometer",
            "toggle": true
        }, {
            "resource": "access_location",
            "toggle": true
        }]
    };

    //Make the container start recording data
    DelUtils.setSensorLoggerRequest(JSON.stringify(loggerRequests));
    ons.notification.toast('Workout started!', {
        timeout: 2000
    });
}

//Function to stop a workout
function stopWorkout() {
    this.curWorkout.endTime = new Date();
    this.curWorkout.totalSteps = this.stepCountLatest - this.startStepCount;

    this.appData.workouts.push(this.curWorkout);
    ons.notification.toast('Workout saved!', {
        timeout: 2000
    });
    var loggerRequests = {
        "appId": this.appId,
        "requests": [{
            "resource": "access_pedometer",
            "toggle": false
        }, {
            "resource": "access_location",
            "toggle": false
        }]
    };

    //Make the container stop recording data
    DelUtils.setSensorLoggerRequest(JSON.stringify(loggerRequests));
    saveData();
}

function toggleWorkout() {
    if (!isWorkoutActive) {
        // Start a new workout
        isWorkoutActive = !isWorkoutActive;
        document.getElementById('workoutButton').textContent = "Stop Workout";

        startWorkout();
    } else {
        // Stop current workout
        isWorkoutActive = !isWorkoutActive;
        document.getElementById('workoutButton').textContent = "Start Workout";

        stopWorkout();
    }
}

//Function to save app-specific data
function saveData() {
    console.log("Saving: " + JSON.stringify(this.appData));
    DelUtils.setAppData(this.appId, JSON.stringify(this.appData));

    //forces refresh of the appData object
    getAppData();
    refreshWorkoutsPane();
}

/**
 * Function to clear stored app data - 
 * Deletes all configuration and previous workouts stored
 * in the container.
 */
function clearAppData() {

    DelUtils.setAppData(this.appId, JSON.stringify({ "workouts": [] }));
    getAppData();
    refreshWorkoutsPane();
}

//Function to draw location trace on map 
function drawOnMapPrevious() {
    if (this.locationTrace.length > 0) {
        var greenIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var redIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        this.prevLocationGroup.clearLayers();
        this.mapWorkout = this.mapWorkout.setView(locationTrace[0]);
        L.marker(locationTrace[0], { icon: greenIcon }).addTo(this.prevLocationGroup);
        L.marker(locationTrace[locationTrace.length - 1], { icon: redIcon }).addTo(this.prevLocationGroup);
        var polygon = L.polyline(this.locationTrace).addTo(this.prevLocationGroup);
        this.mapWorkout.addLayer(this.prevLocationGroup);
    }
}

function calculateTotalWorkoutDuration(start, end) {

    // Difference in milliseconds
    var msec = new Date(end).getTime() - new Date(start).getTime();

    // Convert diff to hours:mins:sec
    var hours = Math.floor(msec / 1000 / 60 / 60);
    msec -= hours * 1000 * 60 * 60;
    var mins = Math.floor(msec / 1000 / 60);
    msec -= mins * 1000 * 60;
    var sec = Math.floor(msec / 1000);

    return hours + ':' + mins + ':' + sec;
}

//Function to get filtered workouts
function showWorkoutOnMapPrevious() {

    console.log("Getting workout:" + JSON.stringify(this.appData.workouts[workoutIndex]));
    var data = DelUtils.getSensorData(this.appId,
        "access_location",
        this.appData.workouts[workoutIndex].startTime,
        this.appData.workouts[workoutIndex].endTime);

    var totalSteps = this.appData.workouts[workoutIndex].totalSteps;
    document.getElementById("step-count-workout").innerHTML = totalSteps;

    // Get total workout time and display on card
    document.getElementById('total-time-workout').innerHTML =
        calculateTotalWorkoutDuration(this.appData.workouts[workoutIndex].startTime,
            this.appData.workouts[workoutIndex].endTime);

    //set location trace
    processLocationHistory(data);
    //sraw location trace on map
    drawOnMapPrevious();
}

//Function to set the location trace object from data
function processLocationHistory(data) {
    data = JSON.parse(data);
    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var dateObject = new Date(obj['date']);
        var coordinates = JSON.parse(obj['reading']);
        this.locationTrace[i] = [parseFloat(coordinates["latitude"]), parseFloat(coordinates["longitude"])];
        this.lats.push(coordinates["latitude"]);
        this.longs.push(coordinates["longitude"]);
        this.timeSteps.push(dateObject.toLocaleTimeString());
    }
    console.log("Processed history:" + JSON.stringify(this.locationTrace));
}

//Button handler for next workout
function nextWorkout() {
    if (this.workoutIndex != this.appData.workouts.length - 1) {
        this.workoutIndex++;
    }
    else {
        ons.notification.alert('No more workouts!');
    }
    refreshWorkoutsPane();
}

//Button handler for previous workout
function previousWorkout() {
    if (this.workoutIndex != 0) {
        this.workoutIndex--;
    }
    else {
        ons.notification.alert('No previous workouts!');
    }
    refreshWorkoutsPane();
}

function getSummaryDateString(workoutTimestamp) {
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(workoutTimestamp);

    var formattedTimestamp = days[date.getDay(date)] + ", "
        + date.getDate() + " " + months[date.getMonth()] + ' '
        + date.getFullYear() + ', ' + date.getHours() + ':'
        + date.getMinutes() + ':' + date.getSeconds();

    return formattedTimestamp;
}

// Lifecycle hooks for page transition events
document.addEventListener('init', (event) => {
    var page = event.target;

    if (page.id === 'mymaps_index') {
        page.querySelector('#loadButton').onclick = () => {
            document.querySelector('#myNavigator').pushPage('./views/mymaps_previous_workout.tpl', { data: { title: 'Page 2' } });

            // Destroy previous workout map
            this.mapWorkout.eachLayer((layer) => {
                layer.remove();
            });
        };

    } else if (page.id === 'mymaps_prev') {
        initMapPrevWorkouts();
        showWorkoutOnMapPrevious();

        var summaryTimestamp = getSummaryDateString(this.appData['workouts'][workoutIndex].name);
        document.getElementById("summary-timestamp").innerHTML = summaryTimestamp;
    }
});

/**
 * Function to chart the user's heart rate during the workout
 */
function drawHrChart() {
    var ctx = document.getElementById("hr-chart").getContext('2d');

    // Get time and HR info
    var date = new Date()
    var hour = date.getHours()
    var mins = date.getMinutes()
    hrValues.push(hrData.heart_rate)
    hrTimestamps.push(hour + ":" + mins)

    // Shift older values
    if (hrValues.length > 10) {
        // Instead of shifting, try aggregating the readings so
        // we only have 10 points
    }

    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: hrTimestamps,
            datasets: [{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgb(54, 61, 96)',
                data: hrValues
            }]
        },
        options: {
            animation: false,
            legend: {
                display: false
            }
        }
    });
}