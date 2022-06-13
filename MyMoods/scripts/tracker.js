/**
 * Tracker functions for managing user moods
 */

var breakdownChart = null;
var moodCountChart = null;

/**
 * Setup the dashboard for a given date
 * @param {String} dateToFetch 
 */
function setupFilteredMoodData(dateToFetch, isDataSaved = false) {

    let filteredData = getFilteredMoodData(dateToFetch);
    this.displayedDayProgress = filteredData;

    setupDisplayedMoodLogs(this.displayedDayProgress, isDataSaved);
}


/**
 * Setup the data for the selected date
 * @param {JSON} dataToDisplay 
 */
function setupDisplayedMoodLogs(dataToDisplay, isDataSaved = false) {

    // If empty mood, push daily log
    // Reset to the appropriate pages - no need to maintain app state here.
    if (dataToDisplay.mood == "") {
        document.querySelector('#app-navigator').resetToPage('./views/daily_log.html', {
            pop: true
        });
    } else {
        // If not empty, show the stats page
        if (!isDataSaved)
            return;

        document.querySelector('#app-navigator').resetToPage('./views/stats.html', {
            pop: true,
            data: {
                subsequent_launch: true
            }
        });
    }
}


/**
 * Setup the currently displayed day's activities
 * 
 * @param {JSON} dataToDisplay 
 */
function setupDisplayedDailyLog(dataToDisplay) {

    console.log(JSON.stringify(dataToDisplay.activities));

    let _selections = dataToDisplay.activities.social
        .concat(dataToDisplay.activities.food)
        .concat(dataToDisplay.activities.health)


    // Render selections in the panel
    // get btn_selection's parent node and set the class to grouping-selected and isSelected = true
    _selections.forEach(item => {
        let _element = document.querySelector(`#btn_${item}`).parentNode;

        _element.setAttribute("class", "grouping-selected");
        _element.setAttribute("isSelected", "true")
    })
}

/**
 * Render the data for the month
 * This can be fetched from the appData
 */
function renderMonthlyMoodChart() {

    let _chartAreaMonthlyMood = document.querySelector("#monthly-mood-chart").getContext("2d");
    let _loggedMoods = this.appData.logged_moods;

    let _noOfDays = Number(new Date(currentDisplayedDate.getYear(), currentDisplayedDate.getMonth(), 0).getDate())
    let _xLabels = Array.from({ length: _noOfDays }, (_, i) => i + 1);

    var _dataVals = [];
    _loggedMoods.forEach(item => {
        _dataVals.push({ x: new Date(item.date).getDate(), y: iconLookup_emoji[item.mood].val })
    })

    let _dataSet = {
        labels: _xLabels,
        datasets: [{
            label: 'Mood',
            data: _dataVals,
            fill: true,
            borderColor: ['#329efc'],
            borderWidth: 1,
            tension: 0.1
        }]
    }

    let config = {
        type: 'line',
        data: _dataSet,
        options: {
            animation: false,
            parsing: {
                xAxisKey: 'x',
                yAxisKey: 'y'
            },
            scales: {
                yAxes: {
                    distribution: 'series',
                    ticks: {
                        align: 'center',
                        autoSkip: false,
                        min: 0,
                        max: 6,
                        stepSize: 1,
                        callback: function (label, index, labels) {
                            switch (label) {
                                case 0:
                                    return '';
                                case 1:
                                    return '😖';
                                case 2:
                                    return '🙁';
                                case 3:
                                    return '😐';
                                case 4:
                                    return '🙂';
                                case 5:
                                    return '😄';
                                case 6:
                                    return '';
                            }
                        }
                    }
                }
            }
        }
    }

    // Destroy canvas before redrawing
    if (null != breakdownChart) {
        breakdownChart.destroy();
    }
    breakdownChart = new Chart(_chartAreaMonthlyMood, config)
}

/**
 * Render mood count
 */
function renderMoodCount() {

    let _chartAreaMoodCount = document.querySelector("#mood-count-chart").getContext("2d");
    let _loggedMoods = this.appData.logged_moods;

    let _chartLabels = ["😄", "🙂", "😐", "🙁", "😖"];
    var _moodCount = [0, 0, 0, 0, 0];

    _loggedMoods.forEach(item => {
        _moodCount[_chartLabels.indexOf(iconLookup_emoji[item.mood].emoji)] += 1;
    })

    let _dataSet = {
        labels: _chartLabels,
        datasets: [{
            label: 'Mood Count',
            data: _moodCount,
            backgroundColor: ["#28ed8b", "#cced28", "#edcc28", "#ed8428", "#ed3528"]
        }]
    }

    let configMoodCount = {
        type: 'doughnut',
        data: _dataSet,
        options: {
            animation: false
        }
    }

    if (null != moodCountChart) {
        moodCountChart.destroy();
    }

    console.log(`Mood Count Config : ${JSON.stringify(configMoodCount)}`)
    moodCountChart = new Chart(_chartAreaMoodCount, configMoodCount)
}


/**
 * Handle item clicks - store in appropriate list and highlight if not already done
 * @param {*} activityId 
 */
function activitySelect(item, activityId) {
    let elementParent = item.parentNode;

    // Need to go 3 levels up from button ----> ons-col -> ons-row -> div
    // console.log(`${activityId} ------> Category : ${elementParent.parentNode.parentNode.getAttribute("id")}`)

    // Update the relevant lists
    let _category = elementParent.parentNode.parentNode.getAttribute("id").replace('_list', '');
    let _activity = activityId.replace('btn_', '');

    if (!this.displayedDayProgress.activities[_category].includes(_activity)
        && elementParent.getAttribute("isSelected") == "false") {
        this.displayedDayProgress.activities[_category].push(_activity)

        elementParent.setAttribute("isSelected", "true");
        elementParent.setAttribute("class", "grouping-selected")

    } else if (this.displayedDayProgress.activities[_category].includes(_activity)
        && elementParent.getAttribute("isSelected") == "true") {

        let _idx = this.displayedDayProgress.activities[_category].indexOf(_activity)
        if (_idx > -1) {
            this.displayedDayProgress.activities[_category].splice(_idx, 1)
        }

        elementParent.setAttribute("isSelected", "false");
        elementParent.setAttribute("class", "grouping")
    }
}


/**
 * Store the mood for that day in the daily object
 * 
 * @param {String} mood 
 */
function moodSelect(mood) {

    this.displayedDayProgress.mood = mood;
}


/**
 * Store the mood/activity details - if current date, store as today. 
 * Else update the appropriate day
 * 
 * @param {JSON} dataToStore 
 */
function storeMoodRecords(dataToStore) {

    // Today
    console.log(JSON.stringify(dataToStore))
    if (dataToStore.date == getSummaryDateString(this.currentDisplayedDate)) {
        this.appData.current_day_progress = dataToStore
        this.current_day_progress = dataToStore
    }

    // check if any element in the logged_moods matches the given date
    var _recordExists = false;
    var _idx = -1;
    this.appData.logged_moods.forEach((item, index) => {
        if (item.date == dataToStore.date) {
            _idx = index;
            _recordExists = true;
        }
    })

    if (!_recordExists) {
        this.appData.logged_moods.push(dataToStore);
    } else {
        this.appData.logged_moods[_idx] = dataToStore;
    }

    saveDataToContainer(this.appData);
}