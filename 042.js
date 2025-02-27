// Client-side: JavaScript with IoT device integration and predictive analytics
const axios = require('axios');
const tf = require('@tensorflow/tfjs');

let model;

async function init() {
    model = await tf.loadLayersModel('https://path-to-your-model/model.json');
}

async function collectSensorData() {
    const soilMoisture = await getSensorData('soil-moisture');
    const temperature = await getSensorData('temperature');
    const cropHealth = await getSensorData('crop-health');
    return { soilMoisture, temperature, cropHealth };
}

async function getSensorData(sensor) {
    const response = await axios.get(`https://iot-device-api.com/sensors/${sensor}`);
    return response.data.value;
}

async function predictWateringSchedule(data) {
    const inputTensor = tf.tensor2d([[data.soilMoisture, data.temperature, data.cropHealth]]);
    const output = model.predict(inputTensor);
    const wateringSchedule = output.dataSync()[0];
    return wateringSchedule;
}

async function predictHarvestingSchedule(data) {
    const inputTensor = tf.tensor2d([[data.cropHealth, data.temperature]]);
    const output = model.predict(inputTensor);
    const harvestingSchedule = output.dataSync()[0];
    return harvestingSchedule;
}

async function optimizeSchedules() {
    const data = await collectSensorData();
    const wateringSchedule = await predictWateringSchedule(data);
    const harvestingSchedule = await predictHarvestingSchedule(data);
    console.log(`Watering Schedule: ${wateringSchedule}`);
    console.log(`Harvesting Schedule: ${harvestingSchedule}`);
}

init();

setInterval(optimizeSchedules, 60000); // Run every minute