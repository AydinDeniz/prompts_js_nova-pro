// Client-side: JavaScript with TensorFlow.js and PostgreSQL integration
const { createPool } = require('mysql2/promise');
const tf = require('@tensorflow/tfjs');

// PostgreSQL connection pool
const pool = createPool({
    host: 'localhost',
    user: 'youruser',
    password: 'yourpassword',
    database: 'healthdb'
});

// Load pre-trained TensorFlow.js model
async function loadModel() {
    const modelUrl = 'https://path-to-your-model/model.json';
    const model = await tf.loadLayersModel(modelUrl);
    return model;
}

// Fetch user health data from PostgreSQL
async function getUserHealthData(userId) {
    const [rows] = await pool.query('SELECT * FROM health_data WHERE user_id = ?', [userId]);
    return rows;
}

// Generate personalized health recommendations
async function generateRecommendations(userId) {
    const model = await loadModel();
    const healthData = await getUserHealthData(userId);

    const inputTensor = tf.tensor2d(healthData.map(data => [
        data.age,
        data.weight,
        data.height,
        data.activity_level,
        data.diet_preference
    ]));

    const predictions = model.predict(inputTensor);

    const recommendations = predictions.arraySync().map(pred => ({
        diet: pred[0],
        exercise: pred[1]
    }));

    return recommendations;
}

// Example usage
async function main() {
    const userId = 1;
    const recommendations = await generateRecommendations(userId);
    console.log('Personalized Health Recommendations:', recommendations);
}

main();

// Server-side: Express.js with PostgreSQL
const express = require('express');
const { createPool } = require('mysql2/promise');

const app = express();
const pool = createPool({
    host: 'localhost',
    user: 'youruser',
    password: 'yourpassword',
    database: 'healthdb'
});

app.get('/api/health-data/:userId', async (req, res) => {
    const userId = req.params.userId;
    const [rows] = await pool.query('SELECT * FROM health_data WHERE user_id = ?', [userId]);
    res.json(rows);
});

app.post('/api/health-data', async (req, res) => {
    const { userId, age, weight, height, activity_level, diet_preference } = req.body;
    await pool.query('INSERT INTO health_data (user_id, age, weight, height, activity_level, diet_preference) VALUES (?, ?, ?, ?, ?, ?)', [userId, age, weight, height, activity_level, diet_preference]);
    res.status(201).send('Health data saved');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});