// Combined JavaScript Implementation for Virtual Reality Tour Creator

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/vrTours', { useNewUrlParser: true, useUnifiedTopology: true });

const tourSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    scenes: [{
        imageUrl: {
            type: String,
            required: true
        },
        hotspots: [{
            position: {
                type: [Number],
                required: true
            },
            description: {
                type: String,
                required: true
            },
            nextScene: {
                type: Number
            }
        }]
    }]
}, {
    timestamps: true
});

const Tour = mongoose.model('Tour', tourSchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/tours', upload.single('image'), async (req, res) => {
    const { title, scenes } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const tour = new Tour({ title, scenes: [{ imageUrl, hotspots: scenes[0].hotspots }] });
    await tour.save();

    res.json(tour);
});

app.get('/tours/:id', async (req, res) => {
    const { id } = req.params;
    const tour = await Tour.findById(id);
    res.json(tour);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Front-end (HTML + JavaScript + Three.js)

const tourHTML = `
    <h1>Virtual Reality Tour Creator</h1>
    <form id="tourForm" enctype="multipart/form-data">
        <label for="title">Tour Title:</label>
        <input type="text" id="title" name="title" required><br><br>
        <label for="image">360-degree Image:</label>
        <input type="file" id="image" name="image" accept="image/*" required><br><br>
        <div id="hotspots">
            <h2>Hotspots</h2>
            <div class="hotspot">
                <label for="position">Position (x, y, z):</label>
                <input type="text" name="position" required><br><br>
                <label for="description">Description:</label>
                <input type="text" name="description" required><br><br>
                <label for="nextScene">Next Scene:</label>
                <input type="number" name="nextScene"><br><br>
            </div>
        </div>
        <button type="button" onclick="addHotspot()">Add Hotspot</button>
        <button type="submit">Create Tour</button>
    </form>
    <div id="vrTour"></div>
`;

document.body.innerHTML += tourHTML;

document.getElementById('tourForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const title = formData.get('title');
    const image = formData.get('image');
    const hotspots = Array.from(document.querySelectorAll('#hotspots .hotspot')).map(hotspot => ({
        position: hotspot.querySelector('input[name="position"]').value.split(',').map(Number),
        description: hotspot.querySelector('input[name="description"]').value,
        nextScene: hotspot.querySelector('input[name="nextScene"]').value
    }));

    formData.append('scenes', JSON.stringify([{ hotspots }]));

    const response = await fetch('/tours', {
        method: 'POST',
        body: formData
    });

    const tour = await response.json();
    displayTour(tour);
});

function addHotspot() {
    const hotspotHTML = `
        <div class="hotspot">
            <label for="position">Position (x, y, z):</label>
            <input type="text" name="position" required><br><br>
            <label for="description">Description:</label>
            <input type="text" name="description" required><br><br>
            <label for="nextScene">Next Scene:</label>
            <input type="number" name="nextScene"><br><br>
        </div>
    `;
    document.getElementById('hotspots').insertAdjacentHTML('beforeend', hotspotHTML);
}

function displayTour(tour) {
    const { title, scenes } = tour;
    const scene = scenes[0];
    const { imageUrl, hotspots } = scene;

    const vrTour = document.getElementById('vrTour');
    vrTour.innerHTML = `
        <h2>${title}</h2>
        <img src="${imageUrl}" alt="360-degree image" style="width: 100%;">
        <div id="hotspotContainer"></div>
    `;

    const hotspotContainer = document.getElementById('hotspotContainer');
    hotspots.forEach(hotspot => {
        const hotspotElement = document.createElement('div');
        hotspotElement.classList.add('hotspot');
        hotspotElement.style.position = 'absolute';
        hotspotElement.style.left = `${hotspot.position[0]}%`;
        hotspotElement.style.top = `${hotspot.position[1]}%`;
        hotspotElement.style.transform = 'translate(-50%, -50%)';
        hotspotElement.innerHTML = `<p>${hotspot.description}</p>`;
        hotspotContainer.appendChild(hotspotElement);
    });
}