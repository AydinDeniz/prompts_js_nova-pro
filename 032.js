// Client-side: JavaScript with Web Speech API and Node-RED integration
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

let devices = {
    light: { status: 'off' },
    thermostat: { status: '20°C' },
    fan: { status: 'off' },
    door: { status: 'closed' }
};

recognition.onresult = async (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
        }
    }
    if (transcript.includes('turn on the light')) {
        await controlDevice('light', 'on');
    } else if (transcript.includes('turn off the light')) {
        await controlDevice('light', 'off');
    } else if (transcript.includes('set thermostat to')) {
        const temperature = transcript.match(/set thermostat to (\d+°C)/)[1];
        await controlDevice('thermostat', temperature);
    } else if (transcript.includes('turn on the fan')) {
        await controlDevice('fan', 'on');
    } else if (transcript.includes('turn off the fan')) {
        await controlDevice('fan', 'off');
    } else if (transcript.includes('open the door')) {
        await controlDevice('door', 'open');
    } else if (transcript.includes('close the door')) {
        await controlDevice('door', 'closed');
    }
    updateDashboard();
};

recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
};

recognition.start();

async function controlDevice(device, command) {
    const response = await fetch(`/control/${device}/${command}`, { method: 'POST' });
    if (response.ok) {
        devices[device].status = command;
    }
}

function updateDashboard() {
    document.getElementById('light-status').textContent = devices.light.status;
    document.getElementById('thermostat-status').textContent = devices.thermostat.status;
    document.getElementById('fan-status').textContent = devices.fan.status;
    document.getElementById('door-status').textContent = devices.door.status;
}

// Additional functions for more complex interactions
async function setScene(scene) {
    if (scene === 'night') {
        await controlDevice('light', 'off');
        await controlDevice('thermostat', '18°C');
        await controlDevice('fan', 'off');
    } else if (scene === 'day') {
        await controlDevice('light', 'on');
        await controlDevice('thermostat', '22°C');
        await controlDevice('fan', 'on');
    }
    updateDashboard();
}

async function checkSecurity() {
    const response = await fetch('/check-security', { method: 'GET' });
    if (response.ok) {
        const data = await response.json();
        if (data.intruderDetected) {
            await controlDevice('door', 'locked');
            alert('Intruder detected! Door locked for security.');
        }
    }
}

// Example usage
setScene('night');
checkSecurity();