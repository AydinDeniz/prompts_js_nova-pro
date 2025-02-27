// Server-side: JavaScript with Johnny-Five and Express
const express = require('express');
const { Board, Servo, Led } = require('johnny-five');
const app = express();
const board = new Board();

board.on('ready', () => {
    const leftMotor = new Servo(9);
    const rightMotor = new Servo(10);
    const led = new Led(13);

    app.get('/forward', (req, res) => {
        leftMotor.to(90);
        rightMotor.to(90);
        res.send('Moving forward');
    });

    app.get('/backward', (req, res) => {
        leftMotor.to(0);
        rightMotor.to(0);
        res.send('Moving backward');
    });

    app.get('/left', (req, res) => {
        leftMotor.to(0);
        rightMotor.to(90);
        res.send('Turning left');
    });

    app.get('/right', (req, res) => {
        leftMotor.to(90);
        rightMotor.to(0);
        res.send('Turning right');
    });

    app.get('/stop', (req, res) => {
        leftMotor.to(45);
        rightMotor.to(45);
        res.send('Stopping');
    });

    app.get('/led/on', (req, res) => {
        led.on();
        res.send('LED on');
    });

    app.get('/led/off', (req, res) => {
        led.off();
        res.send('LED off');
    });

    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});

// Client-side: JavaScript with visual programming interface
const controls = document.querySelectorAll('.control');

controls.forEach(control => {
    control.addEventListener('click', () => {
        const action = control.getAttribute('data-action');
        fetch(`/${action}`)
            .then(response => response.text())
            .then(message => {
                console.log(message);
            });
    });
});