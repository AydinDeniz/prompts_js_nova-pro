const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const sequelize = new Sequelize('car_rental', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});

const Booking = sequelize.define('Booking', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    carId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    paymentInfo: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

const Car = sequelize.define('Car', {
    make: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true
});

sequelize.sync();

app.post('/bookings', async (req, res) => {
    const { userId, carId, startDate, endDate, paymentInfo } = req.body;
    const booking = await Booking.create({ userId, carId, startDate, endDate, paymentInfo });
    res.json(booking);
});

app.get('/cars', async (req, res) => {
    const { make, model, year } = req.query;
    const whereClause = {};

    if (make) whereClause.make = make;
    if (model) whereClause.model = model;
    if (year) whereClause.year = year;

    const cars = await Car.findAll({ where: { ...whereClause, available: true } });
    res.json(cars);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});