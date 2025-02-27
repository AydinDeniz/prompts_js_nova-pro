// JavaScript function for implementing infinite scrolling with debounce mechanism

let isFetching = false;
let page = 1;
const itemsContainer = document.getElementById('items-container');
const debounceDelay = 300; // Debounce delay in milliseconds

function fetchItems(page) {
    if (isFetching) return;
    isFetching = true;

    fetch(`https://api.example.com/items?page=${page}`)
        .then(response => response.json())
        .then(data => {
            if (data.items.length > 0) {
                data.items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('item');
                    itemElement.textContent = item.name;
                    itemsContainer.appendChild(itemElement);
                });
                page++;
            } else {
                displayMessage('No more items to load.');
            }
            isFetching = false;
        })
        .catch(error => {
            console.error('Error fetching items:', error);
            displayMessage('An error occurred while fetching items.');
            isFetching = false;
        });
}

function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        debounce(fetchItems, debounceDelay)(page);
    }
}

function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.textContent = message;
    itemsContainer.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

window.addEventListener('scroll', handleScroll);

// Initial fetch to load the first page of items
fetchItems(page);