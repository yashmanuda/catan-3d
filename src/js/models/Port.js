import * as THREE from 'three';

export class Port {
    static getResourceColor(resourceType) {
        switch(resourceType) {
            case 'WOOD': return 0x2d4c1e; // Dark green
            case 'BRICK': return 0x8b4513; // Brown
            case 'ORE': return 0x4a4a4a; // Dark grey
            case 'WHEAT': return 0xdaa520; // Golden
            case 'SHEEP': return 0x90ee90; // Light green
            default: return 0x505050; // Dark grey for 3:1 ports
        }
    }

    static createShipMesh(resourceType = null) {
        const group = new THREE.Group();
        const shipColor = this.getResourceColor(resourceType);

        // Main hull (more boat-like shape)
        const hullShape = new THREE.Shape();
        hullShape.moveTo(-0.3, 0);
        hullShape.lineTo(0.3, 0);
        hullShape.lineTo(0.15, 0.3);
        hullShape.lineTo(-0.15, 0.3);
        hullShape.lineTo(-0.3, 0);

        const extrudeSettings = {
            steps: 1,
            depth: 0.6,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 3
        };

        const hullGeometry = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
        const hullMaterial = new THREE.MeshStandardMaterial({ 
            color: shipColor,
            roughness: 0.6 
        });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.rotation.x = -Math.PI / 2;
        hull.position.set(0, 0, -0.3);

        // Ship deck
        const deckGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const deckMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,  // Wooden deck
            roughness: 0.7 
        });
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 0.25;

        // Main mast
        const mastGeometry = new THREE.CylinderGeometry(0.02, 0.025, 0.8, 8);
        const mastMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.7 
        });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.set(0, 0.65, 0);

        // Main sail (curved shape)
        const sailShape = new THREE.Shape();
        sailShape.moveTo(-0.2, 0);
        sailShape.quadraticCurveTo(0, 0.15, 0.2, 0);
        sailShape.lineTo(0.15, 0.6);
        sailShape.quadraticCurveTo(0, 0.7, -0.15, 0.6);
        sailShape.lineTo(-0.2, 0);

        const sailGeometry = new THREE.ShapeGeometry(sailShape);
        const sailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            roughness: 0.4,
            side: THREE.DoubleSide 
        });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.set(0, 0.3, 0.1);
        sail.rotation.x = -0.2;

        // Add shadows
        hull.castShadow = true;
        deck.castShadow = true;
        mast.castShadow = true;
        sail.castShadow = true;

        group.add(hull);
        group.add(deck);
        group.add(mast);
        group.add(sail);

        // Scale down the entire ship
        group.scale.set(0.7, 0.7, 0.7);

        return group;
    }

    static createHydrant() {
        const group = new THREE.Group();

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.15, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0xcc0000,  // Fire hydrant red
            roughness: 0.6,
            metalness: 0.3
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.075;

        // Top cap
        const capGeometry = new THREE.CylinderGeometry(0.05, 0.04, 0.05, 8);
        const cap = new THREE.Mesh(capGeometry, baseMaterial);
        cap.position.y = 0.175;

        // Side nozzles
        const nozzleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.08, 8);
        const nozzleMaterial = new THREE.MeshStandardMaterial({
            color: 0xbbbbbb,  // Metal color
            roughness: 0.4,
            metalness: 0.6
        });

        const nozzle1 = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
        nozzle1.rotation.z = Math.PI / 2;
        nozzle1.position.set(0.06, 0.12, 0);

        const nozzle2 = nozzle1.clone();
        nozzle2.rotation.z = -Math.PI / 2;
        nozzle2.position.set(-0.06, 0.12, 0);

        group.add(base);
        group.add(cap);
        group.add(nozzle1);
        group.add(nozzle2);

        return group;
    }

    static createPortSign(ratio, resourceType = null) {
        const group = new THREE.Group();

        // Sign post
        const postGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
        const postMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.7 
        });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 0.6;

        // Sign board
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 256;

        // Draw sign background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = '#000000';
        context.lineWidth = 8;
        context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

        // Draw text
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        if (resourceType) {
            // 2:1 specific resource trade
            context.font = 'bold 120px Arial';
            context.fillText('2:1', canvas.width / 2, canvas.height / 2 - 40);
            context.font = 'bold 60px Arial';
            context.fillText(resourceType, canvas.width / 2, canvas.height / 2 + 50);
        } else {
            // 3:1 any resource trade
            context.font = 'bold 120px Arial';
            context.fillText('3:1', canvas.width / 2, canvas.height / 2 - 40);
            context.font = 'bold 60px Arial';
            context.fillText('ANY', canvas.width / 2, canvas.height / 2 + 50);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const signGeometry = new THREE.PlaneGeometry(0.6, 0.6);
        const signMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.y = 1.1;

        post.castShadow = true;
        sign.castShadow = true;

        group.add(post);
        group.add(sign);

        return group;
    }

    static createPort(ratio, resourceType = null, angle) {
        const group = new THREE.Group();

        // Create ship
        const ship = this.createShipMesh(resourceType);
        
        // Position ship in water, away from the hexagon
        const portDistance = 2.2; // Increased distance from center
        ship.position.x = Math.cos(angle) * portDistance;
        ship.position.z = Math.sin(angle) * portDistance;
        ship.position.y = -0.2; // Lower in water
        ship.rotation.y = angle + Math.PI / 2;

        // Create sign
        const sign = this.createPortSign(ratio, resourceType);
        // Position sign closer to the hexagon
        const signDistance = 1.8;
        sign.position.x = Math.cos(angle) * signDistance;
        sign.position.z = Math.sin(angle) * signDistance;
        sign.rotation.y = angle + Math.PI;

        // Create and position hydrant
        const hydrant = this.createHydrant();
        const hydrantDistance = 1.7;
        const hydrantOffset = 0.2; // Offset from sign
        hydrant.position.x = Math.cos(angle) * hydrantDistance + Math.cos(angle + Math.PI/2) * hydrantOffset;
        hydrant.position.z = Math.sin(angle) * hydrantDistance + Math.sin(angle + Math.PI/2) * hydrantOffset;

        group.add(ship);
        group.add(sign);
        group.add(hydrant);

        return group;
    }
} 