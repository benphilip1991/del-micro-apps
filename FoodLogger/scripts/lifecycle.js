/*********************************************************************************************************
 * 
 *      Lifecycle event listeners
 * 
**********************************************************************************************************/
function initApp() {

    // Check for any stored user preferences. If not, run init
    getAppData();
    
    currentDisplayedDate = new Date();
    setupFilteredMealData(getSummaryDateString(currentDisplayedDate));
}

/**
 * Lifecycle hooks for page transition events
 */
document.addEventListener('init', (event) => {

    // initApp(); // fetch app data and initialize

    var page = event.target;
    if (page.id === 'foodLogger_index') {
        page.querySelector('#add-breakfast').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_log_meals.html', {
                data: {
                    title: 'Breakfast',
                    mealType: 'breakfast',
                    loggedMealData: this.displayedDayProgress.meals.breakfast,
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });

            mealSection = "Breakfast";
        };
        page.querySelector('#add-lunch').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_log_meals.html', {
                data: {
                    title: 'Lunch',
                    mealType: 'lunch',
                    loggedMealData: this.displayedDayProgress.meals.lunch,
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });

            mealSection = "Lunch";
        };
        page.querySelector('#add-dinner').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_log_meals.html', {
                data: {
                    title: 'Dinner',
                    mealType: 'dinner',
                    loggedMealData: this.displayedDayProgress.meals.dinner,
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });

            mealSection = "Dinner";
        };
        page.querySelector('#add-snack').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_log_meals.html', {
                data: {
                    title: 'Snacks',
                    mealType: 'snacks',
                    loggedMealData: this.displayedDayProgress.meals.snacks,
                    date: getSummaryDateString(currentDisplayedDate)
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

    } else if (page.id === 'foodLogger_log_meal' ) {

        // init_section_title();
        setPageTitle();
        setupPastLoggedMeals();
    }
    // initCamera();
});


/**
 * Tap event listener
 */
document.addEventListener('tap', (event) => {
    let item = event.target

    // Only possible from the add/edit meals page
    // Set the elements with the values
    if(item.matches(".loggedItem")) {
        showToast(`Item tapped : ${JSON.stringify(item.getAttribute("itemIndex"))}`)
    }
})


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
    } else if("foodLogger_index" == pushed_page) {
        initApp();
    }
});

// Perform after popping a view from the viewport
document.addEventListener('postpop', (event) => {
    let current_page = document.querySelector("#app-navigator").topPage.id
    console.log(`Back to page : ${current_page}`)
    if ("foodLogger_index" == current_page) {
        setupFilteredMealData(getSummaryDateString(currentDisplayedDate))
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

        dailyTarget = Number(event.target.value);
    });

}
