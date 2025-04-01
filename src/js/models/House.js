import * as THREE from 'three';

export class House {
    constructor(color = 0x8B4513) {
        this.group = new THREE.Group();

        // House body (cube)
        const bodyGeometry = new THREE.BoxGeometry(1, 1.2, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        this.group.add(body);

        // Roof (cone)
        const roofGeometry = new THREE.ConeGeometry(0.8, 0.8, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 }); // Dark red
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 1;
        roof.castShadow = true;
        roof.receiveShadow = true;
        this.group.add(roof);

        // Door
        const doorGeometry = new THREE.PlaneGeometry(0.4, 0.6);
        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4A4A4A }); // Dark gray
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.z = 0.51; // Slightly in front of the body
        door.position.y = 0.3;
        door.castShadow = true;
        door.receiveShadow = true;
        this.group.add(door);

        // Window
        const windowGeometry = new THREE.PlaneGeometry(0.3, 0.3);
        const windowMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.8
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.z = 0.51;
        window.position.y = 0.8;
        window.position.x = 0.3;
        window.castShadow = true;
        window.receiveShadow = true;
        this.group.add(window);

        // Scale the entire house
        this.group.scale.set(0.25, 0.25, 0.25);
    }
} 