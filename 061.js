// Client-side: JavaScript with WebXR for augmented reality shopping experience
const { XRSession, XRReferenceSpace, XRAnchor, XRHitTestSource } = require('webxr-polyfill');

let xrSession;
let hitTestSource;
let hitTestSourceRequested = false;

async function initializeXR() {
    const xr = navigator.xr;
    if (!xr) {
        console.error('WebXR not supported');
        return;
    }

    const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hit-test', 'dom-overlay'] };
    xrSession = await xr.requestSession('immersive-ar', sessionInit);
    xrSession.addEventListener('end', onSessionEnded);

    const referenceSpace = await xrSession.requestReferenceSpace('viewer');
    const gl = document.createElement('canvas').getContext('webgl');
    const model = await load3DModel('path-to-3d-model.glb');

    function onSelect(event) {
        if (!hitTestSourceRequested) {
            hitTestSourceRequested = true;
            xrSession.requestHitTestSource({ space: referenceSpace }).then(source => {
                hitTestSource = source;
            });
        }

        const hitTestResults = xrSession.getHitTestResults(hitTestSource);
        if (hitTestResults.length === 0) return;

        const hitPose = hitTestResults[0].getPose(referenceSpace);
        const anchor = xrSession.requestReferenceSpace('local').then(localSpace => {
            return xrSession.requestAnchor(hitPose, localSpace).then(anchor => {
                placeModel(anchor, model);
            });
        });
    }

    xrSession.addEventListener('select', onSelect);

    function placeModel(anchor, model) {
        const modelAnchor = new XRAnchor(anchor);
        const modelTransform = new XRRigidTransform({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0, w: 1 });
        modelAnchor.transform = modelTransform;

        const modelEntity = document.createElement('a-entity');
        modelEntity.setAttribute('gltf-model', `url(${model})`);
        modelEntity.setAttribute('position', '0 0 0');
        modelEntity.setAttribute('scale', '1 1 1');
        modelEntity.setAttribute('anchor', modelAnchor);

        document.querySelector('a-scene').appendChild(modelEntity);
    }

    function onSessionEnded() {
        hitTestSourceRequested = false;
        hitTestSource = null;
    }
}

async function load3DModel(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
    return URL.createObjectURL(blob);
}

document.getElementById('start-ar').addEventListener('click', initializeXR);