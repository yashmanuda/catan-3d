import * as THREE from 'three';

export class House {
    constructor(color = 0x4B0082) { // Indigo purple
        this.group = new THREE.Group();

        // Materials with enhanced finish
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.3,
            envMapIntensity: 0.8
        });

        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E0854, // Darker purple for roof
            roughness: 0.6,
            metalness: 0.2,
            envMapIntensity: 0.7
        });

        // Base of the hut (hexagonal)
        const baseGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.4, 6);
        const base = new THREE.Mesh(baseGeometry, wallMaterial);
        base.position.y = 0.2;
        this.group.add(base);

        // Roof (hexagonal cone)
        const roofGeometry = new THREE.ConeGeometry(0.35, 0.35, 6);
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 0.55;
        this.group.add(roof);

        // Enable shadows
        this.group.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // Scale the entire house
        this.group.scale.set(0.7, 0.7, 0.7);
    }

    setColor(color) {
        this.group.traverse((object) => {
            if (object instanceof THREE.Mesh && object.material.color) {
                if (object.material.color.getHex() === 0x4B0082) {
                    object.material.color.setHex(color);
                }
            }
        });
    }
} 