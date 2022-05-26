/*********************************************************************************************************
 * 
 *      Lifecycle event listeners
 * 
**********************************************************************************************************/
function initApp() {

    // Check for any stored user preferences. If not, run init
    getAppData();

    setupDisplayedFoodLog(currentDisplayedDate = new Date());
}

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
                    title: 'Breakfast'
                }
            });

            mealSection = "Breakfast";
        };
        page.querySelector('#add-lunch').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_lunch.html', {
                data: {
                    title: 'Lunch'
                }
            });

            mealSection = "Lunch";
        };
        page.querySelector('#add-dinner').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_dinner.html', {
                data: {
                    title: 'Dinner'
                }
            });

            mealSection = "Dinner";
        };
        page.querySelector('#add-snack').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/fl_snack.html', {
                data: {
                    title: 'Snacks'
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
    let current_page = document.querySelector("#app-navigator").topPage.id
    console.log(`Back to page : ${current_page}`)
    if ("foodLogger_index" == current_page) {
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

        dailyTarget = Number(event.target.value);
    });

}
