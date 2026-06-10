import * as THREE from 'three';
import { Car } from './Car.js';
import { Track } from './Track.js';
import { Input } from './Input.js';
import { Camera } from './Camera.js';

export class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.car = null;
        this.track = null;
        this.input = null;
        this.cameraController = null;
        this.clock = new THREE.Clock();
        
        // Game state
        this.running = true;
        this.deltaTime = 0;
    }

    init() {
        this.setupRenderer();
        this.setupScene();
        this.setupLighting();
        this.track = new Track(this.scene);
        this.car = new Car(this.scene);
        this.input = new Input();
        this.cameraController = new Camera();
        
        this.animate();
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupRenderer() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        this.camera.position.set(0, 5, -15);
    }

    setupScene() {
        // Night sky background
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.Fog(0x0a0a1a, 500, 1000);
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.5);
        this.scene.add(ambientLight);

        // Directional light (moon)
        const dirLight = new THREE.DirectionalLight(0x4488ff, 0.8);
        dirLight.position.set(100, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.far = 500;
        this.scene.add(dirLight);

        // Neon lights along track
        const neonLight1 = new THREE.PointLight(0x00ff00, 2, 200);
        neonLight1.position.set(50, 10, 0);
        this.scene.add(neonLight1);

        const neonLight2 = new THREE.PointLight(0xff0080, 2, 200);
        neonLight2.position.set(-50, 10, 0);
        this.scene.add(neonLight2);

        const neonLight3 = new THREE.PointLight(0x00ccff, 2, 200);
        neonLight3.position.set(0, 10, 200);
        this.scene.add(neonLight3);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        
        this.deltaTime = Math.min(this.clock.getDelta(), 0.016); // Cap at 60fps
        
        // Update car
        this.car.update(this.deltaTime, this.input);
        
        // Update camera to follow car
        this.cameraController.updateCamera(this.camera, this.car.mesh, this.car.velocity);
        
        // Update HUD
        this.updateHUD();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    };

    updateHUD() {
        const speed = Math.round(this.car.speed * 3.6); // Convert m/s to km/h
        const rpm = Math.round(this.car.rpm);
        const gear = this.car.getGearDisplay();
        
        document.querySelector('.speed-value').textContent = speed.toString().padStart(3, '0');
        document.querySelector('.rpm-value').textContent = rpm.toString().padStart(5, '0');
        document.querySelector('.gear-value').textContent = gear;
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
