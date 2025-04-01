import * as THREE from 'three';

// Token styling constants
const TOKEN_RADIUS = 0.25;
const TOKEN_HEIGHT = 0.05;
const TOKEN_Y_OFFSET = 0.3; // Increased height for better visibility
const DOT_SIZE = 0.03;

// Probability dots arrangement
const DOT_ARRANGEMENTS = {
    2: [[0, 0]],
    3: [[0.06, 0], [-0.06, 0]],
    4: [[0.06, 0.06], [-0.06, 0.06], [0.06, -0.06], [-0.06, -0.06]],
    5: [[0.06, 0.06], [-0.06, 0.06], [0, 0], [0.06, -0.06], [-0.06, -0.06]],
    6: [[0.06, 0.08], [-0.06, 0.08], [0.06, 0], [-0.06, 0], [0.06, -0.08], [-0.06, -0.08]]
};

// Create the base token mesh
function createTokenBase() {
    const geometry = new THREE.CylinderGeometry(TOKEN_RADIUS, TOKEN_RADIUS, TOKEN_HEIGHT, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xF5DEB3,  // Wheat color
        roughness: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2; // Lay flat
    mesh.position.y = TOKEN_Y_OFFSET;
    return mesh;
}

// Create number text texture
function createNumberTexture(number) {
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(0, 0, size, size);
    
    // Text styling
    const fontSize = Math.floor(size * 0.5);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Color based on probability (6 and 8 in red)
    ctx.fillStyle = (number === 6 || number === 8) ? '#FF0000' : '#000000';
    ctx.fillText(number.toString(), size/2, size/2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Create probability dots
function createProbabilityDots(number) {
    const group = new THREE.Group();
    const dotCount = Math.abs(7 - number);
    if (dotCount <= 0 || !DOT_ARRANGEMENTS[dotCount]) return group;
    
    const dotGeometry = new THREE.CircleGeometry(DOT_SIZE, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    DOT_ARRANGEMENTS[dotCount].forEach(([x, y]) => {
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(x, y, TOKEN_HEIGHT/2 + 0.001);
        dot.rotation.x = -Math.PI / 2;
        group.add(dot);
    });
    
    return group;
}

// Main function to create a complete number token
export function createNumberToken(number) {
    const group = new THREE.Group();
    
    // Create base token
    const tokenBase = createTokenBase();
    group.add(tokenBase);
    
    // Add number texture to both sides
    const texture = createNumberTexture(number);
    const numberGeometry = new THREE.CircleGeometry(TOKEN_RADIUS * 0.8, 32);
    const numberMaterial = new THREE.MeshBasicMaterial({ map: texture });
    
    // Front face
    const frontNumber = new THREE.Mesh(numberGeometry, numberMaterial);
    frontNumber.position.set(0, TOKEN_Y_OFFSET, TOKEN_HEIGHT/2 + 0.001);
    frontNumber.rotation.x = -Math.PI / 2;
    group.add(frontNumber);
    
    // Back face
    const backNumber = frontNumber.clone();
    backNumber.rotation.x = Math.PI / 2;
    backNumber.position.z = -TOKEN_HEIGHT/2 - 0.001;
    group.add(backNumber);
    
    // Add probability dots
    const dots = createProbabilityDots(number);
    dots.position.y = TOKEN_Y_OFFSET;
    group.add(dots);
    
    group.castShadow = true;
    return group;
}

// Position helper for tokens
export function getTokenPosition() {
    return { y: TOKEN_Y_OFFSET };
} 