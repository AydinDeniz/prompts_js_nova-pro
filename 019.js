// Combined JavaScript Implementation for All Prompts

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Database connections
const sequelize = new Sequelize('healthcare_appointments', 'username', 'password', {
    host: 'localhost',
    dialect: 'postgres'
});

// Models
const Appointment = sequelize.define('Appointment', {
    patientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    doctorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    appointmentDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
    }
}, {
    timestamps: true
});

const Video = sequelize.define('Video', {
    title: {
        type: DataTypes.STRING,
        required: true
    },
    description: {
        type: DataTypes.STRING
    },
    videoUrl: {
        type: DataTypes.STRING,
        required: true
    },
    metadata: {
        type: DataTypes.JSON
    }
}, {
    timestamps: true
});

// AWS S3 configuration
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API endpoints for appointments
app.post('/appointments', async (req, res) => {
    const { patientName, doctorName, appointmentDate } = req.body;
    const appointment = await Appointment.create({ patientName, doctorName, appointmentDate });
    res.json(appointment);
});

app.get('/appointments', async (req, res) => {
    const appointments = await Appointment.findAll();
    res.json(appointments);
});

// API endpoints for video uploads
app.post('/upload', upload.single('video'), async (req, res) => {
    const { title, description } = req.body;
    const videoBuffer = req.file.buffer;
    const videoKey = `${Date.now()}-${req.file.originalname}`;

    const params = {
        Bucket: bucketName,
        Key: videoKey,
        Body: videoBuffer,
        ContentType: req.file.mimetype
    };

    s3.upload(params, async (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error uploading video to S3' });
        }

        const videoUrl = data.Location;
        const video = new Video({ title, description, videoUrl });
        await video.save();

        res.json({ message: 'Video uploaded successfully', video });
    });
});

// Start the server
sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});

// Front-end (HTML + JavaScript)

// HTML for appointments
const appointmentForm = `
    <h1>Book an Appointment</h1>
    <form id="appointmentForm">
        <label for="patientName">Patient Name:</label>
        <input type="text" id="patientName" name="patientName" required><br><br>
        <label for="doctorName">Doctor Name:</label>
        <input type="text" id="doctorName" name="doctorName" required><br><br>
        <label for="appointmentDate">Appointment Date:</label>
        <input type="datetime-local" id="appointmentDate" name="appointmentDate" required><br><br>
        <button type="submit">Book Appointment</button>
    </form>
    <div id="appointmentFeedback"></div>
`;

document.body.innerHTML += appointmentForm;

document.getElementById('appointmentForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const patientName = formData.get('patientName');
    const doctorName = formData.get('doctorName');
    const appointmentDate = formData.get('appointmentDate');

    const response = await fetch('/appointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientName, doctorName, appointmentDate })
    });

    const result = await response.json();
    document.getElementById('appointmentFeedback').innerText = 'Appointment booked successfully';
});

// HTML for video uploads
const videoUploadForm = `
    <h1>Upload a Video</h1>
    <form id="uploadForm" enctype="multipart/form-data">
        <label for="title">Title:</label>
        <input type="text" id="title" name="title" required><br><br>
        <label for="description">Description:</label>
        <textarea id="description" name="description"></textarea><br><br>
        <label for="video">Video:</label>
        <input type="file" id="video" name="video" accept="video/*" required><br><br>
        <button type="submit">Upload</button>
    </form>
    <div id="preview"></div>
    <div id="feedback"></div>
`;

document.body.innerHTML += videoUploadForm;

document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const title = formData.get('title');
    const description = formData.get('description');
    const video = formData.get('video');

    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(video);
    videoElement.controls = true;

    document.getElementById('preview').innerHTML = '';
    document.getElementById('preview').appendChild(videoElement);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    document.getElementById('feedback').innerText = result.message;
});