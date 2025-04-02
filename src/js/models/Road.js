import * as THREE from 'three';

export class Road {
    constructor() {
        this.group = new THREE.Group();
        
        // Create a road that matches the hexagon edge but slightly shorter for houses
        const roadGeometry = new THREE.BoxGeometry(1, 0.08, 0.15); // Made width thinner (0.15)
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x4B0082, // Dark purple (Indigo)
            metalness: 0.4,
            roughness: 0.6
        });
        
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        
        // Position the road to sit on top of the hexagon edge
        road.position.y = 0.04; // Half the height to sit on top of the edge
        road.rotation.y = Math.PI/2; // Rotate the road mesh 90 degrees clockwise
        
        this.group.add(road);
        this.roadMesh = road;
        
        // Add shadow casting
        road.castShadow = true;
        road.receiveShadow = true;
    }
    
    setLength(length) {
        // Scale the road to be slightly shorter to leave space for houses
        const shortenFactor = 0.85; // Leave 15% space for houses (7.5% on each end)
        this.roadMesh.scale.x = length * shortenFactor;
        
        // Center the shortened road
        this.roadMesh.position.x = 0;
    }
} 