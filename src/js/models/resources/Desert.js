import * as THREE from 'three';

export class Desert {
    static createPlaceholder() {
        const group = new THREE.Group();

        // Material for sand dunes
        const sandMaterial = new THREE.MeshStandardMaterial({
            color: 0xC19A6B,
            roughness: 0.9,
            metalness: 0.0
        });

        // Create multiple dunes of different sizes
        const dunePositions = [
            { x: 0, z: 0, scale: 1 },
            { x: -0.3, z: 0.2, scale: 0.7 },
            { x: 0.3, z: -0.2, scale: 0.8 },
            { x: 0, z: -0.4, scale: 0.6 },
            { x: -0.2, z: -0.3, scale: 0.5 }
        ];

        dunePositions.forEach(pos => {
            // Create main dune shape
            const duneGeometry = new THREE.ConeGeometry(0.4 * pos.scale, 0.3, 5);
            const dune = new THREE.Mesh(duneGeometry, sandMaterial);
            
            // Position and rotate the dune
            dune.position.set(pos.x, 0, pos.z);
            dune.rotation.y = Math.random() * Math.PI; // Random rotation
            
            // Slightly tilt the dune
            dune.rotation.x = -Math.PI * 0.1;
            
            // Add smaller detail dunes
            const detailDune = new THREE.Mesh(
                new THREE.ConeGeometry(0.2 * pos.scale, 0.2, 5),
                sandMaterial
            );
            detailDune.position.set(0.1, 0, 0.1);
            detailDune.rotation.y = Math.PI / 3;
            dune.add(detailDune);

            group.add(dune);
        });

        // Add some surface texture with small bumps
        const bumpCount = 8;
        for (let i = 0; i < bumpCount; i++) {
            const angle = (i / bumpCount) * Math.PI * 2;
            const radius = 0.4 + Math.random() * 0.2;
            
            const bump = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 4, 4),
                sandMaterial
            );
            
            bump.position.x = Math.cos(angle) * radius;
            bump.position.z = Math.sin(angle) * radius;
            bump.position.y = -0.1;
            bump.scale.y = 0.3;
            
            group.add(bump);
        }

        // Add the robber placeholder (black cylinder)
        const robberGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 8);
        const robberMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.7,
            metalness: 0.2
        });
        const robber = new THREE.Mesh(robberGeometry, robberMaterial);
        robber.position.set(0, 0.2, 0);
        group.add(robber);

        // Cast and receive shadows
        group.traverse(object => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        return group;
    }

    static get color() {
        return 0xC19A6B; // Sandy brown
    }
} 