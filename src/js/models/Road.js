import * as THREE from 'three';

export class Road {
    constructor() {
        this.group = new THREE.Group();
        
        // Create a flatter road that sits on the board surface
        const roadGeometry = new THREE.BoxGeometry(0.25, 0.04, 1); // Flatter height, slightly wider
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown color
            metalness: 0.3,
            roughness: 0.7
        });
        
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        
        // Position the road so it sits on the surface
        road.position.y = 0.02; // Half of the height to sit exactly on surface
        
        this.group.add(road);
        this.roadMesh = road;
        
        // Add shadow casting
        road.castShadow = true;
        road.receiveShadow = true;
    }
    
    setLength(length) {
        // Scale the road to match the edge length
        this.roadMesh.scale.z = length;
        // Adjust position to maintain centering
        this.roadMesh.position.z = length / 2;
    }
} 