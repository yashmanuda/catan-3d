import * as THREE from 'three';

export class RotationControls {
    constructor(camera) {
        this.camera = camera;
        this.target = new THREE.Vector3(0, 0, 0);
        this.rotationSpeed = 0;
        this.maxRotationSpeed = (2 * Math.PI) / 180; // One full rotation in 180 frames (3 seconds at 60fps)
        this.acceleration = this.maxRotationSpeed / 30; // Reach max speed in 30 frames (0.5 seconds)
        this.deceleration = this.maxRotationSpeed / 20; // Stop in 20 frames (0.33 seconds)
        this.currentRotation = 0;
        this.isRotating = false;
        this.direction = 0; // 1 for clockwise, -1 for counterclockwise

        // Store exact initial camera state
        this.initialPosition = camera.position.clone();
        this.initialY = this.initialPosition.y;
        
        const horizontalPos = new THREE.Vector2(camera.position.x, camera.position.z);
        this.initialDistance = horizontalPos.length();
        this.initialAngle = Math.atan2(camera.position.z, camera.position.x);

        this.updateCameraPosition();

        // Create rotation sound with fade effects
        this.rotationSound = new Audio('/src/assets/gears_sound_cut.wav');
        this.rotationSound.loop = true;
        this.rotationSound.volume = 0;  // Start with volume 0
        this.targetVolume = 0.3;  // Target volume for fade in
        this.fadeInProgress = 0;
        this.fadeOutProgress = 0;
        this.fadeState = 'none'; // 'none', 'in', or 'out'
    }

    startRotation(direction = 1) {
        this.isRotating = true;
        this.direction = direction;
        // Start rotation sound with fade in
        if (this.rotationSound.paused) {
            this.rotationSound.currentTime = 0;
            this.rotationSound.play().catch(e => console.warn('Audio play failed:', e));
        }
        this.fadeState = 'in';
        this.fadeInProgress = 0;
    }

    stopRotation() {
        this.isRotating = false;
        // Start fade out
        this.fadeState = 'out';
        this.fadeOutProgress = 0;
    }

    updateSound(deltaTime = 1/60) {
        const fadeInDuration = 0.2; // 200ms fade in
        const fadeOutDuration = 0.3; // 300ms fade out

        if (this.fadeState === 'in') {
            this.fadeInProgress = Math.min(this.fadeInProgress + deltaTime / fadeInDuration, 1);
            this.rotationSound.volume = this.targetVolume * this.fadeInProgress;
            if (this.fadeInProgress >= 1) {
                this.fadeState = 'none';
            }
        } else if (this.fadeState === 'out') {
            this.fadeOutProgress = Math.min(this.fadeOutProgress + deltaTime / fadeOutDuration, 1);
            this.rotationSound.volume = this.targetVolume * (1 - this.fadeOutProgress);
            if (this.fadeOutProgress >= 1) {
                this.fadeState = 'none';
                this.rotationSound.pause();
                this.rotationSound.currentTime = 0;
            }
        }
    }

    update() {
        // Update sound fading
        this.updateSound();

        if (this.isRotating) {
            // Accelerate
            this.rotationSpeed = Math.min(this.rotationSpeed + this.acceleration, this.maxRotationSpeed);
        } else {
            // Decelerate
            this.rotationSpeed = Math.max(this.rotationSpeed - this.deceleration, 0);
        }

        if (this.rotationSpeed > 0) {
            this.currentRotation += this.rotationSpeed * this.direction;
            this.updateCameraPosition();
        }
    }

    updateCameraPosition() {
        const angle = this.initialAngle + this.currentRotation;
        const newPosition = new THREE.Vector3(
            Math.cos(angle) * this.initialDistance,
            this.initialY,
            Math.sin(angle) * this.initialDistance
        );
        this.camera.position.copy(newPosition);
        this.camera.lookAt(this.target);
    }
} 