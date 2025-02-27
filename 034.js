// Client-side: JavaScript with TensorFlow.js and Spotify API integration
const tf = require('@tensorflow/tfjs');
const SpotifyWebApi = require('spotify-web-api-js');
const spotify = new SpotifyWebApi();

let model;

async function init() {
    model = await tf.loadLayersModel('https://path-to-your-model/model.json');
    spotify.setAccessToken('your-spotify-access-token');
}

async function getRecommendations(userId) {
    const listeningHistory = await spotify.getMyTopTracks({ limit: 50 });
    const trackIds = listeningHistory.items.map(track => track.id);
    const audioFeatures = await spotify.getAudioFeaturesForTracks(trackIds);

    const inputTensor = tf.tensor2d(audioFeatures.audio_features.map(features => [
        features.danceability,
        features.energy,
        features.key,
        features.loudness,
        features.mode,
        features.speechiness,
        features.acousticness,
        features.instrumentalness,
        features.liveness,
        features.valence,
        features.tempo,
        features.time_signature
    ]));

    const predictions = model.predict(inputTensor);
    const recommendedTrackIds = predictions.argMax(-1).dataSync();

    const recommendedTracks = await spotify.getTracks(recommendedTrackIds.map(id => `spotify:track:${trackIds[id]}`));
    return recommendedTracks;
}

async function playRecommendedTracks(recommendedTracks) {
    const uris = recommendedTracks.tracks.map(track => track.uri);
    await spotify.play({ uris });
}

init();

// Example usage
getRecommendations('user-id').then(recommendedTracks => {
    playRecommendedTracks(recommendedTracks);
});

// Server-side: Node.js/Express for handling Spotify OAuth
const express = require('express');
const request = require('request');
const app = express();

app.get('/login', (req, res) => {
    const scopes = 'user-read-private user-read-email user-top-read streaming';
    res.redirect(`https://accounts.spotify.com/authorize?client_id=your-client-id&response_type=code&redirect_uri=your-redirect-uri&scope=${scopes}`);
});

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: 'your-redirect-uri',
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer.from('your-client-id:your-client-secret').toString('base64'))
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const accessToken = body.access_token;
            res.send(`Access Token: ${accessToken}`);
        } else {
            res.send('Authentication failed');
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});