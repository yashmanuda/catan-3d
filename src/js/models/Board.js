import * as THREE from 'three';
import {
    hexRadius,
    hexHeight,
    gridRadius,
    resourceTypes,
    standardResourceCounts,
    numberTokenValues
} from '../config.js';
import { Port } from './Port.js';

export class Board {
    constructor() {
        this.group = new THREE.Group();
        this.tiles = [];
        this.flagGroups = [];
        this.resourceAnimations = new Map();
        this.robberPosition = null;
        
        // Enhanced data structures for corners and edges
        this.corners = new Map(); // Map<cornerId, {
                                //   position: Vector3,
                                //   hasSettlement: boolean,
                                //   connectedEdges: Set<edgeId>,
                                //   connectedTiles: Set<tileId>,
                                //   mesh: THREE.Mesh
                                // }>
        
        this.edges = new Map();   // Map<edgeId, {
                                //   start: cornerId,
                                //   end: cornerId,
                                //   hasRoad: boolean,
                                //   mesh: THREE.Mesh,
                                //   position: Vector3,
                                //   direction: Vector3,
                                //   length: number
                                // }>
        
        this.cornerIndicators = new Map();
        this.edgeIndicators = new Map();
        
        // Add tile number mapping for resource collection
        this.tilesByNumber = new Map(); // Map<number, Array<{position: Vector3, resource: string}>>
        
        this.setupGrid();
        this.group.position.y = 0;
    }

    createHexagonShape() {
        const shape = new THREE.Shape();
        const vertices = [];
        
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = Math.cos(angle) * hexRadius;
            const y = Math.sin(angle) * hexRadius;
            
            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
            vertices.push(new THREE.Vector2(x, y));
        }
        shape.lineTo(vertices[0].x, vertices[0].y);
        
        return shape;
    }

    createTileMesh(resource) {
        const group = new THREE.Group();

        // Create hexagon base with sharper edges
        const shape = this.createHexagonShape();
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: hexHeight * 0.5, // Make tiles thinner
            bevelEnabled: true,
            bevelThickness: 0.02, // Thinner bevel
            bevelSize: 0.02,
            bevelSegments: 3 // Fewer segments for sharper look
        });

        // Create base material with resource color
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: resource.color,
            roughness: 0.3,  // Less roughness for more vibrant colors
            metalness: 0.0,
            flatShading: false
        });

        // Create border material using the same resource color but darker
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(resource.color).multiplyScalar(0.8),  // Less dark border
            roughness: 0.4,
            metalness: 0.0
        });

        // Create two meshes: one for the base and one slightly larger for the border
        const borderGeometry = new THREE.ExtrudeGeometry(shape, {
            depth: hexHeight * 0.48, // Slightly thinner than base
            bevelEnabled: true,
            bevelThickness: 0.015,
            bevelSize: 0.015,
            bevelSegments: 3
        });

        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        const baseMesh = new THREE.Mesh(geometry, baseMaterial);
        
        // Scale the base mesh slightly smaller to show the border
        baseMesh.scale.set(0.98, 1, 0.98);
        
        borderMesh.rotation.x = -Math.PI / 2;
        baseMesh.rotation.x = -Math.PI / 2;
        
        borderMesh.castShadow = true;
        borderMesh.receiveShadow = true;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;

        group.add(borderMesh);
        group.add(baseMesh);

        // Add resource placeholder if available
        const placeholder = resource.createPlaceholder();
        if (placeholder) {
            placeholder.position.y = hexHeight * 0.25; // Lower position for thinner tiles
            placeholder.scale.set(0.7, 0.7, 0.7);
            group.add(placeholder);
            
            // Store animation data for this resource
            this.resourceAnimations.set(placeholder, {
                time: Math.random() * Math.PI * 2, // Random starting phase
                type: resource.type
            });
        }

        return group;
    }

    createFlag(number, isRobberTile = false) {
        const group = new THREE.Group();
        
        // Store the number in the flag's userData
        group.userData = { number };
        
        // Create the flag pole
        const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 12);
        const poleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xCCCCCC,
            metalness: 0.4,
            roughness: 0.5
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 0.6;
        group.add(pole);
        
        // Create a sub-group for the flag and its contents that will rotate together
        const flagContents = new THREE.Group();
        group.add(flagContents);
        
        // Create the flag background
        const flagGeometry = new THREE.PlaneGeometry(0.8, 0.4);
        const flagMaterial = new THREE.MeshStandardMaterial({ 
            color: isRobberTile ? 0xFF0000 : 0xFFFFFF,
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 0.2,
            emissive: isRobberTile ? 0xFF0000 : 0xFFFFFF,
            emissiveIntensity: 0.1
        });
        
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(0.35, 0.85, 0);  // Raised flag position to match longer pole
        flagContents.add(flag);
        
        // Create high-resolution number texture
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Clear background
        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw number
        context.fillStyle = isRobberTile ? '#FFFFFF' : '#000000';
        context.font = 'bold 280px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(number.toString(), canvas.width / 2, canvas.height / 2);
        
        const numberTexture = new THREE.CanvasTexture(canvas);
        numberTexture.anisotropy = 16;
        numberTexture.minFilter = THREE.LinearMipmapLinearFilter;
        numberTexture.magFilter = THREE.LinearFilter;
        
        const numberMaterial = new THREE.MeshBasicMaterial({
            map: numberTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        const numberPlane = new THREE.PlaneGeometry(0.5, 0.25);
        const numberMesh = new THREE.Mesh(numberPlane, numberMaterial);
        numberMesh.position.set(0.35, 0.85, 0.001);  // Raised number position
        flagContents.add(numberMesh);
        
        // Add dots based on probability
        const dotConfigs = {
            2: 1,
            3: 2,
            4: 3,
            5: 4,
            6: 5,
            8: 5,
            9: 4,
            10: 3,
            11: 2,
            12: 1
        };
        
        const numDots = dotConfigs[number] || 0;
        const dotSpacing = 0.08;  // Slightly reduced spacing for better centering
        const dotRadius = 0.02;
        
        // Calculate total width of dots to center them
        const totalDotsWidth = (numDots - 1) * dotSpacing;
        const startX = 0.35 - (totalDotsWidth / 2);  // Center dots horizontally
        const dotY = 0.73;  // Adjusted dot height to be centered between number and bottom of flag
        
        // Create dots
        for (let i = 0; i < numDots; i++) {
            const dotGeometry = new THREE.CircleGeometry(dotRadius, 16);
            const dotMaterial = new THREE.MeshBasicMaterial({ 
                color: isRobberTile ? 0xFFFFFF : 0x000000,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.set(startX + (i * dotSpacing), dotY, 0.001);
            flagContents.add(dot);
        }
        
        // Position the flagContents group relative to the pole
        flagContents.position.x = 0.05;
        
        return group;
    }

    createDesertPlaceholder() {
        const group = new THREE.Group();
        
        // Create elevated base
        const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 6);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xC19A6B,
            roughness: 0.8 
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.15;
        group.add(base);
        
        // Create robber
        const robberGroup = new THREE.Group();
        
        // Robber body
        const bodyGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            roughness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.4;
        robberGroup.add(body);
        
        // Robber eyes (red glowing)
        const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF0000,
            emissive: 0xFF0000,
            emissiveIntensity: 1
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.06, 0.6, 0.1);
        robberGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.06, 0.6, 0.1);
        robberGroup.add(rightEye);
        
        group.add(robberGroup);
        
        // Add sand dunes
        const numDunes = 6;
        const duneRadius = 0.35;
        for (let i = 0; i < numDunes; i++) {
            const angle = (i / numDunes) * Math.PI * 2;
            const duneGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
            const duneMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xC19A6B,
                roughness: 0.9
            });
            const dune = new THREE.Mesh(duneGeometry, duneMaterial);
            dune.position.x = Math.cos(angle) * duneRadius;
            dune.position.z = Math.sin(angle) * duneRadius;
            dune.position.y = 0.1;
            dune.rotation.y = Math.random() * Math.PI;
            group.add(dune);
        }
        
        return group;
    }

    getHexPosition(q, r) {
        // For flat-topped hexagons that connect at sides:
        const x = hexRadius * 3/2 * q;
        const z = hexRadius * Math.sqrt(3) * (r + q/2);
        return { x, z };
    }

    createCornerMarker(position) {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            metalness: 0.5,
            roughness: 0.5
        });
        const corner = new THREE.Mesh(geometry, material);
        corner.position.copy(position);
        corner.userData.isCorner = true;
        corner.userData.hasSettlement = false;
        corner.castShadow = true;
        corner.receiveShadow = true;
        corner.visible = false; // Hide by default
        return corner;
    }

    highlightAvailableCorners() {
        // Clear previous highlights
        this.hideCorners();

        // Get all corners from the board
        for (const [cornerKey, cornerData] of this.corners) {
            const corner = cornerData.mesh;
            
            // Check if this is a valid settlement location
            if (!cornerData.hasSettlement) {
                let isValid = true;
                
                // Check adjacent corners
                for (const edgeKey of cornerData.connectedEdges) {
                    const edge = this.edges.get(edgeKey);
                    if (!edge) continue;
                    
                    const otherCornerKey = edge.start === cornerKey ? edge.end : edge.start;
                    const otherCorner = this.corners.get(otherCornerKey);
                    
                    if (otherCorner && otherCorner.hasSettlement) {
                        isValid = false;
                        break;
                    }
                }
                
                if (isValid) {
                    // Create pulsating indicator
                    const geometry = new THREE.SphereGeometry(0.15, 32, 32);
                    
                    // Create outer glow material
                    const glowMaterial = new THREE.MeshStandardMaterial({
                        color: 0x00ff88,
                        transparent: true,
                        opacity: 0.3,
                        emissive: 0x00ff88,
                        emissiveIntensity: 0.3
                    });

                    // Create inner sphere material
                    const coreMaterial = new THREE.MeshStandardMaterial({
                        color: 0x00ff88,
                        transparent: true,
                        opacity: 0.7,
                        emissive: 0x00ff88,
                        emissiveIntensity: 0.5
                    });

                    // Create outer glow sphere
                    const glowSphere = new THREE.Mesh(geometry, glowMaterial);
                    
                    // Create smaller inner sphere
                    const coreGeometry = new THREE.SphereGeometry(0.08, 32, 32);
                    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);

                    // Create a group to hold both spheres
                    const indicator = new THREE.Group();
                    indicator.add(glowSphere);
                    indicator.add(coreSphere);
                    
                    // Position the indicator at the corner
                    indicator.position.copy(corner.position);
                    indicator.position.y += 0.1;
                    
                    // Add to the board and store for animation
                    this.group.add(indicator);
                    this.cornerIndicators.set(corner, {
                        mesh: indicator,
                        glow: glowSphere,
                        core: coreSphere,
                        time: Date.now() * 0.001,
                        glowMaterial,
                        coreMaterial
                    });
                }
            }
        }
    }

    hideCorners() {
        // Remove all corner indicators
        this.cornerIndicators.forEach((data, corner) => {
            this.group.remove(data.mesh);
        });
        this.cornerIndicators.clear();
    }

    updateCornerAnimations() {
        const time = Date.now() * 0.001;
        this.cornerIndicators.forEach((data, corner) => {
            // Slower, more subtle pulsing animation
            const pulseSpeed = 1.5;
            const glowScale = 1 + Math.sin(time * pulseSpeed) * 0.1;
            const coreScale = 1 + Math.sin(time * pulseSpeed + Math.PI) * 0.05;
            
            // Update scales
            data.glow.scale.set(glowScale, glowScale, glowScale);
            data.core.scale.set(coreScale, coreScale, coreScale);
            
            // More subtle opacity changes
            data.glowMaterial.opacity = 0.3 + Math.sin(time * pulseSpeed) * 0.1;
            data.coreMaterial.opacity = 0.7 + Math.sin(time * pulseSpeed + Math.PI) * 0.05;
            
            // More stable emissive intensity
            data.glowMaterial.emissiveIntensity = 0.3 + Math.sin(time * pulseSpeed) * 0.1;
            data.coreMaterial.emissiveIntensity = 0.5 + Math.sin(time * pulseSpeed + Math.PI) * 0.1;
            
            // Slower rotation
            data.mesh.rotation.y = time * 0.3;
        });
    }

    isValidEdge(edgeKey) {
        const edgeData = this.edges.get(edgeKey);
        if (!edgeData) return false;

        // Get the corner data
        const startCorner = this.corners.get(edgeData.start);
        const endCorner = this.corners.get(edgeData.end);

        // Both corners must exist and be part of the board
        if (!startCorner || !endCorner) return false;
        if (!startCorner.isOnBoard || !endCorner.isOnBoard) return false;

        return true;
    }

    isValidRoadLocation(edgeKey) {
        const edgeData = this.edges.get(edgeKey);
        if (!edgeData || edgeData.hasRoad) return false;
        
        // Get connected corners
        const startCorner = this.corners.get(edgeData.start);
        const endCorner = this.corners.get(edgeData.end);
        
        if (!startCorner || !endCorner) return false;
        
        // Valid if the edge connects two adjacent corners
        // (this is always true in our current implementation since edges are only created between adjacent corners)
        return true;
    }

    highlightAvailableEdges() {
        if (this.mode !== 'road') return;
        // Clear previous highlights
        this.hideEdges();
        
        // Check each edge
        for (const [edgeKey, edgeData] of this.edges) {
            if (this.isValidRoadLocation(edgeKey)) {
                const indicator = this.createEdgeIndicator(edgeData);
                if (indicator) {
                    indicator.userData.edgeKey = edgeKey;
                    indicator.userData.isEdge = true;
                    this.group.add(indicator);
                    this.edgeIndicators.set(edgeKey, {
                        mesh: indicator,
                        materials: {
                            glow: indicator.children[0].material
                        }
                    });
                }
            }
        }
    }

    createEdgeIndicator(edgeData) {
        // Get the corner positions
        const startCorner = this.corners.get(edgeData.start);
        const endCorner = this.corners.get(edgeData.end);
        
        if (!startCorner || !endCorner) return null;
        
        // Calculate exact dimensions and position
        const length = startCorner.position.distanceTo(endCorner.position);
        const direction = new THREE.Vector3()
            .subVectors(endCorner.position, startCorner.position)
            .normalize();
        
        // Create glow effect that matches road dimensions exactly
        const glowGeometry = new THREE.BoxGeometry(length, 0.08, 0.25);
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.4,
            emissive: 0xffff00,
            emissiveIntensity: 0.6
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        
        // Position at midpoint between corners
        const midpoint = new THREE.Vector3()
            .addVectors(startCorner.position, endCorner.position)
            .multiplyScalar(0.5);
        
        const group = new THREE.Group();
        group.position.copy(midpoint);
        group.position.y = 0.25; // Match road height above hexagon edge
        
        // Calculate rotation to align with the edge
        const angle = Math.atan2(direction.x, direction.z);
        group.rotation.y = angle + Math.PI/2; // Add 90 degrees clockwise rotation
        
        group.add(glow);
        
        // Store edge data in both group and glow mesh
        const edgeInfo = {
            isEdge: true,
            edgeKey: edgeData.id,
            start: edgeData.start,
            end: edgeData.end
        };
        
        group.userData = edgeInfo;
        glow.userData = edgeInfo;
        
        return group;
    }

    hideEdges() {
        // Remove all edge indicators
        this.edgeIndicators.forEach((data, edge) => {
            this.group.remove(data.mesh);
        });
        this.edgeIndicators.clear();
    }

    setupGrid() {
        // Create array of resource types based on standard distribution
        const resources = [];
        for (const [type, count] of Object.entries(standardResourceCounts)) {
            for (let i = 0; i < count; i++) {
                // Store the resource type name along with the resource object
                resources.push({ type: type, data: resourceTypes[type] });
            }
        }
        
        // Shuffle resources
        for (let i = resources.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [resources[i], resources[j]] = [resources[j], resources[i]];
        }

        // Shuffle number tokens (excluding desert)
        const numbers = [...numberTokenValues];
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        let resourceIndex = 0;
        let numberIndex = 0;

        // Generate hexagonal grid
        for (let q = -gridRadius; q <= gridRadius; q++) {
            const r1 = Math.max(-gridRadius, -q - gridRadius);
            const r2 = Math.min(gridRadius, -q + gridRadius);
            for (let r = r1; r <= r2; r++) {
                const resource = resources[resourceIndex++];
                const position = this.getHexPosition(q, r);
                
                // Create tile group
                const tileGroup = new THREE.Group();
                tileGroup.userData = { q, r, resource: resource.data }; // Store resource data
                
                // Create base hex tile with resource placeholder
                const tileMesh = this.createTileMesh(resource.data);
                tileGroup.add(tileMesh);

                // Add number flag if not desert
                if (resource.type !== 'DESERT') {
                    const number = numbers[numberIndex++];
                    const flag = this.createFlag(number, false);
                    flag.position.y = hexHeight;
                    tileGroup.add(flag);
                    this.flagGroups.push(flag);

                    // Store tile info for resource collection
                    if (!this.tilesByNumber.has(number)) {
                        this.tilesByNumber.set(number, []);
                    }
                    
                    // Store corner positions for this hex
                    const hexCorners = [];
                    for (let i = 0; i < 6; i++) {
                        const angle = (i * Math.PI) / 3;
                        const cornerX = position.x + Math.cos(angle) * hexRadius;
                        const cornerZ = position.z + Math.sin(angle) * hexRadius;
                        const cornerPos = new THREE.Vector3(cornerX, 0.1, cornerZ);
                        const cornerKey = this.getCornerKey(cornerPos);
                        hexCorners.push(cornerKey);
                    }

                    // Store tile data with number, resource, and corners
                    const resourceName = resource.type === 'WHEAT' ? 'grain' : 
                                       resource.type === 'SHEEP' ? 'wool' : 
                                       resource.type.toLowerCase();

                    const tileData = {
                        position,
                        resource: resourceName,
                        number,
                        q,
                        r,
                        corners: hexCorners
                    };
                    console.log(`Storing tile data for number ${number}:`, tileData);
                    this.tilesByNumber.get(number).push(tileData);
                } else {
                    const placeholder = this.createDesertPlaceholder();
                    placeholder.position.y = hexHeight;
                    tileGroup.add(placeholder);
                }

                // Position tile group
                tileGroup.position.set(position.x, 0, position.z);
                
                this.group.add(tileGroup);
                this.tiles.push(tileGroup);
            }
        }

        // First pass: Create corners and track which hexagons they belong to
        const cornerPositions = new Map(); // Temporary map to store unique corner positions
        this.tiles.forEach(tile => {
            const center = tile.position;
            const angle = Math.PI / 3;
            tile.userData.tileId = tile.uuid;
            
            // Create corners for this tile
            for (let i = 0; i < 6; i++) {
                const cornerX = center.x + Math.cos(i * angle) * hexRadius;
                const cornerZ = center.z + Math.sin(i * angle) * hexRadius;
                const cornerPos = new THREE.Vector3(cornerX, 0.1, cornerZ);
                const cornerKey = this.getCornerKey(cornerPos);
                
                if (!cornerPositions.has(cornerKey)) {
                    cornerPositions.set(cornerKey, {
                        position: cornerPos,
                        tiles: new Set([tile.userData.tileId])
                    });
                } else {
                    cornerPositions.get(cornerKey).tiles.add(tile.userData.tileId);
                }
            }
        });

        // Create actual corner objects with proper topology
        let cornerId = 1;
        cornerPositions.forEach((data, cornerKey) => {
            const cornerMesh = this.createCornerMarker(data.position);
            this.group.add(cornerMesh);
            
            this.corners.set(cornerKey, {
                id: cornerId++,
                position: data.position,
                hasSettlement: false,
                connectedEdges: new Set(),
                connectedTiles: data.tiles,
                mesh: cornerMesh
            });
        });

        // Create edges with proper topology
        let edgeId = 1;
        const processedEdges = new Set();

        this.tiles.forEach(tile => {
            const center = tile.position;
            const angle = Math.PI / 3;
            
            for (let i = 0; i < 6; i++) {
                // Calculate exact corner positions
                const corner1X = center.x + Math.cos(i * angle) * hexRadius;
                const corner1Z = center.z + Math.sin(i * angle) * hexRadius;
                const corner1Pos = new THREE.Vector3(corner1X, 0.15, corner1Z);
                const corner1Key = this.getCornerKey(corner1Pos);

                const corner2X = center.x + Math.cos(((i + 1) % 6) * angle) * hexRadius;
                const corner2Z = center.z + Math.sin(((i + 1) % 6) * angle) * hexRadius;
                const corner2Pos = new THREE.Vector3(corner2X, 0.15, corner2Z);
                const corner2Key = this.getCornerKey(corner2Pos);

                // Ensure consistent edge key ordering
                const [startKey, endKey] = [corner1Key, corner2Key].sort();
                const edgeKey = `${startKey}-${endKey}`;

                if (!processedEdges.has(edgeKey)) {
                    processedEdges.add(edgeKey);

                    const corner1 = this.corners.get(corner1Key);
                    const corner2 = this.corners.get(corner2Key);

                    // Calculate exact edge position and direction
                    const position = new THREE.Vector3()
                        .addVectors(corner1.position, corner2.position)
                        .multiplyScalar(0.5);
                    position.y = 0; // Set to board surface level

                    const direction = new THREE.Vector3()
                        .subVectors(corner2.position, corner1.position)
                        .normalize();

                    // Store edge data with exact measurements
                    this.edges.set(edgeKey, {
                        id: edgeId++,
                        start: corner1Key,
                        end: corner2Key,
                        hasRoad: false,
                        position: position,
                        direction: direction,
                        length: corner1.position.distanceTo(corner2.position),
                        connectedTiles: new Set([...corner1.connectedTiles].filter(x => corner2.connectedTiles.has(x)))
                    });

                    corner1.connectedEdges.add(edgeKey);
                    corner2.connectedEdges.add(edgeKey);
                }
            }
        });

        // Validate topology
        for (const [cornerKey, corner] of this.corners) {
            if (corner.connectedTiles.size > 3) {
                console.warn(`Corner at ${cornerKey} is connected to ${corner.connectedTiles.size} hexagons!`);
            }
        }

        for (const [edgeKey, edge] of this.edges) {
            if (edge.connectedTiles.size > 2) {
                console.warn(`Edge at ${edgeKey} is connected to ${edge.connectedTiles.size} hexagons!`);
            }
        }
    }

    updateFlagRotations(cameraPosition) {
        // Update flag rotations - now rotating the entire flag group
        this.flagGroups.forEach(flagGroup => {
            const flagPosition = new THREE.Vector3();
            flagGroup.getWorldPosition(flagPosition);
            const direction = new THREE.Vector3()
                .subVectors(cameraPosition, flagPosition)
                .normalize();
            const rotation = Math.atan2(direction.x, direction.z);
            
            // Rotate the entire flag group
            flagGroup.rotation.y = rotation;
        });

        // Update corner animations
        this.updateCornerAnimations();

        // Update resource animations
        const time = Date.now() * 0.001; // Current time in seconds
        this.resourceAnimations.forEach((animation, resource) => {
            const baseY = hexHeight * 0.25;
            const amplitude = 0.1; // Maximum vertical movement
            const frequency = 2; // Oscillation frequency
            
            // Different animations for different resource types
            switch(animation.type) {
                case 'WOOD':
                    // Gentle swaying motion
                    resource.position.y = baseY + Math.sin(time * frequency + animation.time) * amplitude;
                    resource.rotation.y = Math.sin(time * frequency * 0.5 + animation.time) * 0.1;
                    break;
                case 'SHEEP':
                    // Bouncing motion
                    resource.position.y = baseY + Math.abs(Math.sin(time * frequency * 1.5 + animation.time)) * amplitude;
                    break;
                case 'WHEAT':
                    // Wave-like motion
                    resource.position.y = baseY + Math.sin(time * frequency * 0.8 + animation.time) * amplitude;
                    resource.rotation.z = Math.sin(time * frequency * 0.8 + animation.time) * 0.1;
                    break;
                case 'ORE':
                    // Subtle floating motion
                    resource.position.y = baseY + Math.sin(time * frequency * 0.6 + animation.time) * amplitude * 0.5;
                    break;
                case 'BRICK':
                    // Minimal movement
                    resource.position.y = baseY + Math.sin(time * frequency * 0.4 + animation.time) * amplitude * 0.3;
                    break;
            }
        });
    }

    // Update method to move the robber
    moveRobber(q, r) {
        this.robberPosition = { q, r };
        this.updateFlags();
    }

    // Update method to refresh all flags
    updateFlags() {
        // Clear existing flags
        this.flagGroups.forEach(flag => {
            flag.parent.remove(flag);
        });
        this.flagGroups = [];

        // Recreate all flags
        this.tiles.forEach((tileGroup) => {
            // Skip if no userData (shouldn't happen) or if it's a desert tile
            if (!tileGroup.userData || !tileGroup.children[0]) return;

            const q = tileGroup.userData.q;
            const r = tileGroup.userData.r;
            
            // Find the number for this tile
            const resourceType = tileGroup.children[0].userData?.resourceType;
            if (resourceType === 'DESERT') return;

            // Get the number from the original flag if it exists
            let number = 0;
            tileGroup.children.forEach(child => {
                if (child.userData?.number) {
                    number = child.userData.number;
                }
            });

            if (number === 0) return; // Skip if no number found

            const isRobberTile = this.robberPosition && 
                this.robberPosition.q === q && 
                this.robberPosition.r === r;

            const flag = this.createFlag(number, isRobberTile);
            flag.position.y = hexHeight;
            flag.userData = { number }; // Store the number for future reference
            tileGroup.add(flag);
            this.flagGroups.push(flag);
        });
    }

    isValidSettlementLocation(corner) {
        // Get the corner key from the corner position
        const cornerKey = this.getCornerKey(corner.position);
        const cornerData = this.corners.get(cornerKey);
        
        if (!cornerData) {
            console.log('Corner not found:', cornerKey);
            return false;
        }
        
        // Rule 1: Only one settlement per corner
        if (cornerData.hasSettlement) {
            console.log('Corner already has a settlement');
            return false;
        }
        
        // Rule 2: No settlements on adjacent corners (connected by edges)
        for (const edgeKey of cornerData.connectedEdges) {
            const edge = this.edges.get(edgeKey);
            if (!edge) continue;
            
            const otherCornerKey = edge.start === cornerKey ? edge.end : edge.start;
            const otherCorner = this.corners.get(otherCornerKey);
            
            if (otherCorner && otherCorner.hasSettlement) {
                console.log('Adjacent corner has a settlement');
                return false;
            }
        }
        
        return true;
    }

    getAdjacentCorners(cornerKey) {
        const cornerData = this.corners.get(cornerKey);
        if (!cornerData) return [];
        
        const adjacentCorners = new Set();
        
        // Get all edges connected to this corner
        for (const edgeKey of cornerData.connectedEdges) {
            const edge = this.edges.get(edgeKey);
            // Add the corner at the other end of each edge
            if (edge.start === cornerKey) {
                adjacentCorners.add(edge.end);
            } else {
                adjacentCorners.add(edge.start);
            }
        }
        
        return Array.from(adjacentCorners);
    }

    markSettlement(cornerKey) {
        const cornerData = this.corners.get(cornerKey);
        if (cornerData) {
            cornerData.hasSettlement = true;
            console.log(`Marked settlement at corner ${cornerKey}`);
            console.log('Corner data:', cornerData);
        }
    }

    updateEdgeIndicators() {
        const time = Date.now() * 0.001;
        
        this.edgeIndicators.forEach((data) => {
            if (data.materials && data.materials.glow) {
                // Pulse the glow effect
                const pulseIntensity = 0.5 + Math.sin(time * 2) * 0.3;
                const pulseOpacity = 0.4 + Math.sin(time * 2) * 0.2;
                
                data.materials.glow.emissiveIntensity = pulseIntensity;
                data.materials.glow.opacity = pulseOpacity;
            }
        });
    }

    getCornerKey(position) {
        const x = Math.round(position.x * 100);
        const z = Math.round(position.z * 100);
        return `${x},${z}`;
    }

    markRoad(edgeKey) {
        const edgeData = this.edges.get(edgeKey);
        if (edgeData) {
            edgeData.hasRoad = true;
        }
    }

    setMode(mode) {
        this.mode = mode;
        
        // Hide all indicators when changing modes
        this.hideCorners();
        this.hideEdges();

        // Only show available edges if in road placement mode
        if (mode === 'road') {
            this.highlightAvailableEdges();
        }
    }

    // Add method to collect resources based on dice roll
    collectResources(diceRoll) {
        if (diceRoll === 7) return new Map();

        const resourcesCollected = new Map();
        const tiles = this.tilesByNumber.get(diceRoll) || [];
        
        console.log(`Processing roll ${diceRoll}. Found ${tiles.length} matching tiles:`, tiles);
        
        tiles.forEach(tile => {
            console.log(`Processing tile with number ${tile.number}, resource ${tile.resource}`);
            let settlementsOnThisTile = 0;
            
            // Check each corner stored with this tile
            tile.corners.forEach(cornerKey => {
                const cornerData = this.corners.get(cornerKey);
                console.log(`Checking corner ${cornerKey}:`, cornerData);
                
                if (cornerData && cornerData.hasSettlement) {
                    settlementsOnThisTile++;
                    const resourceType = tile.resource;
                    console.log(`Found settlement at corner ${cornerKey}, collecting ${resourceType}`);
                    resourcesCollected.set(
                        resourceType,
                        (resourcesCollected.get(resourceType) || 0) + 1
                    );
                }
            });
            
            console.log(`Found ${settlementsOnThisTile} settlements on ${tile.resource} tile with number ${tile.number}`);
        });

        console.log('Final resources collected:', resourcesCollected);
        return resourcesCollected;
    }
} 