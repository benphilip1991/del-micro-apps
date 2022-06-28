
let app_id = "";
let app_key = "";
let edamam_base = `https://api.edamam.com/api/food-database/v2/parser?app_id=${app_id}&app_key=${app_key}&ingr=`;

/**
 * Functions to handle API requests to Edamam food database
 */
async function getNutritionInformation(foodItem) {

    let finalUrl = edamam_base + encodeURIComponent(foodItem);
    var response = await fetch(finalUrl);

    console.log(`REQUEST URL --------- ${finalUrl}`)
    var edamam_response = await (response).json();

    console.log(`RESPONSE STATUS -------------- ${response.status}`);
    if (response.status == 200) {
        let mealData = extractResponseMealsData(edamam_response.hints);

        return {
            "status": response.status,
            "foodItems": mealData
        };

    } else {
        return {
            "status": response.status,
            "foodItems": []
        }
    }
}

/**
 * Extract identified meals from the response and build a list
 * 
 * @param {JSON} data 
 * @returns JSON array
 */
function extractResponseMealsData(data) {

    let searchedMeals = []
    data.forEach((item) => {
        let mealItem = {
            "label": item.food.label,
            "nutrients": item.food.nutrients,
        }

        if(item.food.hasOwnProperty("brand"))
            mealItem.brand = item.food.brand

        searchedMeals.push(mealItem);
    });

    // console.log(`RAW MEAL ITEMS -------------- ${JSON.stringify(searchedMeals)}`);
    return searchedMeals;
}
