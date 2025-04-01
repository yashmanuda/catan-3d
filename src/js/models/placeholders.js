import * as THREE from 'three';

// --- Resource Placeholder Generation Functions ---
export function createWoodPlaceholder() {
    const group = new THREE.Group();
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 }); // SaddleBrown
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x006400, roughness: 0.8 }); // DarkGreen
    for (let i = 0; i < 3; i++) {
        const tree = new THREE.Group();
        const trunkHeight = Math.random() * 0.2 + 0.3; // Shorter trees
        const leavesRadius = Math.random() * 0.1 + 0.15;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, trunkHeight, 6), trunkMaterial);
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(leavesRadius, 0.4, 8), leavesMaterial);
        trunk.position.y = trunkHeight / 2;
        leaves.position.y = trunkHeight + 0.15;
        tree.add(trunk);
        tree.add(leaves);
        tree.position.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6);
        tree.rotation.y = Math.random() * Math.PI * 2;
        tree.castShadow = true;
        group.add(tree);
    }
    return group;
}

export function createBrickPlaceholder() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0xA52A2A, roughness: 0.7 }); // Brown
    for (let i = 0; i < 4; i++) {
        const brick = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.15), material);
        brick.position.set((Math.random() - 0.5) * 0.4, Math.random() * 0.15 + 0.05, (Math.random() - 0.5) * 0.4);
        brick.rotation.y = (Math.random() - 0.5) * 0.3;
         brick.castShadow = true;
        group.add(brick);
    }
    return group;
}

export function createWheatPlaceholder() {
     const group = new THREE.Group();
     const material = new THREE.MeshStandardMaterial({ color: 0xDAA520, roughness: 0.8 }); // Goldenrod
     for (let i = 0; i < 10; i++) {
         const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 5), material);
         stalk.position.set((Math.random() - 0.5) * 0.5, 0.2, (Math.random() - 0.5) * 0.5);
         stalk.rotation.x = (Math.random() - 0.5) * 0.1;
         stalk.rotation.z = (Math.random() - 0.5) * 0.1;
         stalk.castShadow = true;
         group.add(stalk);
     }
     return group;
}

export function createSheepPlaceholder() {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFAFA, roughness: 0.9 }); // Snow
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xD3D3D3, roughness: 0.7 }); // LightGray
    for (let i = 0; i < 2; i++) { // Create 1 or 2 sheep
         const sheep = new THREE.Group();
         const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6), bodyMaterial);
         body.scale.y = 0.7;
         const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), headMaterial);
         head.position.set(0.15, 0.08, 0);
         sheep.add(body);
         sheep.add(head);
         // Legs
         const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1, 4);
         const legMat = new THREE.MeshStandardMaterial({color: 0x444444});
         const legPositions = [[0.1, -0.1, 0.1], [-0.1, -0.1, 0.1], [0.1, -0.1, -0.1], [-0.1, -0.1, -0.1]];
         legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.fromArray(pos);
            sheep.add(leg);
         });
         sheep.position.set((Math.random() - 0.5) * 0.3, 0.1, (Math.random() - 0.5) * 0.3);
         sheep.rotation.y = Math.random() * Math.PI * 2;
         sheep.castShadow = true;
         group.add(sheep);
    }
    return group;
}

export function createOrePlaceholder() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 0x778899, roughness: 0.5, metalness: 0.3 }); // LightSlateGray
     for (let i = 0; i < 3; i++) {
         const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(Math.random() * 0.1 + 0.1, 0), material);
         rock.position.set((Math.random() - 0.5) * 0.5, Math.random() * 0.05 + 0.05, (Math.random() - 0.5) * 0.5);
         rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
         rock.castShadow = true;
         group.add(rock);
     }
    return group;
}

// --- Robber Creation ---
export function createRobberMesh() {
    const geometry = new THREE.CapsuleGeometry(0.15, 0.5, 4, 10); // Rounded pawn shape
    const material = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    // Note: position.y is set relative to the parent tile in Board.js
    return mesh;
} 