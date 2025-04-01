import * as THREE from 'three';

export class Sheep {
    static createPlaceholder() {
        const group = new THREE.Group();
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFAFA, // Snow white
            roughness: 0.9 
        });
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xD3D3D3, // Light gray
            roughness: 0.7 
        });
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000, // Black
            roughness: 0.5
        });

        // Create 4 sheep (doubled from 2)
        const sheepPositions = [
            { x: 0.3, z: 0.3, rotation: Math.PI / 4 },
            { x: -0.3, z: 0.3, rotation: -Math.PI / 4 },
            { x: 0.3, z: -0.3, rotation: Math.PI * 3/4 },
            { x: -0.3, z: -0.3, rotation: -Math.PI * 3/4 }
        ];

        sheepPositions.forEach(pos => {
            const sheep = new THREE.Group();
            
            // Body (more wooly looking with slight random scaling)
            const body = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 16, 12),
                bodyMaterial
            );
            body.scale.set(
                0.8 + Math.random() * 0.1,
                0.7 + Math.random() * 0.1,
                0.8 + Math.random() * 0.1
            );
            
            // Head
            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 12, 8),
                headMaterial
            );
            head.position.set(0.2, 0.1, 0);
            
            // Eyes
            const eyeGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            
            // Position eyes on the head
            leftEye.position.set(0.06, 0.04, 0.06);
            rightEye.position.set(0.06, 0.04, -0.06);
            head.add(leftEye);
            head.add(rightEye);
            
            // Legs with slight randomization
            const legGeometry = new THREE.CylinderGeometry(0.02, 0.015, 0.12, 6);
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
            const legPositions = [
                [0.1, -0.1, 0.1],
                [-0.1, -0.1, 0.1],
                [0.1, -0.1, -0.1],
                [-0.1, -0.1, -0.1]
            ];
            
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.fromArray(pos);
                // Slight random leg angles
                leg.rotation.x = (Math.random() - 0.5) * 0.2;
                leg.rotation.z = (Math.random() - 0.5) * 0.2;
                leg.castShadow = true;
                sheep.add(leg);
            });

            sheep.add(body);
            sheep.add(head);
            
            // Position sheep within hex using predefined positions
            sheep.position.set(pos.x, 0.15, pos.z);
            sheep.rotation.y = pos.rotation;
            
            // Enable shadows
            body.castShadow = true;
            head.castShadow = true;
            leftEye.castShadow = true;
            rightEye.castShadow = true;
            
            group.add(sheep);
        });

        return group;
    }

    static get color() {
        return 0x90EE90; // Light green
    }
} 