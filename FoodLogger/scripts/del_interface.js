/*********************************************************************************************************
 * 
 *      App setup and initialization, interface with DelUtils
 * 
**********************************************************************************************************/

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

    let fileData = DelUtils.getAppData(this.appId);
    console.log(`getAppData read data : ${fileData}`);

    if("undefined" === JSON.stringify(fileData)) {
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
        this.appData = tempAppData; // global object

        if (Object.keys(tempAppData.current_day_progress).length > 0) {
            if (getSummaryDateString(new Date()) == tempAppData.current_day_progress.date) {
                // ensure current values are not lost if current day
                console.log(`Same date for stored data : ${tempAppData.current_day_progress.date}`)
                this.currentDayProgress = tempAppData.current_day_progress;
            }
        }

        setupDisplayedFoodLog(new Date())

    } else {
        saveDataToContainer(this.appData); // initialize with template data. This is updated later
        pushFirstRun();
    }
}
