const fetch = require('node-fetch');

async function loadProductData(productId) {
    const response = await fetch(`https://api.example.com/products/${productId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch product data');
    }
    return await response.json();
}

function filterReviews(reviews, rating) {
    return reviews.filter(review => review.rating >= rating);
}

function cacheData(data) {
    if ('indexedDB' in window) {
        const request = indexedDB.open('ecommerceCache', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('products', { keyPath: 'id' });
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');
            store.put(data);
        };
    }
}

// Example usage:
async function displayProductPage(productId) {
    try {
        const productData = await loadProductData(productId);
        cacheData(productData);

        const filteredReviews = filterReviews(productData.reviews, 4);
        console.log('Product Data:', productData);
        console.log('Filtered Reviews:', filteredReviews);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Simulate product ID for example
displayProductPage(123);