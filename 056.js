// Client-side: JavaScript with task management features and real-time updates using WebSockets
const WebSocket = require('ws');

let ws;
let tasks = [];

function connectWebSocket() {
    ws = new WebSocket('ws://task-management-server.com');

    ws.on('open', () => {
        console.log('Connected to WebSocket');
    });

    ws.on('message', (data) => {
        const task = JSON.parse(data);
        if (task.action === 'add') {
            tasks.push(task);
        } else if (task.action === 'update') {
            const index = tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
                tasks[index] = task;
            }
        } else if (task.action === 'delete') {
            const index = tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
                tasks.splice(index, 1);
            }
        }
        updateTaskList();
    });

    ws.on('close', () => {
        console.log('Disconnected from WebSocket');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function createTask(title, deadline, priority) {
    const task = { id: Date.now(), title, deadline, priority, action: 'add' };
    ws.send(JSON.stringify(task));
}

function updateTask(id, title, deadline, priority) {
    const task = { id, title, deadline, priority, action: 'update' };
    ws.send(JSON.stringify(task));
}

function deleteTask(id) {
    const task = { id, action: 'delete' };
    ws.send(JSON.stringify(task));
}

function updateTaskList() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.innerHTML = `
            <p>${task.title}</p>
            <p>Deadline: ${task.deadline}</p>
            <p>Priority: ${task.priority}</p>
            <button onclick="editTask(${task.id})">Edit</button>
            <button onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(taskItem);
    });
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newTitle = prompt('Enter new title:', task.title);
        const newDeadline = prompt('Enter new deadline:', task.deadline);
        const newPriority = prompt('Enter new priority:', task.priority);
        updateTask(id, newTitle, newDeadline, newPriority);
    }
}

connectWebSocket();

// Example usage
createTask('Task 1', '2024-05-31', 'High');
createTask('Task 2', '2024-06-30', 'Medium');