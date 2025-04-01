import * as THREE from 'three';

export class Brick {
    static createPlaceholder() {
        const group = new THREE.Group();
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xA52A2A, // Brown
            roughness: 0.7 
        });

        // Create multiple stacks of bricks
        const stackCount = 4;
        const bricksPerStack = 4;
        
        for (let stack = 0; stack < stackCount; stack++) {
            const angle = (stack / stackCount) * Math.PI * 2;
            const radius = 0.25;
            const stackX = Math.cos(angle) * radius;
            const stackZ = Math.sin(angle) * radius;
            
            // Create a stack of bricks
            for (let i = 0; i < bricksPerStack; i++) {
                const brick = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.15, 0.2),
                    material
                );
                
                // Position bricks in the stack with slight randomness
                brick.position.set(
                    stackX + (Math.random() - 0.5) * 0.1,
                    i * 0.15 + 0.075, // Stack bricks vertically
                    stackZ + (Math.random() - 0.5) * 0.1
                );
                
                // Random rotation for natural look
                brick.rotation.y = (Math.random() - 0.5) * 0.3;
                brick.rotation.x = (Math.random() - 0.5) * 0.1;
                brick.rotation.z = (Math.random() - 0.5) * 0.1;
                
                brick.castShadow = true;
                group.add(brick);
            }
        }

        // Add some scattered bricks around
        const scatteredBricks = 6;
        for (let i = 0; i < scatteredBricks; i++) {
            const brick = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 0.15, 0.2),
                material
            );
            
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.4 + Math.random() * 0.2;
            
            brick.position.set(
                Math.cos(angle) * radius,
                Math.random() * 0.1 + 0.075,
                Math.sin(angle) * radius
            );
            
            brick.rotation.y = Math.random() * Math.PI;
            brick.rotation.x = (Math.random() - 0.5) * 0.2;
            brick.rotation.z = (Math.random() - 0.5) * 0.2;
            
            brick.castShadow = true;
            group.add(brick);
        }

        return group;
    }

    static get color() {
        return 0xCD5C5C; // Indian Red
    }
} 