// Client-side: React.js with Ethereum blockchain integration
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import IdentityContract from './contracts/IdentityContract.json';

const App = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [did, setDid] = useState('');
    const [credentials, setCredentials] = useState([]);

    useEffect(() => {
        async function loadWeb3() {
            if (window.ethereum) {
                window.web3 = new Web3(window.ethereum);
                await window.ethereum.enable();
            } else if (window.web3) {
                window.web3 = new Web3(web3.currentProvider);
            } else {
                window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        }

        async function loadBlockchainData() {
            const web3 = window.web3;
            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);
            const networkId = await web3.eth.net.getId();
            const networkData = IdentityContract.networks[networkId];
            if (networkData) {
                const contract = new web3.eth.Contract(IdentityContract.abi, networkData.address);
                setContract(contract);
                const did = await contract.methods.getDID(accounts[0]).call();
                setDid(did);
                const credentials = await contract.methods.getCredentials(did).call();
                setCredentials(credentials);
            } else {
                window.alert('Smart contract not deployed to detected network.');
            }
        }

        loadWeb3();
        loadBlockchainData();
    }, []);

    const createDID = async () => {
        await contract.methods.createDID().send({ from: account });
    };

    const addCredential = async (credential) => {
        await contract.methods.addCredential(did, credential).send({ from: account });
    };

    return (
        <div>
            <h1>Decentralized Identity Management</h1>
            <p>Account: {account}</p>
            <p>DID: {did}</p>
            <button onClick={createDID}>Create DID</button>
            <form onSubmit={(e) => {
                e.preventDefault();
                const credential = e.target.credential.value;
                addCredential(credential);
            }}>
                <input type="text" name="credential" placeholder="Enter credential" />
                <button type="submit">Add Credential</button>
            </form>
            <h2>Credentials</h2>
            <ul>
                {credentials.map((credential, index) => (
                    <li key={index}>{credential}</li>
                ))}
            </ul>
        </div>
    );
};

export default App;

// Smart contract: IdentityContract.sol
pragma solidity ^0.6.0;

contract IdentityContract {
    struct Credential {
        string value;
    }

    struct DID {
        string id;
        Credential[] credentials;
    }

    mapping(address => DID) public dids;

    function createDID() public {
        dids[msg.sender] = DID(string(abi.encodePacked(msg.sender)), new Credential[](0));
    }

    function getDID(address _address) public view returns (string memory) {
        return dids[_address].id;
    }

    function addCredential(string memory _did, string memory _credential) public {
        require(keccak256(abi.encodePacked(_did)) == keccak256(abi.encodePacked(dids[msg.sender].id)), "Invalid DID");
        dids[msg.sender].credentials.push(Credential(_credential));
    }

    function getCredentials(string memory _did) public view returns (string[] memory) {
        require(keccak256(abi.encodePacked(_did)) == keccak256(abi.encodePacked(dids[msg.sender].id)), "Invalid DID");
        string[] memory credentials = new string[](dids[msg.sender].credentials.length);
        for (uint i = 0; i < dids[msg.sender].credentials.length; i++) {
            credentials[i] = dids[msg.sender].credentials[i].value;
        }
        return credentials;
    }
}