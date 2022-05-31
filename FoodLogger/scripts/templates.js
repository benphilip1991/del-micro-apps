// App data template
var appData = {
    "is_first_run": true,
    "current_daily_goals": 0,
    "current_day_progress": {},
    "logged_meals": [] // several current_day_progress objects
}

// Current day progress template
var currentDayProgress = {
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


// Displayed day progress template
// Used only for rendering.
var displayedDayProgress = {};

let dayProgressTemplate = {
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


// Meal item template
var mealItem = {
    "timestamp": "",
    "item": "",
    "calories": ""
}
