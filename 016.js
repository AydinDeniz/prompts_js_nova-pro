const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const sequelize = new Sequelize('polling_system', 'username', 'password', {
    host: 'localhost',
    dialect: 'postgres'
});

const Poll = sequelize.define('Poll', {
    question: {
        type: DataTypes.STRING,
        allowNull: false
    },
    options: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    votes: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    }
}, {
    timestamps: true
});

sequelize.sync();

app.post('/polls', async (req, res) => {
    const { question, options } = req.body;
    const poll = await Poll.create({ question, options, votes: {} });
    res.json(poll);
});

app.post('/polls/:id/vote', async (req, res) => {
    const { option } = req.body;
    const poll = await Poll.findByPk(req.params.id);
    if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
    }

    const votes = { ...poll.votes };
    votes[option] = (votes[option] || 0) + 1;
    await poll.update({ votes });
    res.json(poll);
});

app.get('/polls/:id/results', async (req, res) => {
    const poll = await Poll.findByPk(req.params.id);
    if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
    }

    const results = poll.options.map((option, index) => ({
        option,
        votes: poll.votes[option] || 0
    }));

    res.json({ question: poll.question, results });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});