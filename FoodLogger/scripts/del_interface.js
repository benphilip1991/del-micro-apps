/*********************************************************************************************************
 * 
 *      App setup and initialization, interface with DelUtils
 * 
**********************************************************************************************************/

/**
 * Function to save app-specific data
 * TODO - keeping appData in memory lean
 * Read from the phone and update before storing again.
 * The app won't keep a copy of all past records
 */
function saveDataToContainer(dataToStore) {
    // console.log("Saving: " + JSON.stringify(dataToStore));
    DelUtils.setAppData(this.appId, JSON.stringify(dataToStore));

    //forces refresh of the appData object
    getAppData();
    setupFilteredMealData(getSummaryDateString(currentDisplayedDate));
}


/**
 * Filter the recorded data and get the record from the given
 * date
 * 
 * @param {Date} dateToFetch 
 */
function getFilteredMealData(dateToFetch) {

    var filteredData = {
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

    console.log(`Getting filtered data for : ${dateToFetch}`)
    this.appData.logged_meals.every(item => {
        if (getSummaryDateString(dateToFetch) == item.date) {
            Object.assign(filteredData, item);
            return false;
        } else {
            return true; // else array.every will quit after the first run
        }
    });

    filteredData.date = dateToFetch;
    return filteredData;
}


/**
 * Function to get all app specific data
 * TODO - keep appData lean - can become very heavy if left unchecked
 * For previous and next day views, use another object - displayedDayProgress
 * If the same day, currentDayProgress = displayedDayProgress
 * 
 */
function getAppData() {

    let fileData = DelUtils.getAppData(this.appId);
    // console.log(`getAppData read data : ${fileData}`);

    if ("undefined" === JSON.stringify(fileData)) {
        console.log(`File contains undefined content. Reinitializing.`);
        saveDataToContainer(this.appData); // initialize with template data.
    }

    let tempAppData = JSON.parse(fileData);

    if (null != tempAppData && Object.keys(tempAppData).length > 0) {
        // If the app was closed without setting up
        if (tempAppData.is_first_run) {
            console.log("App launched before, but not initialized properly");
            pushFirstRun();
        }
        this.appData = tempAppData; // global object. Contains data from the file

        if (Object.keys(tempAppData.current_day_progress).length > 0) {
            if (getSummaryDateString(new Date()) == tempAppData.current_day_progress.date) {

                // ensure current values are not lost if current day
                console.log(`Same date for stored data : ${tempAppData.current_day_progress.date}`)
                this.currentDayProgress = tempAppData.current_day_progress;
                Object.assign(this.displayedDayProgress, tempAppData.current_day_progress);

            } else {

                // If the stored current date doesn't match today's date, reset the block.
                console.log(`Different dates - reset current_day_progress`);
                this.appData.current_day_progress = this.currentDayProgress;
                this.appData.current_day_progress.date = getSummaryDateString(new Date());
                saveDataToContainer(this.appData);
            }
        }
    } else {
        saveDataToContainer(this.appData); // initialize with template data. This is updated later
        pushFirstRun();
    }
}
