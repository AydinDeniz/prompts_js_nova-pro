// Client-side: JavaScript with IPFS and Blockchain integration
const ipfsClient = require('ipfs-http-client');
const Web3 = require('web3');
const fs = require('fs');

const ipfs = ipfsClient.create('https://ipfs.infura.io:5001/api/v0');
const web3 = new Web3(Web3.givenProvider || 'ws://localhost:8545');

let contract;
let accounts;

async function init() {
    accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = StorageContract.networks[networkId];
    contract = new web3.eth.Contract(StorageContract.abi, deployedNetwork && deployedNetwork.address);
}

async function uploadFile(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = async () => {
        const buffer = reader.result;
        const added = await ipfs.add(buffer);
        const ipfsHash = added.path;
        await contract.methods.uploadFile(ipfsHash).send({ from: accounts[0] });
    };
}

async function shareFile(ipfsHash, address) {
    await contract.methods.shareFile(ipfsHash, address).send({ from: accounts[0] });
}

async function downloadFile(ipfsHash) {
    const stream = ipfs.get(ipfsHash);
    for await (const file of stream) {
        const data = file.content;
        fs.writeFileSync(`downloaded_${file.path}`, data);
    }
}

init();

// Server-side: Node.js/Express with user authentication and service orchestration
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const app = express();
mongoose.connect('mongodb://localhost:27017/storageSystem', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.send('Logged in');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.send('Registered');
});

app.get('/files', async (req, res) => {
    if (!req.session.user) {
        res.status(401).send('Unauthorized');
        return;
    }
    const files = await File.find({ owner: req.session.user._id });
    res.json(files);
});

app.post('/files', async (req, res) => {
    if (!req.session.user) {
        res.status(401).send('Unauthorized');
        return;
    }
    const { ipfsHash } = req.body;
    const file = new File({ ipfsHash, owner: req.session.user._id });
    await file.save();
    res.send('File uploaded');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});