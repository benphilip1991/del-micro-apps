/*********************************************************************************************************
 * 
 *      Utilities
 * 
**********************************************************************************************************/

/**
 * Manage dates and displayed content
 */
 function getSummaryDateString(currentDisplayedDate, addTimeOfDay = false, onlyTime = false) {
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = new Date(currentDisplayedDate);

    var formattedTimestamp = "";

    if(!onlyTime) {
        formattedTimestamp = days[date.getDay(date)] + ", "
        + months[date.getMonth()] + ' ' + date.getDate() + ", "
        + date.getFullYear();
    }

    if (addTimeOfDay) {
        formattedTimestamp = formattedTimestamp + ' ' + date.getHours() + ':'
            + date.getMinutes() + ':' + date.getSeconds();
    }

    return formattedTimestamp.trim();
}

/**
 * Setup stored content from the previous day
 */
function getPreviousDay() {
    currentDisplayedDate.setDate(currentDisplayedDate.getDate() - 1);
    document.getElementById("loggedDay").innerHTML = getSummaryDateString(currentDisplayedDate);
 
    getFilteredMealData(getSummaryDateString(currentDisplayedDate));
}

/**
 * Setup stored content from the 'next' day
 */
function getNextDay() {
    currentDisplayedDate.setDate(currentDisplayedDate.getDate() + 1);
    document.getElementById("loggedDay").innerHTML = getSummaryDateString(currentDisplayedDate);

    getFilteredMealData(getSummaryDateString(currentDisplayedDate))
}

/**
 * Display a toast with the given message
 * @param {String} message 
 */
function showToast(message) {
    ons.notification.toast(message, {timeout: 1000, animation: 'ascend'})
}

/**
 * Removes all child nodes from a node
 * @param {Element} viewRoot 
 */
 function cleanViewNode(viewRoot) {

    var child = viewRoot.lastElementChild;
    while(child) {
        viewRoot.removeChild(child);
        child = viewRoot.lastElementChild;
    }
}
