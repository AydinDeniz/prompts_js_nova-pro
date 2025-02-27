// Combined JavaScript Implementation for Online Classroom Platform

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const firebase = require('firebase-admin');
const serviceAccount = require('path/to/serviceAccountKey.json');

const app = express();

app.use(bodyParser.json());
app.use(cors());

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id.firebaseio.com',
    storageBucket: 'your-project-id.appspot.com'
});

const db = firebase.database();
const storage = firebase.storage();

// API endpoint to create a Zoom meeting
app.post('/create-meeting', async (req, res) => {
    const { topic, startTime, duration } = req.body;
    const apiKey = 'your_zoom_api_key';
    const apiSecret = 'your_zoom_api_secret';

    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
        topic,
        type: 2,
        start_time: startTime,
        duration,
    }, {
        auth: {
            username: apiKey,
            password: apiSecret
        }
    });

    res.json(response.data);
});

// API endpoint to join a Zoom meeting
app.get('/join-meeting/:meetingId', async (req, res) => {
    const { meetingId } = req.params;
    const apiKey = 'your_zoom_api_key';
    const apiSecret = 'your_zoom_api_secret';

    const response = await axios.post(`https://api.zoom.us/v2/meetings/${meetingId}/registrants`, {
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe'
    }, {
        auth: {
            username: apiKey,
            password: apiSecret
        }
    });

    res.json(response.data);
});

// API endpoint to send a chat message
app.post('/chat', (req, res) => {
    const { roomId, message } = req.body;
    const chatRef = db.ref(`chat/${roomId}`);
    chatRef.push(message);
    res.json({ message: 'Chat message sent successfully' });
});

// API endpoint to upload a file
app.post('/upload', (req, res) => {
    const { file, roomId } = req.body;
    const fileBuffer = Buffer.from(file, 'base64');
    const fileRef = storage.bucket().file(`${roomId}/${Date.now()}-${file.name}`);
    fileRef.save(fileBuffer, {
        metadata: {
            contentType: file.type
        }
    }, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error uploading file' });
        }

        res.json({ message: 'File uploaded successfully' });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Front-end (HTML + JavaScript)

// HTML for online classroom
const classroomHTML = `
    <h1>Online Classroom</h1>
    <form id="createMeetingForm">
        <label for="topic">Topic:</label>
        <input type="text" id="topic" name="topic" required><br><br>
        <label for="startTime">Start Time:</label>
        <input type="datetime-local" id="startTime" name="startTime" required><br><br>
        <label for="duration">Duration (minutes):</label>
        <input type="number" id="duration" name="duration" required><br><br>
        <button type="submit">Create Meeting</button>
    </form>
    <div id="meetingLink"></div>
    <form id="joinMeetingForm">
        <label for="meetingId">Meeting ID:</label>
        <input type="text" id="meetingId" name="meetingId" required><br><br>
        <button type="submit">Join Meeting</button>
    </form>
    <div id="chatRoom">
        <h2>Chat</h2>
        <input type="text" id="chatMessage" placeholder="Type a message...">
        <button id="sendChat">Send</button>
        <div id="chatMessages"></div>
    </div>
    <form id="uploadForm">
        <label for="file">File:</label>
        <input type="file" id="file" name="file" required><br><br>
        <button type="submit">Upload</button>
    </form>
    <div id="uploadedFiles"></div>
`;

document.body.innerHTML += classroomHTML;

document.getElementById('createMeetingForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const topic = formData.get('topic');
    const startTime = formData.get('startTime');
    const duration = formData.get('duration');

    const response = await fetch('/create-meeting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic, startTime, duration })
    });

    const result = await response.json();
    document.getElementById('meetingLink').innerText = `Meeting Link: ${result.join_url}`;
});

document.getElementById('joinMeetingForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const meetingId = document.getElementById('meetingId').value;

    const response = await fetch(`/join-meeting/${meetingId}`);

    const result = await response.json();
    alert('Meeting joined successfully');
});

document.getElementById('sendChat').addEventListener('click', async () => {
    const chatMessage = document.getElementById('chatMessage').value;
    const roomId = 'classroom123';

    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId, message: chatMessage })
    });

    const result = await response.json();
    alert(result.message);
});

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const roomId = 'classroom123';

    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const fileBase64 = fileReader.result.split(',')[1];

        const response = await fetch('/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file: { name: file.name, type: file.type, data: fileBase64 }, roomId })
        });

        const result = await response.json();
        alert(result.message);
    };

    fileReader.readAsDataURL(file);
});