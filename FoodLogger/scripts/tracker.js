/*********************************************************************************************************
 * 
 *      Tracker management, app specific contents
 * 
**********************************************************************************************************/
var breakdownChart = null;

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
 * Calculate total calories from the passed list
 * @param {Array} mealList 
 * @returns 
 */
function getTotalCalories(mealList) {

    var res = 0;
    mealList.forEach(item => {
        res += item.calories
    });

    return res;
}


/**
 * List each meal item in the appropriate list
 * 
 * @param {Array} mealList 
 * @param {Element} viewRoot 
 */
function listMealItems(mealList, viewRoot) {

    cleanViewNode(viewRoot);

    mealList.forEach(item => {
        let listItemNode = document.createElement("ons-list-item");
        listItemNode.modifier = "nodivider";

        let mealName = document.createElement("div");
        mealName.setAttribute("class", "left");
        mealName.innerHTML = item.item;

        let mealCals = document.createElement("div");
        mealCals.setAttribute("class", "right");
        mealCals.innerHTML = item.calories + "kcal";

        listItemNode.appendChild(mealName);
        listItemNode.appendChild(mealCals);

        viewRoot.appendChild(listItemNode);
    })
}


/**
 * Setup the dashboard for a given date
 * @param {String} dateToFetch 
 */
function setupFilteredMealData(dateToFetch) {

    let filteredData = getFilteredMealData(dateToFetch);
    this.displayedDayProgress = filteredData;

    console.log(`setupFilteredMealData setting up data : ${JSON.stringify(filteredData)}`)
    setupDisplayedFoodLog(filteredData)
}


/**
 * Setup the displayed food logs
 * On first run, initialize meals for the current day
 */
function setupDisplayedFoodLog(dataToDisplay) {

    let mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
    let mealsToDisplay = dataToDisplay.meals;

    document.getElementById("loggedDay").innerHTML = getSummaryDateString(dataToDisplay.date);
    updateCalorieProgressTracker(dataToDisplay);

    // Start setting up the index - breakfast, lunch, dinner and snacks
    // Need to calculate total for breakfast
    mealTypes.forEach((item) => {
        document.querySelector(`#${item}_total_cals`).innerHTML = getTotalCalories(mealsToDisplay[`${item}`]);
        listMealItems(mealsToDisplay[`${item}`], document.querySelector(`#${item}_list`));
    })

    renderDailyBreakdown(dataToDisplay);
}


/**
 * Render daily breakdown chart
 * 
 * @param {String} chartType - doughnut/bar
 */
function renderDailyBreakdown(dataToDisplay, chartType = "doughnut") {

    var chartArea = document.querySelector("#breakdown-chart").getContext("2d");

    if (null == dataToDisplay) {
        dataToDisplay = this.displayedDayProgress;
    }

    let mealsToDisplay = dataToDisplay.meals;
    let mealLabels = ["Breakfast", "Lunch", "Dinner", "Snacks"];
    var calData = [];

    mealLabels.forEach(item => {
        calData.push(getTotalCalories(mealsToDisplay[`${item.toLowerCase()}`]));
    })

    let dataSet = {
        labels: mealLabels,
        datasets: [{
            label: 'Calorie Breakdown',
            backgroundColor: ['#15b9e6', '#15e681', '#e6ce15', '#e67e15'],
            borderColor: ['#15b9e6', '#15e681', '#e6ce15', '#e67e15'],
            data: calData
        }]
    };

    let config = {
        type: chartType,
        data: dataSet,
        options: {
            animation: false,
        }
    }

    // Destroy canvas before redrawing
    if (null != breakdownChart) {
        breakdownChart.destroy();
    }
    breakdownChart = new Chart(chartArea, config);
}

/**
 * Calorie management - show the target and current progress for each day
 */
function updateCalorieProgressTracker(dataToDisplay) {

    if (this.currentDayProgress.date == dataToDisplay.date) {
        dataToDisplay.target_cals = this.appData.current_daily_goals
    }

    document.getElementById("daily-target").innerHTML = dataToDisplay.target_cals;
    document.getElementById("current-progress").innerHTML = dataToDisplay.total_cals.toFixed(2);

    if (dataToDisplay.target_cals - dataToDisplay.total_cals < 0) {
        document.getElementById("current-progress-box").setAttribute("class", "data-box-warn");
    } else {
        document.getElementById("current-progress-box").setAttribute("class", "data-box");
    }
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
 * Record logged item and display in the main window
 * When the user submits the meal, it is also stored in the app 
 * file storage
 *  
 * @param {JSON} mealObject 
 * @param {String} mealType 
 * @param {String} mealDate
 */
function logMeal(mealObject, mealType, mealDate) {

    var loggedMealObject = {
        "date": "",
        "total_cals": 0,
        "target_cals": 0,
        "meals": {
            "breakfast": [], // store several meal items
            "lunch": [],
            "dinner": [],
            "snacks": []
        }
    }

    console.log(`Saving ${mealType} for ${mealDate}`)

    // Check if a similar object exists in appData with the same date-stamp
    var recordExists = false;
    var idx = 0;
    this.appData.logged_meals.forEach((item, index) => {
        if (item.date == mealDate) {
            console.log(`Found log for the same day at index ${index}`);
            idx = index;
            recordExists = true;
            Object.assign(loggedMealObject, item)
        }
    });

    // Build today's object and store in memory
    loggedMealObject.date = getSummaryDateString(mealDate);

    // Only when dealing with a new object
    // Else use the existing value (for adding to previously logged meals)
    if (loggedMealObject.target_cals == 0) {
        loggedMealObject.target_cals = Number(this.appData.current_daily_goals);
    }

    // Save the meal list for the appropriate meal type
    loggedMealObject.meals[mealType] = mealObject;

    // Need to recalculate total calories from all Meal Objects
    var res = 0;
    ["breakfast", "lunch", "dinner", "snacks"].forEach(mealType => {
        loggedMealObject.meals[mealType].forEach(item => {
            res += Number(item.calories);
        })
    });
    loggedMealObject.total_cals = res;

    if (mealDate == getSummaryDateString(new Date())) {
        // this.appData.current_day_progress = loggedMealObject;
        Object.assign(this.appData.current_day_progress, loggedMealObject)
    }

    if (!recordExists) {
        this.appData.logged_meals.push(loggedMealObject);
    } else {
        this.appData.logged_meals[idx] = loggedMealObject;
    }

    saveDataToContainer(appData);
}

/**
 * Function called from the new meal logging component.
 * Used to list the previously logged meals in a given category
 * 
 * @param {*} mealItemValue 
 * @param {*} mealCalsValue 
 */
function listPastLoggedItems(mealItemValue, mealCalsValue, listIndex) {

    document.querySelector(`#logged_meal_list_container`).style = "display: block";

    let listItemNode = document.createElement("ons-list-item");
    listItemNode.setAttribute("tappable");

    let listItemGestureDetector = document.createElement("ons-gesture-detector");

    let listItemSpan = document.createElement("span");
    listItemSpan.setAttribute("class", "loggedItem");
    listItemSpan.setAttribute("itemIndex", listIndex);
    listItemSpan.setAttribute("mealItemValue", mealItemValue);
    listItemSpan.setAttribute("mealCalsValue", mealCalsValue);

    let mealsListing = document.createTextNode(`${mealItemValue}  (${mealCalsValue}KCal)`);

    listItemSpan.appendChild(mealsListing);
    listItemGestureDetector.appendChild(listItemSpan);
    listItemNode.appendChild(listItemGestureDetector);

    document.querySelector(`#logged_meal_list`).appendChild(listItemNode);
}


/**
 * Append meal items to logged list and render
 * 
 * @param {*} mealItem 
 * @param {*} mealCals 
 * @param {*} mealList 
 * @returns 
 */
function addMealItem(mealItem, mealCals, mealList) {

    let timeStamp = getSummaryDateString(new Date(), true, true);
    if (typeof mealItem == "object" && typeof mealCals == "object") {
        if (mealItem.value.length > 0 && mealCals.value.length > 0) {

            // prepareLoggedList(mealItem.value, mealCals.value, mealList);

            let mealObject = {
                "timestamp": timeStamp,
                "item": mealItem.value,
                "calories": Number(mealCals.value)
            }
            mealList.push(mealObject);

            listPastLoggedItems(mealItem.value, mealCals.value, mealList.length - 1);

            mealItem.value = '';
            mealCals.value = '';

            return mealList;
        } else {
            showToast("Please enter a valid item!");
        }
    } else {
        // String passed as values
        let mealObject = {
            "timestamp": timeStamp,
            "item": mealItem,
            "calories": Number(mealCals)
        }
        mealList.push(mealObject);

        listPastLoggedItems(mealItem, mealCals, mealList.length - 1);
        return mealList;
    }
}

/**
 * Get an HTML element containig the meal data for a searched item
 * Attach a listener to add item to meal list when tapped
 * 
 * @param {JSON} mealDetails 
 */
function getSearchedMealItemNode(mealDetails) {

    let mealListNode = document.createElement("div");

    mealDetails.forEach((item) => {
        let mealItemNode = document.createElement("ons-list-item");
        mealItemNode.setAttribute("tappable");

        let listItemGestureDetector = document.createElement("ons-gesture-detector");

        let listItemSpan = document.createElement("span");
        listItemSpan.setAttribute("class", "searchedItem");
        listItemSpan.setAttribute("mealItemValue", item.label);
        listItemSpan.setAttribute("mealCalsValue", item.nutrients.ENERC_KCAL.toFixed(2));

        var brand = "";
        if (item.hasOwnProperty("brand"))
            brand = ` (${item.brand})`;

        let mealsListing = document.createTextNode(`${item.label}${brand} - ${item.nutrients.ENERC_KCAL.toFixed(2)}KCal`);

        listItemSpan.appendChild(mealsListing);
        listItemGestureDetector.appendChild(listItemSpan);
        mealItemNode.appendChild(listItemGestureDetector);

        mealListNode.appendChild(mealItemNode);
    })


    return mealListNode;
}