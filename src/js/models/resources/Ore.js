import * as THREE from 'three';

export class Ore {
    static createPlaceholder() {
        const group = new THREE.Group();
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x778899, // Light slate gray
            roughness: 0.5,
            metalness: 0.3
        });

        // Create central rock formation
        const centerRocks = 3;
        for (let i = 0; i < centerRocks; i++) {
            const rock = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.2 + Math.random() * 0.1, 0),
                material
            );
            
            const angle = (i / centerRocks) * Math.PI * 2;
            const radius = 0.1;
            
            rock.position.set(
                Math.cos(angle) * radius,
                Math.random() * 0.1 + 0.2,
                Math.sin(angle) * radius
            );
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.scale.set(
                1 + Math.random() * 0.2,
                1 + Math.random() * 0.5,
                1 + Math.random() * 0.2
            );
            
            rock.castShadow = true;
            group.add(rock);
        }

        // Create surrounding rock formations
        const formations = 4;
        const rocksPerFormation = 3;
        
        for (let f = 0; f < formations; f++) {
            const formationAngle = (f / formations) * Math.PI * 2;
            const formationRadius = 0.3;
            const formationX = Math.cos(formationAngle) * formationRadius;
            const formationZ = Math.sin(formationAngle) * formationRadius;
            
            for (let i = 0; i < rocksPerFormation; i++) {
                const rock = new THREE.Mesh(
                    new THREE.IcosahedronGeometry(0.15 + Math.random() * 0.1, 0),
                    material
                );
                
                rock.position.set(
                    formationX + (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.15 + 0.1,
                    formationZ + (Math.random() - 0.5) * 0.2
                );
                
                rock.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                
                rock.scale.set(
                    1 + Math.random() * 0.2,
                    1 + Math.random() * 0.3,
                    1 + Math.random() * 0.2
                );
                
                rock.castShadow = true;
                group.add(rock);
            }
        }

        // Add some smaller scattered rocks
        const scatteredRocks = 8;
        for (let i = 0; i < scatteredRocks; i++) {
            const rock = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.08 + Math.random() * 0.05, 0),
                material
            );
            
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.4 + Math.random() * 0.2;
            
            rock.position.set(
                Math.cos(angle) * radius,
                Math.random() * 0.1 + 0.05,
                Math.sin(angle) * radius
            );
            
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            rock.castShadow = true;
            group.add(rock);
        }

        return group;
    }

    static get color() {
        return 0x808080; // Gray
    }
} 