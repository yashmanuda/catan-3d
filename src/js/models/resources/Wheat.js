import * as THREE from 'three';

export class Wheat {
    static createPlaceholder() {
        const group = new THREE.Group();
        const stalkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xDAA520, // Goldenrod
            roughness: 0.8 
        });
        const grainMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFD700, // Gold
            roughness: 0.7,
            metalness: 0.1
        });

        // Create wheat stalks
        const stalkCount = 25; // Increased from 15
        const rings = 3; // Organize stalks in rings
        
        for (let ring = 0; ring < rings; ring++) {
            const ringRadius = 0.2 + ring * 0.2; // Increasing radius for each ring
            const stalksInRing = Math.floor(stalkCount / rings) + (ring * 2); // More stalks in outer rings
            
            for (let i = 0; i < stalksInRing; i++) {
                const stalkGroup = new THREE.Group();
                const angle = (i / stalksInRing) * Math.PI * 2;
                
                // Main stalk
                const stalk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.03, 0.6, 5),
                    stalkMaterial
                );
                stalk.position.y = 0.3;
                stalkGroup.add(stalk);
                
                // Create maize-like top
                const grainCount = 12;
                const grainRowCount = 6;
                
                for (let j = 0; j < grainCount; j++) {
                    const grainAngle = (j / grainCount) * Math.PI * 2;
                    
                    for (let k = 0; k < grainRowCount; k++) {
                        const grain = new THREE.Mesh(
                            new THREE.SphereGeometry(0.02, 4, 4),
                            grainMaterial
                        );
                        
                        const heightOffset = k * 0.04;
                        grain.position.set(
                            Math.cos(grainAngle) * 0.04,
                            0.5 + heightOffset,
                            Math.sin(grainAngle) * 0.04
                        );
                        
                        grain.rotation.x = Math.PI / 6;
                        grain.rotation.y = grainAngle;
                        
                        stalkGroup.add(grain);
                    }
                }
                
                // Add some randomness to the position within the ring
                const radiusVariation = (Math.random() - 0.5) * 0.1;
                stalkGroup.position.set(
                    Math.cos(angle) * (ringRadius + radiusVariation),
                    0,
                    Math.sin(angle) * (ringRadius + radiusVariation)
                );
                
                // Slight random tilt
                stalkGroup.rotation.x = (Math.random() - 0.5) * 0.2;
                stalkGroup.rotation.z = (Math.random() - 0.5) * 0.2;
                stalkGroup.rotation.y = Math.random() * Math.PI * 0.2; // Slight rotation variation
                
                // Enable shadows
                stalkGroup.traverse(object => {
                    if (object instanceof THREE.Mesh) {
                        object.castShadow = true;
                    }
                });
                
                group.add(stalkGroup);
            }
        }

        return group;
    }

    static get color() {
        return 0xFFD700; // Gold
    }
} 