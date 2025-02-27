// Client-side: JavaScript with WebXR and Three.js
let scene, camera, renderer, xr;
let products = [];

async function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    document.body.appendChild(renderer.domElement);

    xr = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] });
    renderer.xr.setSession(xr);

    const response = await fetch('/api/products');
    products = await response.json();

    xr.addEventListener('select', onSelect);
    xr.addEventListener('end', onEnd);

    animate();
}

function onSelect(event) {
    const product = products[Math.floor(Math.random() * products.length)];
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

function onEnd() {
    // Handle end of selection
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();

// Server-side: Express.js with MongoDB
const express = require('express');
const mongoose = require('mongoose');

const app = express();
mongoose.connect('mongodb://localhost:27017/arShopping', { useNewUrlParser: true, useUnifiedTopology: true });

const productSchema = new mongoose.Schema({
    name: String,
    price: Number
});
const Product = mongoose.model('Product', productSchema);

app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});