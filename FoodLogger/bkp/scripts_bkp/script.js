var userName = '';
var appId = '';

var dailyTarget = 2000;
var currentCals = 0;

var mealSection = '';

var streaming = false;
var width = 400;
var height = 400;
var video;
var canvas;
var photo;
var startButton;

// App data template
var appData = {
    "is_first_run": true,
    "current_daily_goals": 0,
    "current_day_progress": {},
    "logged_meals": [] // several current_day_progress objects
}

// Current day progress template
var currentDayProgress = {
    "date": "",
    "total_cals": "",
    "target_cals": "",
    "meals": {
        "breakfast": [], // store several meal items
        "lunch": [],
        "dinner": [],
        "snacks": []
    }
}


// Meal item template
var mealItem = {
    "timestamp": "",
    "item": "",
    "calories": ""
}


// Store currently displayed date
var currentDisplayedDate;


/*********************************************************************************************************
 * 
 *      App setup and initialization, interface with DelUtils
 * 
**********************************************************************************************************/
function setAppId(appId) {
    this.appId = appId;
}

//Function to initialize app 
function initApp() {

    // Check for any stored user preferences. If not, run init
    getAppData();

    setupDisplayedFoodLog(currentDisplayedDate = new Date());
}

/**
 * Push the initialization page
 */
function pushFirstRun() {
    document.querySelector('#app-navigator').pushPage('./views/fl_initial_setup.html', {
        data: {
            title: 'Initial Setup'
        }
    });
}

/**
 * Function to save app-specific data
 */
function saveDataToContainer(dataToStore) {
    console.log("Saving: " + JSON.stringify(dataToStore));
    DelUtils.setAppData(this.appId, JSON.stringify(dataToStore));

    //forces refresh of the appData object
    getAppData();
}


/**
 * Function to get all app specific data
 */
function getAppData() {
    tempAppData = JSON.parse(DelUtils.getAppData(this.appId));

    if (null != tempAppData && Object.keys(tempAppData).length > 0) {
        // If the app was closed without setting up
        if (tempAppData.is_first_run) {
            console.log("App launched before, but not initialized properly");
            pushFirstRun();
        }
        this.appData = tempAppData;
    } else {
        saveDataToContainer(this.appData); // initialize with template data. This is updated later
        pushFirstRun();
    }
}



/*********************************************************************************************************
 * 
 *      Tracker management, app specific contents
 * 
**********************************************************************************************************/

/**
 * Update Meal Logger title
 */
function init_section_title() {
    document.getElementById("meal-cat").innerHTML = mealSection;
}

/**
 * Setup the displayed food logs
 */
function setupDisplayedFoodLog(currentDisplayedDate) {

    getAppData(); // dirty; force update app data

    document.getElementById("loggedDay").innerHTML = getSummaryDateString(currentDisplayedDate);
    updateCalorieTracker();
}

/**
 * Calorie management - updates the labels
 * TODO: Update displayed meals as well
 */
function updateCalorieTracker() {
    document.getElementById("daily-target").innerHTML = this.appData.current_daily_goals;
    document.getElementById("current-progress").innerHTML = currentCals;

    // Parse the meals by date and display them here
}


/**
 * Fetch and set current calorie goals in the edit panel
 */
function setCurrentCalorieGoals() {
    console.log("Getting current calorie goals");
    document.getElementById('calorie-slider').setAttribute('value', this.appData.current_daily_goals);
    document.getElementById('current-goal').innerHTML = this.appData.current_daily_goals;
}


/**
 * Save edited user goals
 */
function saveEditedUserGoals() {
    console.log("Saving updated user goals");

    userAppData = this.appData;
    userAppData.is_first_run = false;
    userAppData.current_daily_goals = dailyTarget;

    console.log(JSON.stringify(userAppData));

    // Store initial setup data in the container
    saveDataToContainer(userAppData);

    document.querySelector('#app-navigator').popPage();
}


/**
 * Load previous logged meals
 */
function loadLoggedMeals(loadDay) {

}



/*********************************************************************************************************
 * 
 *      Lifecycle event listeners
 * 
**********************************************************************************************************/

/**
 * Lifecycle hooks for page transition events
 */
document.addEventListener('init', (event) => {

    initApp(); // fetch app data and initialize

    var page = event.target;
    if (page.id === 'foodLogger_index') {
        page.querySelector('#add-breakfast').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_breakfast.html', {
                data: {
                    title: 'Page 2'
                }
            });

            mealSection = "Breakfast";
        };
        page.querySelector('#add-lunch').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_lunch.html', {
                data: {
                    title: 'Page 2'
                }
            });

            mealSection = "Lunch";
        };
        page.querySelector('#add-dinner').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_dinner.html', {
                data: {
                    title: 'Page 2'
                }
            });

            mealSection = "Dinner";
        };
        page.querySelector('#add-snack').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_snack.html', {
                data: {
                    title: 'Page 2'
                }
            });

            mealSection = "Snack";
        };
        page.querySelector("#edit-goal").onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_edit_goals.html', {
                data: {
                    title: 'Edit Goals'
                }
            });
        }

    } else if (page.id === 'foodLogger_breakfast' || page.id === 'foodLogger_lunch'
        || page.id === 'foodLogger_dinner' || page.id === 'foodLogger_snack') {

        init_section_title();
        // initCamera();
    }
});


/**
 * Handle onsen stack events
 */
// Perform after pushing a view into the viewport
document.addEventListener('postpush', (event) => {
    let pushed_page = document.querySelector("#app-navigator").topPage.id
    console.log(pushed_page)

    if ("foodLogger_initial_setup" == pushed_page) {
        attachGoalSliderListener();
        setCurrentCalorieGoals();

    } else if ("foodLogger_edit_goals" == pushed_page) {
        attachGoalSliderListener();
        setCurrentCalorieGoals();
    }
});

// Perform after popping a view from the viewport
document.addEventListener('postpop', (event) => {
    let popped_page = document.querySelector("#app-navigator").topPage.id
    console.log(`Popped Page : ${popped_page}`)
    if ("foodLogger_index" == popped_page) {
        setupDisplayedFoodLog(new Date());
    }
});

/**
 * Attach slider event listener when the edit goals component is loaded
 */
function attachGoalSliderListener() {
    /**
    * Handle calorie slider events
    */
    document.querySelector('#calorie-slider').addEventListener('input', (event) => {
        document.getElementById('current-goal').innerHTML = event.target.value

        if (event.target.value < 1200) {
            document.getElementById('cal-warning').innerHTML = "Going this low is not recommended."
        } else {
            document.getElementById('cal-warning').innerHTML = ""
        }

        dailyTarget = event.target.value
    });

}



/*********************************************************************************************************
 * 
 *      Utilities
 * 
**********************************************************************************************************/

/**
 * Manage dates and displayed content
 */
function getSummaryDateString(currentDisplayedDate, addTimeOfDay = false) {
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(currentDisplayedDate);

    var formattedTimestamp = days[date.getDay(date)] + ", "
        + months[date.getMonth()] + ' ' + date.getDate() + ", "
        + date.getFullYear();

    if (addTimeOfDay) {
        formattedTimestamp = formattedTimestamp + ', ' + date.getHours() + ':'
            + date.getMinutes() + ':' + date.getSeconds();
    }

    return formattedTimestamp;
}

/**
 * Setup stored content from the previous day
 */
function getPreviousDay() {
    currentDisplayedDate.setDate(currentDisplayedDate.getDate() - 1);
    document.getElementById("loggedDay").innerHTML = getSummaryDateString(currentDisplayedDate);
}

/**
 * Setup stored content from the 'next' day
 */
function getNextDay() {
    currentDisplayedDate.setDate(currentDisplayedDate.getDate() + 1);
    document.getElementById("loggedDay").innerHTML = getSummaryDateString(currentDisplayedDate);
}