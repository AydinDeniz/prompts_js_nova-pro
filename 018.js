const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/videoUpload', { useNewUrlParser: true, useUnifiedTopology: true });

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    videoUrl: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

const Video = mongoose.model('Video', videoSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Front-end (HTML + JavaScript)

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