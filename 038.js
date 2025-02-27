// Client-side: JavaScript with A-Frame and Game State Manager
AFRAME.registerComponent('game-state-manager', {
    schema: {
        currentState: { type: 'string', default: 'start' }
    },

    init: function() {
        this.states = {
            start: this.startState.bind(this),
            playing: this.playingState.bind(this),
            end: this.endState.bind(this)
        };
    },

    startState: function() {
        console.log('Game started');
        // Initialize game environment
        this.el.emit('game-start');
    },

    playingState: function() {
        console.log('Game in progress');
        // Handle game logic and progression
        this.el.emit('game-playing');
    },

    endState: function() {
        console.log('Game ended');
        // Handle game end logic
        this.el.emit('game-end');
    },

    update: function() {
        const currentState = this.data.currentState;
        if (this.states[currentState]) {
            this.states[currentState]();
        }
    }
});

AFRAME.registerComponent('customizable-environment', {
    schema: {
        model: { type: 'string', default: '' },
        texture: { type: 'string', default: '' }
    },

    init: function() {
        this.loadModel();
    },

    loadModel: function() {
        const model = this.data.model;
        const texture = this.data.texture;
        if (model) {
            const gltfLoader = new THREE.GLTFLoader();
            gltfLoader.load(model, (gltf) => {
                const modelObject = gltf.scene;
                if (texture) {
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.load(texture, (texture) => {
                        modelObject.traverse((child) => {
                            if (child.isMesh) {
                                child.material.map = texture;
                                child.material.needsUpdate = true;
                            }
                        });
                    });
                }
                this.el.setObject3D('model', modelObject);
            });
        }
    }
});

// Example usage
const scene = document.querySelector('a-scene');

const gameStateManager = document.createElement('a-entity');
gameStateManager.setAttribute('game-state-manager', 'currentState: start');
scene.appendChild(gameStateManager);

const environment = document.createElement('a-entity');
environment.setAttribute('customizable-environment', {
    model: 'models/environment.gltf',
    texture: 'textures/environment.jpg'
});
scene.appendChild(environment);