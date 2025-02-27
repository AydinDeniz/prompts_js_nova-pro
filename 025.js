// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Web3 = require('web3');
const IPFS = require('ipfs-http-client');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const web3 = new Web3('https://rinkeby.infura.io/v3/your_infura_project_id');
const ipfs = IPFS.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const contractAddress = 'your_contract_address';
const contractABI = [/* ABI from the compiled contract */];

const contract = new web3.eth.Contract(contractABI, contractAddress);

app.post('/add-candidate', async (req, res) => {
    const { name } = req.body;
    const accounts = await web3.eth.getAccounts();
    const result = await contract.methods.addCandidate(name).send({ from: accounts[0] });
    res.json(result);
});

app.post('/vote', async (req, res) => {
    const { candidateId } = req.body;
    const accounts = await web3.eth.getAccounts();
    const result = await contract.methods.vote(candidateId).send({ from: accounts[0] });
    res.json(result);
});

app.get('/candidates', async (req, res) => {
    const candidates = await contract.methods.getCandidates().call();
    res.json(candidates);
});

app.post('/upload', async (req, res) => {
    const { data } = req.body;
    const result = await ipfs.add(data);
    res.json({ ipfsHash: result.path });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// src/Voting.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import IPFS from 'ipfs-http-client';

const ipfs = IPFS.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

const contractAddress = 'your_contract_address';
const contractABI = [/* ABI from the compiled contract */];

function Voting() {
    const [candidates, setCandidates] = useState([]);
    const [newCandidate, setNewCandidate] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState('');

    useEffect(() => {
        async function fetchCandidates() {
            const web3 = new Web3('https://rinkeby.infura.io/v3/your_infura_project_id');
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const candidates = await contract.methods.getCandidates().call();
            setCandidates(candidates);
        }

        fetchCandidates();
    }, []);

    const handleAddCandidate = async () => {
        const web3 = new Web3('https://rinkeby.infura.io/v3/your_infura_project_id');
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();
        await contract.methods.addCandidate(newCandidate).send({ from: accounts[0] });
        setNewCandidate('');
    };

    const handleVote = async () => {
        const web3 = new Web3('https://rinkeby.infura.io/v3/your_infura_project_id');
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();
        await contract.methods.vote(selectedCandidate).send({ from: accounts[0] });
    };

    const handleUpload = async () => {
        const result = await ipfs.add('Election data');
        console.log(result.path);
    };

    return (
        <div>
            <h1>Voting System</h1>
            <div>
                <input
                    type="text"
                    value={newCandidate}
                    onChange={(e) => setNewCandidate(e.target.value)}
                    placeholder="Add Candidate"
                />
                <button onClick={handleAddCandidate}>Add Candidate</button>
            </div>
            <div>
                <select onChange={(e) => setSelectedCandidate(e.target.value)}>
                    <option value="">Select Candidate</option>
                    {candidates.map((candidate, index) => (
                        <option key={index} value={candidate.id}>
                            {candidate.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleVote}>Vote</button>
            </div>
            <button onClick={handleUpload}>Upload to IPFS</button>
        </div>
    );
}

export default Voting;

// src/App.js
import React from 'react';
import Voting from './Voting';

function App() {
    return (
        <div className="App">
            <Voting />
        </div>
    );
}

export default App;