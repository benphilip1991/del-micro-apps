var appId = '';
var userName = '';


// Store currently displayed date
var currentDisplayedDate;


// Called by the container as the first init call
// Initialize the rest of the app here
function setAppId(appId) {

    this.appId = appId;

    this.currentDisplayedDate = new Date();
}

