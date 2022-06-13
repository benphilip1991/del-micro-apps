/**
 * Lifecycle event listeners
 */
function initApp() {

    // get app data and get started
    getAppData();
    this.currentDisplayedDate = new Date();

    // Need to read from the app file to check for data -- read and assign
    setupFilteredMoodData(getSummaryDateString(currentDisplayedDate));
}


/**
 * Lifecycle hooks for page transition
 */
document.addEventListener('init', (event) => {

    var page = event.target;

    // first template loaded through the launch page
    if (page.id === 'mymoods_daily_log') {
        document.querySelector("#date_today").innerHTML = getSummaryDateString(this.currentDisplayedDate);

        page.querySelector('#btn_rad').onclick = () => {
            moodSelect("rad");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '😄',
                    mood: 'rad',
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_good').onclick = () => {
            moodSelect("good");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '🙂',
                    mood: 'good',
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_meh').onclick = () => {
            moodSelect("meh");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '😐',
                    mood: 'meh',
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_bad').onclick = () => {
            moodSelect("bad");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '🙁',
                    mood: 'bad',
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_awful').onclick = () => {
            moodSelect("awful");
            document.querySelector('#app-navigator').pushPage('./views/daily_update.html', {
                data: {
                    title: '😖',
                    mood: 'awful',
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });
        };
        page.querySelector('#btn_continue').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/stats.html', {
                data: {
                    date: getSummaryDateString(currentDisplayedDate)
                }
            });
        };

    } else if (page.id === "mymoods_daily_update") {

        setMoodTitle();
    } else if (page.id === "mymoods_stats") {

        setupDate(this.currentDisplayedDate);
        page.querySelector('#loggedDay').onclick = () => {
            document.querySelector('#app-navigator').pushPage('./views/daily_log.html', {
                data: {
                    date: getSummaryDateString(currentDisplayedDate),
                    pastRecord: this.displayedDayProgress
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
    console.log(`Subsequent Launch : ${pushed_page.data.subsequent_launch}`)

    if ("mymoods_stats" == pushed_page.id) {

        if (!pushed_page.data.subsequent_launch) {
            // setupDate(this.currentDisplayedDate);
            initApp();
        } 
        renderMoodCount();
        renderMonthlyMoodChart();

    } else if ("mymoods_daily_log" == pushed_page.id) {
        document.querySelector("#date_today").innerHTML = getSummaryDateString(this.currentDisplayedDate);
    } else if ("mymoods_daily_update" == pushed_page.id) {

        // need to setup the buttons and views
        setupDisplayedDailyLog(this.displayedDayProgress);
    }
})