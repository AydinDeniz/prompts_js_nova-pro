// Client-side: JavaScript with IoT device integration and home automation dashboard features
const axios = require('axios');

let devices = [];
let routines = [];

async function fetchDevices() {
    const response = await axios.get('https://iot-device-api.com/devices');
    return response.data;
}

async function fetchRoutines() {
    const response = await axios.get('https://iot-device-api.com/routines');
    return response.data;
}

function controlDevice(deviceId, action) {
    axios.post(`https://iot-device-api.com/devices/${deviceId}/control`, { action });
}

function trackEnergyConsumption(deviceId) {
    axios.get(`https://iot-device-api.com/devices/${deviceId}/energy-consumption`).then(response => {
        const consumption = response.data;
        console.log(`Energy consumption for device ${deviceId}: ${consumption} kWh`);
    });
}

function executeRoutine(routineId) {
    axios.post(`https://iot-device-api.com/routines/${routineId}/execute`);
}

async function initializeDashboard() {
    devices = await fetchDevices();
    routines = await fetchRoutines();
    updateDeviceList();
    updateRoutineList();
}

function updateDeviceList() {
    const deviceList = document.getElementById('device-list');
    deviceList.innerHTML = '';
    devices.forEach(device => {
        const deviceItem = document.createElement('li');
        deviceItem.innerHTML = `
            <p>${device.name}</p>
            <button onclick="controlDevice(${device.id}, 'on')">Turn On</button>
            <button onclick="controlDevice(${device.id}, 'off')">Turn Off</button>
            <button onclick="trackEnergyConsumption(${device.id})">Track Energy Consumption</button>
        `;
        deviceList.appendChild(deviceItem);
    });
}

function updateRoutineList() {
    const routineList = document.getElementById('routine-list');
    routineList.innerHTML = '';
    routines.forEach(routine => {
        const routineItem = document.createElement('li');
        routineItem.innerHTML = `
            <p>${routine.name}</p>
            <button onclick="executeRoutine(${routine.id})">Execute Routine</button>
        `;
        routineList.appendChild(routineItem);
    });
}

initializeDashboard();