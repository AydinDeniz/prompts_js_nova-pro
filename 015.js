let db;

const request = indexedDB.open('fitnessTracker', 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadActivities();
};

request.onerror = (event) => {
    console.error('IndexedDB error:', event.target.errorCode);
};

document.getElementById('activityForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const activityType = document.getElementById('activityType').value;
    const duration = document.getElementById('duration').value;

    const transaction = db.transaction(['activities'], 'readwrite');
    const store = transaction.objectStore('activities');
    const activity = { type: activityType, duration: parseInt(duration), timestamp: Date.now() };
    store.add(activity);

    transaction.oncomplete = () => {
        loadActivities();
        document.getElementById('activityForm').reset();
    };
});

function loadActivities() {
    const transaction = db.transaction(['activities'], 'readonly');
    const store = transaction.objectStore('activities');
    const activities = [];

    store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            activities.push(cursor.value);
            cursor.continue();
        } else {
            displayChart(activities);
        }
    };
}

function displayChart(activities) {
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');

    const labels = activities.map(activity => new Date(activity.timestamp).toLocaleDateString());
    const data = activities.map(activity => activity.duration);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Activity Duration',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

window.addEventListener('online', () => {
    syncWithRemote();
});

function syncWithRemote() {
    const transaction = db.transaction(['activities'], 'readonly');
    const store = transaction.objectStore('activities');
    const activities = [];

    store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            activities.push(cursor.value);
            cursor.continue();
        } else {
            fetch('https://api.example.com/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ activities: activities })
            }).then(response => {
                if (response.ok) {
                    clearLocalData();
                } else {
                    console.error('Sync failed');
                }
            }).catch(error => {
                console.error('Sync error:', error);
            });
        }
    };
}

function clearLocalData() {
    const transaction = db.transaction(['activities'], 'readwrite');
    const store = transaction.objectStore('activities');
    store.clear();
}