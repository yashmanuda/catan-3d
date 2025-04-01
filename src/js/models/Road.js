import * as THREE from 'three';

export class Road {
    constructor() {
        this.group = new THREE.Group();

        // Create road body (rectangular prism)
        const roadGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.2);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown color
            metalness: 0.3,
            roughness: 0.7
        });
        const roadBody = new THREE.Mesh(roadGeometry, roadMaterial);
        roadBody.castShadow = true;
        roadBody.receiveShadow = true;
        this.group.add(roadBody);

        // Add road texture (wooden planks)
        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        woodTexture.wrapS = THREE.RepeatWrapping;
        woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(2, 1);
        roadBody.material.map = woodTexture;
        roadBody.material.needsUpdate = true;

        // Scale the entire road
        this.group.scale.set(0.4, 0.4, 0.4);
    }

    setLength(length) {
        // Reset scale and position
        this.group.scale.set(1, 1, 1);
        this.group.position.set(0, 0, 0);
        
        // Scale to exact edge length
        this.group.scale.x = length;
    }
} 