import * as THREE from 'three';
import { Board } from './models/Board.js';
import { RotationControls } from './utils/RotationControls.js';
import { MenuBar } from './utils/MenuBar.js';
import { House } from './models/House.js';
import { Road } from './models/Road.js';
import { ResourceSection } from './models/ResourceSection.js';
import { DiceBox } from './models/DiceBox.js';

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

// Create dice box
const diceBox = new DiceBox();

// Sound effects
const houseSound = new Audio('/src/assets/hammer_sound.wav');
houseSound.volume = 0.4;

const roadSound = new Audio('/src/assets/hammer_sound.wav');
roadSound.volume = 0.4;

const diceSound = new Audio('/src/assets/dice_roll.wav');
diceSound.volume = 0.4;

// Game state
let isPlacingSettlement = false;
let isPlacingRoad = false;
let highlightedCorners = [];
let highlightedEdges = [];
let isAnimationInProgress = false;

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

// Create menu bar
const menuBar = document.createElement('div');
menuBar.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    z-index: 1000;
`;

const buttonStyle = `
    padding: 10px 15px;
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    background: #4CAF50;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    min-width: 40px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const buttonHoverStyle = `
    background: #45a049;
`;

const buttonActiveStyle = `
    background: #2E7D32;
`;

const createButton = (text, onClick) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = buttonStyle;
    
    button.addEventListener('mouseover', () => {
        if (!button.disabled) {
            button.style.background = '#45a049';
        }
    });
    
    button.addEventListener('mouseout', () => {
        if (!button.disabled) {
            button.style.background = '#4CAF50';
        }
    });
    
    button.addEventListener('click', onClick);
    return button;
};

// Create rotation buttons with correct symbols
const rotateCCWButton = createButton('⟲', () => {});
rotateCCWButton.style.fontSize = '20px';

const rotateCWButton = createButton('⟳', () => {});
rotateCWButton.style.fontSize = '20px';

// Long press handlers for rotation
let longPressTimer;
const longPressDelay = 150; // ms before rotation starts

rotateCWButton.addEventListener('mousedown', () => {
    longPressTimer = setTimeout(() => {
        rotationControls.startRotation(-1); // Counter-clockwise rotation for CW button
        disableAllButtonsExcept(rotateCWButton);
    }, longPressDelay);
});

rotateCCWButton.addEventListener('mousedown', () => {
    longPressTimer = setTimeout(() => {
        rotationControls.startRotation(1); // Clockwise rotation for CCW button
        disableAllButtonsExcept(rotateCCWButton);
    }, longPressDelay);
});

// Clear timer and stop rotation on mouse up
rotateCWButton.addEventListener('mouseup', () => {
    clearTimeout(longPressTimer);
    rotationControls.stopRotation();
    enableAllButtons();
});

rotateCCWButton.addEventListener('mouseup', () => {
    clearTimeout(longPressTimer);
    rotationControls.stopRotation();
    enableAllButtons();
});

// Handle mouse leave
rotateCWButton.addEventListener('mouseleave', () => {
    clearTimeout(longPressTimer);
    rotationControls.stopRotation();
    enableAllButtons();
});

rotateCCWButton.addEventListener('mouseleave', () => {
    clearTimeout(longPressTimer);
    rotationControls.stopRotation();
    enableAllButtons();
});

// Touch events for mobile
rotateCWButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    longPressTimer = setTimeout(() => {
        rotationControls.startRotation(-1);
        disableAllButtonsExcept(rotateCWButton);
    }, longPressDelay);
});

rotateCCWButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    longPressTimer = setTimeout(() => {
        rotationControls.startRotation(1);
        disableAllButtonsExcept(rotateCCWButton);
    }, longPressDelay);
});

rotateCWButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    clearTimeout(longPressTimer);
    rotationControls.stopRotation();
    enableAllButtons();
});

rotateCCWButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    clearTimeout(longPressTimer);
    rotationControls.stopRotation();
    enableAllButtons();
});

// Create other buttons
const placeSettlementButton = createButton('Place Settlement', () => {
    if (board.mode === 'settlement') {
        enableAllButtons();
        board.hideCorners();
        board.setMode(null);
    } else {
        disableAllButtonsExcept(placeSettlementButton);
        board.setMode('settlement');
        board.highlightAvailableCorners();
    }
});

const placeRoadButton = createButton('Place Road', () => {
    if (board.mode === 'road') {
        enableAllButtons();
        board.hideEdges();
        board.setMode(null);
    } else {
        disableAllButtonsExcept(placeRoadButton);
        board.setMode('road');
        board.highlightAvailableEdges();
    }
});

const rollDiceButton = createButton('Roll Dice', () => {
    if (diceBox.isRolling) return;
    
    diceBox.rollDice().then(result => {
        console.log('Dice roll:', result);
        
        // Skip resource collection for 7
        if (result === 7) {
            console.log('Rolled 7 - skipping resource collection');
            return;
        }
        
        // Collect resources based on dice roll
        const resourcesCollected = board.collectResources(result);
        console.log('Resources collected:', resourcesCollected);
        
        // Update resource counts in the UI
        resourcesCollected.forEach((count, resourceType) => {
            console.log(`Adding ${count} ${resourceType}`);
            resourceSection.updateResource(resourceType, count);
        });
    }).catch(error => {
        console.error('Error during dice roll:', error);
    });
});

function disableAllButtonsExcept(activeButton) {
    [rotateCWButton, rotateCCWButton, placeSettlementButton, placeRoadButton, rollDiceButton].forEach(button => {
        if (button !== activeButton) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.style.background = '#808080';
        } else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.style.background = '#2E7D32';
        }
    });
}

function enableAllButtons() {
    [rotateCWButton, rotateCCWButton, placeSettlementButton, placeRoadButton, rollDiceButton].forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.style.cssText = buttonStyle;
    });
    board.setMode(null);
}

// Update the click handler for settlements and roads
renderer.domElement.addEventListener('click', (event) => {
    if (isAnimationInProgress) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    if (board.mode === 'road') {
        const intersects = raycaster.intersectObjects(scene.children, true);
        for (const intersect of intersects) {
            if (intersect.object.userData.isEdge) {
                const edgeKey = intersect.object.userData.edgeKey;
                if (board.isValidRoadLocation(edgeKey)) {
                    isAnimationInProgress = true;

                    // Get edge data
                    const edge = board.edges.get(edgeKey);
                    const startCorner = board.corners.get(edge.start);
                    const endCorner = board.corners.get(edge.end);

                    // Create road
                    const road = new Road();
                    
                    // Calculate direction and length
                    const direction = new THREE.Vector3()
                        .subVectors(endCorner.position, startCorner.position);
                    const length = direction.length();
                    
                    // Set road length
                    road.setLength(length);
                    
                    // Position at midpoint
                    const midpoint = new THREE.Vector3()
                        .addVectors(startCorner.position, endCorner.position)
                        .multiplyScalar(0.5);
                    road.group.position.copy(midpoint);
                    road.group.position.y = 2; // Start position for animation
                    
                    // Calculate rotation
                    const angle = Math.atan2(direction.x, direction.z);
                    road.group.rotation.y = angle;
                    
                    // Add to scene
                    scene.add(road.group);
                    
                    // Play sound
                    roadSound.currentTime = 0;
                    roadSound.play().catch(e => console.warn('Audio play failed:', e));
                    
                    // Animate placement
                    const startY = road.group.position.y;
                    const endY = 0.15;
                    const duration = 500;
                    const startTime = Date.now();
                    
                    function dropAnimation() {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Bounce easing
                        const bounce = Math.sin(progress * Math.PI) * Math.exp(-progress * 3);
                        road.group.position.y = endY + (startY - endY) * bounce;
                        
                        if (progress < 1) {
                            requestAnimationFrame(dropAnimation);
                        } else {
                            road.group.position.y = endY;
                            board.markRoad(edgeKey);
                            board.hideEdges();
                            board.highlightAvailableEdges();
                            isAnimationInProgress = false;
                        }
                    }
                    
                    dropAnimation();
                    return;
                }
            }
        }
    } else if (board.mode === 'settlement') {
        const intersects = raycaster.intersectObjects(scene.children, true);
        for (const intersect of intersects) {
            if (intersect.object.userData.isCorner) {
                const cornerKey = board.getCornerKey(intersect.object.position);
                if (board.isValidSettlementLocation(intersect.object)) {
                    isAnimationInProgress = true;

                    // Create settlement
                    const house = new House();
                    house.group.position.copy(intersect.object.position);
                    house.group.position.y = 2; // Start position for animation
                    scene.add(house.group);

                    // Play sound
                    houseSound.currentTime = 0;
                    houseSound.play().catch(e => console.warn('Audio play failed:', e));

                    // Animate placement
                    const startY = house.group.position.y;
                    const endY = 0.15;
                    const duration = 500;
                    const startTime = Date.now();

                    function dropAnimation() {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Bounce easing
                        const bounce = Math.sin(progress * Math.PI) * Math.exp(-progress * 3);
                        house.group.position.y = endY + (startY - endY) * bounce;

                        if (progress < 1) {
                            requestAnimationFrame(dropAnimation);
                        } else {
                            house.group.position.y = endY;
                            board.markSettlement(cornerKey);
                            board.hideCorners();
                            enableAllButtons();
                            board.setMode(null);
                            isAnimationInProgress = false;
                        }
                    }

                    dropAnimation();
                    return;
                }
            }
        }
    }
});

// Add buttons to menu bar
menuBar.appendChild(rotateCCWButton);
menuBar.appendChild(rotateCWButton);
menuBar.appendChild(placeSettlementButton);
menuBar.appendChild(placeRoadButton);
menuBar.appendChild(rollDiceButton);
document.body.appendChild(menuBar);

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