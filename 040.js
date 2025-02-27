// Client-side: JavaScript with TensorFlow.js and Chart.js
const tf = require('@tensorflow/tfjs');
const Chart = require('chart.js');

let model;
let chart;

function createModel() {
    const layers = [];
    const architecture = document.getElementById('architecture').value.split(',');
    architecture.forEach(layer => {
        const [type, units] = layer.split(':');
        if (type === 'dense') {
            layers.push(tf.layers.dense({ units: parseInt(units) }));
        }
    });
    model = tf.sequential({ layers });
}

function trainModel() {
    const epochs = parseInt(document.getElementById('epochs').value);
    const batchSize = parseInt(document.getElementById('batch-size').value);
    const learningRate = parseFloat(document.getElementById('learning-rate').value);

    const optimizer = tf.train.adam(learningRate);
    model.compile({ optimizer, loss: 'meanSquaredError' });

    const xs = tf.tensor2d([[0], [1], [2], [3]], [4, 1]);
    const ys = tf.tensor2d([[1], [3], [5], [7]], [4, 1]);

    model.fit(xs, ys, { epochs, batchSize }).then(info => {
        console.log('Training complete');
        console.log('Final loss:', info.history.loss[info.history.loss.length - 1]);
        displayTrainingMetrics(info.history.loss);
    });
}

function displayTrainingMetrics(loss) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: loss.length }, (_, i) => i + 1),
            datasets: [{
                label: 'Loss',
                data: loss,
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

document.getElementById('create-model').addEventListener('click', createModel);
document.getElementById('train-model').addEventListener('click', trainModel);