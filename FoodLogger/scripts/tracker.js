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
 * Update Meal Logger title
 */
function init_section_title() {
    document.getElementById("meal-cat").innerHTML = mealSection;
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
 * Setup the displayed food logs
 * On first run, initialize meals for the current day
 */
function setupDisplayedFoodLog(currentDisplayedDate) {

    let mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
    let mealsToDisplay = this.displayedDayProgress.meals;

    document.getElementById("loggedDay").innerHTML = getSummaryDateString(currentDisplayedDate);
    updateCalorieTracker();

    // Start setting up the index - breakfast, lunch, dinner and snacks
    // Need to calculate total for breakfast
    mealTypes.forEach((item) => {
        document.querySelector(`#${item}_total_cals`).innerHTML = getTotalCalories(mealsToDisplay[`${item}`]);
        listMealItems(mealsToDisplay[`${item}`], document.querySelector(`#${item}_list`));
    })

    renderDailyBreakdown();
}

/**
 * Render daily breakdown chart
 * 
 * @param {String} chartType - doughnut/bar
 */
function renderDailyBreakdown(chartType = "doughnut") {

    var chartArea = document.querySelector("#breakdown-chart").getContext("2d");

    let mealsToDisplay = this.displayedDayProgress.meals;
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
        data: dataSet
    }

    // Destroy canvas before redrawing
    if (null != breakdownChart) {
        breakdownChart.destroy();
    }
    breakdownChart = new Chart(chartArea, config);
}

/**
 * Calorie management - updates the labels
 * TODO: Update displayed meals as well
 */
function updateCalorieTracker() {
    document.getElementById("daily-target").innerHTML = this.displayedDayProgress.target_cals;
    document.getElementById("current-progress").innerHTML = this.displayedDayProgress.total_cals;

    if (this.displayedDayProgress.target_cals - this.displayedDayProgress.total_cals < 0) {
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
 */
function logMeal(mealObject, mealType) {

    // Build today's object and store in memory
    currentDayProgress.date = getSummaryDateString(new Date());
    currentDayProgress.target_cals = Number(this.appData.current_daily_goals);

    var res = currentDayProgress.total_cals;
    mealObject.forEach(item => {
        res += Number(item.calories);

        if ("breakfast" === mealType) {
            currentDayProgress.meals.breakfast.push(item);
        } else if ("lunch" === mealType) {
            currentDayProgress.meals.lunch.push(item);
        } else if ("dinner" === mealType) {
            currentDayProgress.meals.dinner.push(item);
        } else if ("snacks" === mealType) {
            currentDayProgress.meals.snacks.push(item);
        }
    });

    currentDayProgress.total_cals = res;
    appData.current_day_progress = currentDayProgress;

    // Check if a similar object exists in appData with the same date-stamp
    var recordExists = false;
    var idx = 0;
    appData.logged_meals.forEach((item, index) => {
        if (item.date === currentDayProgress.date) {
            console.log(`Found log for the same day at index ${index}`);
            idx = index;
            recordExists = true;
        }
    });

    if (!recordExists) {
        appData.logged_meals.push(currentDayProgress);
    } else {
        appData.logged_meals[idx] = currentDayProgress;
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
function listPastLoggedItems(mealItemValue, mealCalsValue) {

    document.querySelector(`#logged_meal_list_container`).style = "display: block";
    
    let listItemNode = document.createElement("ons-list-item");
    let listItem = document.createTextNode(`${mealItemValue}, ${mealCalsValue} kcal`);
    listItemNode.appendChild(listItem);

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

    if (mealItem.value.length > 0 && mealCals.value.length > 0) {

        let timeStamp = getSummaryDateString(new Date(), true, true);
        let mealObject = {
            "timestamp": timeStamp,
            "item": mealItem.value,
            "calories": Number(mealCals.value)
        }
        mealList.push(mealObject);

        listPastLoggedItems(mealItem.value, mealCals.value)

        mealItem.value = '';
        mealCals.value = '';

        return mealList;
    } else {
        showToast("Please enter a valid item!");
    }
}