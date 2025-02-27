const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/eventRegistration', { useNewUrlParser: true, useUnifiedTopology: true });

const registrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    event: String,
    dietaryPreferences: String,
    qrCode: String
});

const Registration = mongoose.model('Registration', registrationSchema);

app.post('/register', async (req, res) => {
    const { name, email, event, dietaryPreferences } = req.body;

    const qrCodeText = `Name: ${name}, Event: ${event}`;
    const qrCodeImage = await qrcode.toDataURL(qrCodeText);

    const registration = new Registration({
        name,
        email,
        event,
        dietaryPreferences,
        qrCode: qrCodeImage
    });

    await registration.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Event Registration Confirmation',
        text: `Thank you for registering for the ${event}. Your QR code is attached.`,
        attachments: [{
            filename: 'qrcode.png',
            content: qrCodeImage.replace(/^data:image\/png;base64,/, ""),
            encoding: 'base64'
        }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Registration successful');
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});