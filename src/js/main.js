import * as THREE from 'three';
import { Board } from './models/Board.js';
import { RotationControls } from './utils/RotationControls.js';
import { MenuBar } from './utils/MenuBar.js';
import { House } from './models/House.js';
import { Road } from './models/Road.js';
import { ResourceSection } from './models/ResourceSection.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Light ocean blue
scene.fog = new THREE.Fog(0x87CEEB, 30, 50);

// Camera setup
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 10.2, 13.6);
camera.lookAt(0, -1, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance",
    precision: "highp"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
const gameContainer = document.getElementById('game-container');
gameContainer.appendChild(renderer.domElement);

// Prevent default touch behaviors
gameContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

gameContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent double-tap zoom
let lastTouchEnd = 0;
gameContainer.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Increased ambient light
scene.add(ambientLight);

// Main directional light from above
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increased intensity
directionalLight.position.set(0, 10, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

// Add fill light for better visibility
const fillLight = new THREE.DirectionalLight(0xffffff, 0.6); // Increased fill light
fillLight.position.set(0, 8, 0);
scene.add(fillLight);

// Controls setup
const rotationControls = new RotationControls(camera);

// Water plane
const waterGeometry = new THREE.PlaneGeometry(100, 100);
const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x4AA7DE,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.8
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.y = -0.2;
water.receiveShadow = true;
scene.add(water);

// Create and add board
const board = new Board();
scene.add(board.group);

// Sound effects
const houseSound = new Audio('/src/assets/hammer_sound.wav');
houseSound.volume = 0.4;

const roadSound = new Audio('/src/assets/hammer_sound.wav');
roadSound.volume = 0.4;

// Game state
let isPlacingSettlement = false;
let isPlacingRoad = false;
let highlightedCorners = [];
let highlightedEdges = [];

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// Handle mouse movement
window.addEventListener('mousemove', (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Menu bar setup
const menuBar = new MenuBar(
    () => {
        rotationControls.startRotation();
    },
    () => {
        rotationControls.stopRotation();
    },
    () => {
        isPlacingSettlement = true;
        isPlacingRoad = false;
        board.hideEdges(); // Hide any existing edge highlights
        board.highlightAvailableCorners(highlightedCorners);
    },
    () => {
        isPlacingSettlement = false;
        isPlacingRoad = true;
        board.hideCorners(); // Hide any existing corner highlights
        board.highlightAvailableEdges(highlightedEdges);
    }
);

// Handle mouse click
window.addEventListener('click', () => {
    if (!isPlacingSettlement && !isPlacingRoad) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    for (const intersect of intersects) {
        if (isPlacingSettlement && intersect.object.userData.isCorner) {
            const cornerKey = board.getCornerKey(intersect.object.position);
            const cornerData = board.corners.get(cornerKey);
            
            if (!cornerData || cornerData.hasSettlement) continue;
            
            // Place settlement with animation
            const house = new House();
            house.group.position.copy(intersect.point);
            house.group.position.y += 2; // Start from above
            scene.add(house.group);
            
            // Play hammer sound effect
            houseSound.currentTime = 0;
            houseSound.play();
            
            // Animate house falling
            const duration = 400;
            const startY = house.group.position.y;
            const endY = 0.2;
            const startTime = Date.now();
            
            const animateHouse = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easeOutBounce = (x) => {
                    const n1 = 7.5625;
                    const d1 = 2.75;
                    if (x < 1 / d1) {
                        return n1 * x * x;
                    } else if (x < 2 / d1) {
                        return n1 * (x -= 1.5 / d1) * x + 0.75;
                    } else if (x < 2.5 / d1) {
                        return n1 * (x -= 2.25 / d1) * x + 0.9375;
                    } else {
                        return n1 * (x -= 2.625 / d1) * x + 0.984375;
                    }
                };
                
                house.group.position.y = startY - (startY - endY) * easeOutBounce(progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateHouse);
                } else {
                    // After settlement is placed, mark it and show available road locations
                    board.markSettlement(cornerKey);
                    isPlacingSettlement = false;
                    board.hideCorners();
                    highlightedCorners = [];
                    
                    // Automatically switch to road placement mode
                    isPlacingRoad = true;
                    board.highlightAvailableEdges(highlightedEdges);
                }
            };
            
            animateHouse();
            break;
        } else if (isPlacingRoad) {
            // Check if we clicked on a glow mesh or its parent group
            let edgeData = null;
            if (intersect.object.userData.isEdge) {
                edgeData = intersect.object.userData;
            } else if (intersect.object.parent && intersect.object.parent.userData.isEdge) {
                edgeData = intersect.object.parent.userData;
            }
            
            if (!edgeData) continue;
            
            const edgeKey = edgeData.edgeKey;
            if (!board.isValidRoadLocation(edgeKey)) continue;
            
            // Get corner positions for exact placement
            const startCorner = board.corners.get(edgeData.start);
            const endCorner = board.corners.get(edgeData.end);
            
            if (!startCorner || !endCorner) continue;
            
            // Calculate exact position and rotation
            const direction = new THREE.Vector3()
                .subVectors(endCorner.position, startCorner.position);
            const length = direction.length();
            direction.normalize();
            
            // Calculate the midpoint between corners for road placement
            const midpoint = new THREE.Vector3()
                .addVectors(startCorner.position, endCorner.position)
                .multiplyScalar(0.5);
            
            // Create and position road
            const road = new Road();
            road.setLength(length);
            
            // Position at midpoint and align with edge
            road.group.position.copy(midpoint);
            road.group.position.y = 0.25; // Position above the hexagon edge
            
            // Calculate rotation to align with edge exactly
            const angle = Math.atan2(direction.x, direction.z);
            road.group.rotation.y = angle; // Remove the PI/2 rotation
            
            scene.add(road.group);
            
            // Play hammer sound effect
            roadSound.currentTime = 0;
            roadSound.play();
            
            // Animate road falling
            const duration = 300;
            const startY = 1.0; // Start higher
            const endY = 0.25; // End at the correct height above the hexagon edge
            const startTime = Date.now();
            
            road.group.position.y = startY; // Start position
            
            const animateRoad = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easeOutBounce = (x) => {
                    const n1 = 7.5625;
                    const d1 = 2.75;
                    if (x < 1 / d1) {
                        return n1 * x * x;
                    } else if (x < 2 / d1) {
                        return n1 * (x -= 1.5 / d1) * x + 0.75;
                    } else if (x < 2.5 / d1) {
                        return n1 * (x -= 2.25 / d1) * x + 0.9375;
                    } else {
                        return n1 * (x -= 2.625 / d1) * x + 0.984375;
                    }
                };
                
                road.group.position.y = startY - (startY - endY) * easeOutBounce(progress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateRoad);
                } else {
                    // After road is placed, mark it and update available edges
                    board.markRoad(edgeKey);
                    board.hideEdges();
                    board.highlightAvailableEdges(highlightedEdges);
                }
            };
            
            animateRoad();
            break;
        }
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update rotation controls
    rotationControls.update();
    
    // Update flag rotations
    board.updateFlagRotations(camera.position);
    
    // Update edge indicators
    board.updateEdgeIndicators();
    
    renderer.render(scene, camera);
}

animate(); 

function createRoad(edgeKey, edgeData) {
    const road = new Road();
    
    // Get the exact corner positions
    const startCorner = board.corners.get(edgeData.start);
    const endCorner = board.corners.get(edgeData.end);
    
    // Calculate exact edge center and direction
    const startPos = startCorner.position;
    const endPos = endCorner.position;
    
    // Position at the start corner
    road.group.position.copy(startPos);
    
    // Calculate direction and rotation
    const direction = new THREE.Vector3().subVectors(endPos, startPos);
    const length = direction.length();
    const angle = Math.atan2(direction.z, direction.x);
    
    // Set length and rotation
    road.setLength(length);
    road.group.rotation.y = angle;
    
    // Ensure consistent height
    road.group.position.y = 0.15;
    
    return road;
}

function animateRoad(edgeKey, edgeData) {
    const road = createRoad(edgeKey, edgeData);
    
    // Start position higher above final position
    const startY = road.group.position.y + 2;
    road.group.position.y = startY;
    
    // Add to scene
    scene.add(road.group);
    
    // Play sound
    const roadSound = new Audio('/src/assets/hammer_sound.wav');
    roadSound.volume = 0.4;
    roadSound.play().catch(e => console.warn('Audio play failed:', e));
    
    // Animate the road dropping into place
    const targetY = 0.15; // Consistent height
    const duration = 500;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Bounce easing
        const bounce = Math.sin(progress * Math.PI) * Math.exp(-progress * 3);
        road.group.position.y = targetY + (startY - targetY) * bounce;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Final position
            road.group.position.y = targetY;
            // Mark the edge as having a road and update available edges
            board.markRoad(edgeKey);
            if (isPlacingRoad) {
                board.hideEdges();
                board.highlightAvailableEdges();
            }
        }
    }
    
    animate();
}

// Add a cleanup function when exiting road placement mode
function exitRoadPlacementMode() {
    isPlacingRoad = false;
    board.hideEdges(); // Hide all edge indicators
}

// Update the click handler to handle cancellation
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (isPlacingRoad) {
            exitRoadPlacementMode();
        }
        if (isPlacingSettlement) {
            isPlacingSettlement = false;
            board.hideCorners();
        }
    }
});

// Initialize resource section
const resourceSection = new ResourceSection();
document.body.appendChild(resourceSection.element);