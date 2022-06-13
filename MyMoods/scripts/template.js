// App data template
var appData = {
    // "is_first_run": true,
    "current_day_progress": {},
    "logged_moods": [] // several current_day_progress objects
}

// Current day progress template
var currentDayProgress = {
    "date": "",
    "mood": "",
    "activities": {
        "social": [],
        "food": [],
        "health": [],
        "notes": ""
    }
}


// Displayed day progress template
// Used only for rendering.
var displayedDayProgress = {
    "date": "",
    "mood": "",
    "activities": {
        "social": [],
        "food": [],
        "health": [],
        "notes": ""
    }
};

let dayProgressTemplate = {
    "date": "",
    "mood": "",
    "activities": {
        "social": [],
        "food": [],
        "health": [],
        "notes": ""
    }
}

// Icon Unicode lookup
let iconLookup = {
    "rad": "&#128516;",
    "good": "&#128578;",
    "meh": "&#128528;",
    "bad": "&#128577;",
    "awful": "&#128534;",
    "famiy": "&#128104;&#8205;&#128105;&#8205;&#128103;&#8205;&#128102;",
    "friends": "&#128111;",
    "date": "❤️",
    "party": "&#128378;",
    "eat_healthy": "&#129367;",
    "fast_food": "&#127839;",
    "homemade": "&#127968;",
    "restaurant": "&#128104;&#8205;&#127859;",
    "delivery": "&#129377;",
    "no_meat": "&#129385;",
    "no_sweets": "&#129473;",
    "no_soda": "&#129380;",
    "exercise": "&#127947;",
    "drink_water": "&#128688;",
    "walk": "&#128694;",
    "meditate": "&#129496;"
}


// Icon Unicode lookup
let iconLookup_emoji = {
    "rad": { "emoji": "😄", "val": 5, "dec": "&#128516;" },
    "good": { "emoji": "🙂", "val": 4, "dec": "&#128578;" },
    "meh": { "emoji": "😐", "val": 3, "dec": "&#128528;" },
    "bad": { "emoji": "🙁", "val": 2, "dec": "&#128577;" },
    "awful": { "emoji": "😖", "val": 1, "dec": "&#128534;" }
}
