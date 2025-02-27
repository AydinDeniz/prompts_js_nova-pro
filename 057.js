// Client-side: JavaScript with fitness and nutrition tracking features and API integration
const axios = require('axios');

let workouts = [];
let meals = [];

async function fetchFitnessData(userId) {
    const apiKey = 'your-api-key';
    const response = await axios.get(`https://fitness-device-api.com/users/${userId}/data`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });
    return response.data;
}

function logWorkout(name, duration, caloriesBurned) {
    const workout = { id: Date.now(), name, duration, caloriesBurned };
    workouts.push(workout);
    updateWorkoutList();
}

function logMeal(name, calories, protein, carbs, fats) {
    const meal = { id: Date.now(), name, calories, protein, carbs, fats };
    meals.push(meal);
    updateMealList();
}

function updateWorkoutList() {
    const workoutList = document.getElementById('workout-list');
    workoutList.innerHTML = '';
    workouts.forEach(workout => {
        const workoutItem = document.createElement('li');
        workoutItem.innerHTML = `
            <p>${workout.name}</p>
            <p>Duration: ${workout.duration} minutes</p>
            <p>Calories Burned: ${workout.caloriesBurned}</p>
        `;
        workoutList.appendChild(workoutItem);
    });
}

function updateMealList() {
    const mealList = document.getElementById('meal-list');
    mealList.innerHTML = '';
    meals.forEach(meal => {
        const mealItem = document.createElement('li');
        mealItem.innerHTML = `
            <p>${meal.name}</p>
            <p>Calories: ${meal.calories}</p>
            <p>Protein: ${meal.protein}g</p>
            <p>Carbs: ${meal.carbs}g</p>
            <p>Fats: ${meal.fats}g</p>
        `;
        mealList.appendChild(mealItem);
    });
}

async function syncFitnessData(userId) {
    const fitnessData = await fetchFitnessData(userId);
    fitnessData.workouts.forEach(workout => {
        logWorkout(workout.name, workout.duration, workout.caloriesBurned);
    });
    fitnessData.meals.forEach(meal => {
        logMeal(meal.name, meal.calories, meal.protein, meal.carbs, meal.fats);
    });
}

// Example usage
const userId = '12345';
syncFitnessData(userId);