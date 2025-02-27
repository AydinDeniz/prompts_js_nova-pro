// Client-side: JavaScript with WebRTC and CodeMirror for collaborative code editing
const { RTCPeerConnection, RTCSessionDescription } = window;
const codeMirror = require('codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/scroll/simplescrollbars');
require('codemirror/addon/scroll/annotatescrollbar');
require('codemirror/addon/selection/active-line');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/comment/comment');
require('codemirror/addon/search/searchcursor');
require('codemirror/addon/search/search');
require('codemirror/keymap/sublime');

let peerConnection;
let localCodeMirror;
let remoteCodeMirror;

async function init() {
    localCodeMirror = codeMirror(document.getElementById('local-editor'), {
        mode: 'javascript',
        theme: 'default',
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        placeholder: 'Start coding here...',
        scrollbarStyle: 'simple'
    });

    remoteCodeMirror = codeMirror(document.getElementById('remote-editor'), {
        mode: 'javascript',
        theme: 'default',
        lineNumbers: true,
        readOnly: true,
        matchBrackets: true,
        scrollbarStyle: 'simple'
    });

    peerConnection = new RTCPeerConnection();
    peerConnection.onicecandidate = handleIceCandidate;
    peerConnection.ondatachannel = handleDataChannel;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    document.getElementById('offer').value = JSON.stringify(offer);

    localCodeMirror.on('change', handleLocalCodeChange);
}

function handleIceCandidate(event) {
    if (event.candidate) {
        document.getElementById('ice-candidates').value += JSON.stringify(event.candidate) + '\n';
    }
}

function handleDataChannel(event) {
    const dataChannel = event.channel;
    dataChannel.onmessage = handleRemoteCodeChange;
    dataChannel.onopen = () => {
        console.log('Data channel opened');
    };
}

function handleLocalCodeChange(instance, change) {
    if (peerConnection.remoteDescription) {
        const dataChannel = peerConnection.getSenders()[0].channel;
        dataChannel.send(localCodeMirror.getValue());
    }
}

function handleRemoteCodeChange(event) {
    remoteCodeMirror.setValue(event.data);
}

async function connect() {
    const offer = JSON.parse(document.getElementById('offer').value);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
    document.getElementById('answer').value = JSON.stringify(answer);

    const iceCandidates = document.getElementById('ice-candidates').value.split('\n');
    for (const iceCandidate of iceCandidates) {
        if (iceCandidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(iceCandidate)));
        }
    }
}

init();

// Server-side: Node.js with Express for signaling server
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/offer', (req, res) => {
    const offer = req.body.offer;
    // Store offer for later use
    res.send({ success: true });
});

app.post('/answer', (req, res) => {
    const answer = req.body.answer;
    // Store answer for later use
    res.send({ success: true });
});

app.post('/ice-candidate', (req, res) => {
    const iceCandidate = req.body.iceCandidate;
    // Store ice candidate for later use
    res.send({ success: true });
});

app.listen(3000, () => {
    console.log('Signaling server running on port 3000');
});