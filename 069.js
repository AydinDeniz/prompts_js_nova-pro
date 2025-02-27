// Client-side: JavaScript with grocery list optimization and route planning features
const axios = require('axios');

let groceryList = [];
let storeLayout = [];
let optimizedRoute = [];

async function fetchStoreLayout(storeId) {
    const response = await axios.get(`https://store-layout-api.com/${storeId}`);
    return response.data;
}

function createGroceryList(items) {
    groceryList = items.map(item => ({ name: item, aisle: null }));
}

function optimizeGroceryList(storeLayout) {
    groceryList.forEach(item => {
        const aisle = storeLayout.find(aisle => aisle.items.includes(item.name));
        if (aisle) {
            item.aisle = aisle.number;
        }
    });
}

function planRoute(groceryList) {
    const visitedAisles = new Set();
    const route = [];
    groceryList.forEach(item => {
        if (!visitedAisles.has(item.aisle)) {
            route.push(item.aisle);
            visitedAisles.add(item.aisle);
        }
    });
    optimizedRoute = route;
}

function displayGroceryList() {
    const groceryListDiv = document.getElementById('grocery-list');
    groceryListDiv.innerHTML = '';
    groceryList.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.name} (Aisle ${item.aisle})`;
        groceryListDiv.appendChild(listItem);
    });
}

function displayRoute() {
    const routeDiv = document.getElementById('route');
    routeDiv.textContent = `Optimized Route: ${optimizedRoute.join(' -> ')}`;
}

async function initializeOptimizer(storeId, items) {
    storeLayout = await fetchStoreLayout(storeId);
    createGroceryList(items);
    optimizeGroceryList(storeLayout);
    planRoute(groceryList);
    displayGroceryList();
    displayRoute();
}

// Example usage
const storeId = '12345';
const items = ['Milk', 'Bread', 'Eggs', 'Cheese'];
initializeOptimizer(storeId, items);