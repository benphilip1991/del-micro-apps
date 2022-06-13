/**
 * Lifecycle event listeners
 */
function initApp() {

    // get app data and get started
    getAppData();
    this.currentDisplayedDate = new Date();
}


/**
 * Lifecycle hooks for page transition
 */
document.addEventListener('init', (event) => {

    var page = event.target;

    // first template loaded through the launch page
    if (page.id === 'mymoods_daily_log') {
        var pastRecord = document.querySelector("#app-navigator").topPage.data.past_record;
        document.querySelector("#date_today").innerHTML = getPrettifiedDateString(this.currentDisplayedDate);

        page.querySelector('#btn_rad').onclick = () => {
            moodSelect("rad");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '😄',
                    mood: 'rad',
                    date: getSummaryDateString(this.currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_good').onclick = () => {
            moodSelect("good");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '🙂',
                    mood: 'good',
                    date: getSummaryDateString(this.currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_meh').onclick = () => {
            moodSelect("meh");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '😐',
                    mood: 'meh',
                    date: getSummaryDateString(this.currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_bad').onclick = () => {
            moodSelect("bad");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '🙁',
                    mood: 'bad',
                    date: getSummaryDateString(this.currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_awful').onclick = () => {
            moodSelect("awful");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '😖',
                    mood: 'awful',
                    date: getSummaryDateString(this.currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_continue').onclick = () => {
            document.querySelector('#app-navigator').resetToPage('./views/stats.html', {
                data: {
                    date: getSummaryDateString(this.currentDisplayedDate),
                    is_first_launch: false
                }
            });
        };

    } else if (page.id === "mymoods_daily_update") {

        setMoodTitle();

    } else if (page.id === "mymoods_stats") {

        // Called whenever the page is initialized after rendering in the viewport
        setupFilteredMoodData(getSummaryDateString(currentDisplayedDate), false);
        renderMoodCount();
        renderMonthlyMoodChart();

        setupDate(this.currentDisplayedDate);
        
        // Click listener for the stats page date - allow edits
        page.querySelector('#loggedDay').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/daily_log.html', {
                data: {
                    date: getSummaryDateString(this.currentDisplayedDate),
                    past_record: this.displayedDayProgress
                }
            });
        };
    }
});

/**
 * Perform action after a page is pushed into the navigator
 */
document.addEventListener('postpush', (event) => {
    let pushed_page = document.querySelector("#app-navigator").topPage

    if ("mymoods_stats" == pushed_page.id) {

        console.log(`Is First Launch : ${pushed_page.data.is_first_launch}`)
        if (typeof pushed_page.data.is_first_launch == "undefined") {
            console.log(`Initializing App`)
            initApp();
        }
    } else if ("mymoods_daily_update" == pushed_page.id) {

        // need to setup the buttons and views
        setupDisplayedDailyLog(this.displayedDayProgress);
    }
})