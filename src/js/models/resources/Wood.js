import * as THREE from 'three';

export class Wood {
    static createPlaceholder() {
        const group = new THREE.Group();
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, // SaddleBrown
            roughness: 0.8 
        });
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x006400, // DarkGreen
            roughness: 0.8 
        });

        // Create trees in rings for better distribution
        const treeCount = 5; // Increased from 3
        const rings = 2; // Organize trees in rings
        
        // Center tree
        this.createTree(group, trunkMaterial, leavesMaterial, 0, 0);
        
        // Ring of trees
        for (let ring = 0; ring < rings; ring++) {
            const ringRadius = 0.25 + ring * 0.2; // Radius for each ring
            const treesInRing = ring === 0 ? 4 : 6; // More trees in outer ring
            
            for (let i = 0; i < treesInRing; i++) {
                const angle = (i / treesInRing) * Math.PI * 2;
                const radiusVariation = (Math.random() - 0.5) * 0.1;
                const x = Math.cos(angle) * (ringRadius + radiusVariation);
                const z = Math.sin(angle) * (ringRadius + radiusVariation);
                
                this.createTree(group, trunkMaterial, leavesMaterial, x, z);
            }
        }

        return group;
    }

    static createTree(group, trunkMaterial, leavesMaterial, x, z) {
        const tree = new THREE.Group();
        
        // Trunk
        const trunkHeight = Math.random() * 0.3 + 0.4;
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, trunkHeight, 6),
            trunkMaterial
        );
        trunk.position.y = trunkHeight / 2;
        
        // Leaves
        const leavesRadius = Math.random() * 0.15 + 0.2;
        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(leavesRadius, 0.5, 8),
            leavesMaterial
        );
        leaves.position.y = trunkHeight + 0.2;
        
        tree.add(trunk);
        tree.add(leaves);
        
        // Position tree
        tree.position.set(x, 0, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        
        // Enable shadows
        trunk.castShadow = true;
        leaves.castShadow = true;
        
        group.add(tree);
    }

    static get color() {
        return 0x228B22; // Forest Green
    }
} 