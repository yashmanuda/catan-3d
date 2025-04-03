import * as THREE from 'three';
import { Wood } from './resources/Wood.js';
import { Brick } from './resources/Brick.js';
import { Wheat } from './resources/Wheat.js';
import { Sheep } from './resources/Sheep.js';
import { Ore } from './resources/Ore.js';
import { resourceColors } from '../config.js';

export class ResourceSection {
    constructor() {
        // Add Google Font
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Create main container
        this.element = document.createElement('div');
        this.element.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 1000;
        `;

        // Create resource container
        this.resourceContainer = document.createElement('div');
        this.resourceContainer.style.cssText = `
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(8px);
            padding: 15px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
            color: white;
            font-family: 'Poppins', sans-serif;
        `;

        // Initialize resource counts
        this.resources = {
            wood: 0,
            brick: 0,
            ore: 0,
            grain: 0,
            wool: 0
        };

        // Setup Three.js scene for static resource graphics
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.set(0, 2, 2.5);
        this.camera.lookAt(0, 0, 0);

        // Create resource models
        this.resourceModels = [
            { type: 'wood', model: Wood.createPlaceholder(), label: 'Wood', color: resourceColors.WOOD },
            { type: 'brick', model: Brick.createPlaceholder(), label: 'Brick', color: resourceColors.BRICK },
            { type: 'ore', model: Ore.createPlaceholder(), label: 'Ore', color: resourceColors.ORE },
            { type: 'grain', model: Wheat.createPlaceholder(), label: 'Grain', color: resourceColors.WHEAT },
            { type: 'wool', model: Sheep.createPlaceholder(), label: 'Wool', color: resourceColors.SHEEP }
        ];

        // Create resource rows
        this.resourceModels.forEach((resource, index) => {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                align-items: center;
                gap: 20px;
                padding: 12px 20px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                cursor: pointer;
                transition: all 0.3s ease;
                height: 80px;
                position: relative;
                overflow: hidden;
            `;

            // Add hover effect
            row.addEventListener('mouseenter', () => {
                row.style.background = 'rgba(255, 255, 255, 0.2)';
            });

            row.addEventListener('mouseleave', () => {
                row.style.background = 'rgba(255, 255, 255, 0.1)';
            });

            // Create label (left)
            const label = document.createElement('div');
            label.style.cssText = `
                color: white;
                font-family: 'Poppins', sans-serif;
                font-size: 22px;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                width: 80px;
                flex-shrink: 0;
            `;
            label.textContent = resource.label;

            // Create middle section for graphic
            const middleSection = document.createElement('div');
            middleSection.style.cssText = `
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            `;

            // Create graphic container
            const graphicContainer = document.createElement('div');
            graphicContainer.style.cssText = `
                width: 90px;
                height: 90px;
                position: relative;
            `;

            middleSection.appendChild(graphicContainer);

            // Create renderer for this resource
            const renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });
            renderer.setSize(90, 90);
            renderer.setClearColor(0x000000, 0);
            renderer.setPixelRatio(window.devicePixelRatio);

            // Create count (right) with enhanced styling
            const count = document.createElement('div');
            count.style.cssText = `
                color: white;
                font-family: 'Poppins', sans-serif;
                font-size: 26px;
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                width: 50px;
                flex-shrink: 0;
                text-align: right;
                padding-right: 10px;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
            `;
            count.textContent = '0';

            // Position model
            resource.model.position.set(0, 0, 0);
            resource.model.rotation.x = -Math.PI / 6;
            resource.model.rotation.y = Math.PI / 4;

            // Scale model to fit container
            let scale;
            switch(resource.type) {
                case 'wood':
                    scale = 1.0;
                    resource.model.position.y = -0.3;
                    break;
                case 'grain':
                    scale = 1.0;
                    resource.model.position.y = -0.3;
                    resource.model.scale.y = 0.7; // Reduce height of grain specifically
                    break;
                case 'wool':
                    scale = 1.2;
                    resource.model.position.y = -0.2;
                    break;
                case 'ore':
                    scale = 1.2;
                    resource.model.position.y = -0.2;
                    break;
                case 'brick':
                    scale = 1.1;
                    resource.model.position.y = -0.2;
                    break;
            }
            if (resource.type !== 'grain') { // Don't override grain's custom scale
                resource.model.scale.set(scale, scale, scale);
            } else {
                resource.model.scale.set(scale, scale * 0.7, scale); // Apply scaled height to grain
            }

            // Add enhanced lighting for this renderer
            const scene = new THREE.Scene();
            
            // Ambient light for base brightness
            scene.add(new THREE.AmbientLight(0xffffff, 1.0));
            
            // Main directional light from top-front
            const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
            mainLight.position.set(1, 2, 1);
            scene.add(mainLight);
            
            // Fill light from opposite side
            const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
            fillLight.position.set(-1, 1, -1);
            scene.add(fillLight);
            
            // Top light for better definition
            const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
            topLight.position.set(0, 2, 0);
            scene.add(topLight);

            scene.add(resource.model);

            // Render once
            renderer.render(scene, this.camera);
            graphicContainer.appendChild(renderer.domElement);

            // Assemble row
            row.appendChild(label);
            row.appendChild(middleSection);
            row.appendChild(count);
            this.resourceContainer.appendChild(row);

            resource.countElement = count;
            resource.row = row;
        });

        // Add container to main element
        this.element.appendChild(this.resourceContainer);
    }

    updateResource(resourceType, amount) {
        const resource = this.resourceModels.find(r => r.type === resourceType.toLowerCase());
        if (resource && resource.countElement) {
            const oldValue = this.resources[resourceType.toLowerCase()];
            this.resources[resourceType.toLowerCase()] += amount;
            const newValue = this.resources[resourceType.toLowerCase()];
            
            // Create and animate the floating number
            const floatingNumber = document.createElement('div');
            floatingNumber.style.cssText = `
                position: absolute;
                right: 70px;
                color: #4CAF50;
                font-size: 24px;
                font-weight: bold;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                pointer-events: none;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            floatingNumber.textContent = `+${amount}`;
            resource.row.appendChild(floatingNumber);

            // Trigger animations
            requestAnimationFrame(() => {
                // Animate floating number
                floatingNumber.style.opacity = '1';
                floatingNumber.style.transform = 'translateY(-20px)';
                
                // Animate the row background
                resource.row.style.background = 'rgba(76, 175, 80, 0.3)';
                
                // Animate the count
                resource.countElement.style.transform = 'scale(1.3)';
                resource.countElement.style.color = '#4CAF50';
                resource.countElement.textContent = newValue;

                // Reset animations
                setTimeout(() => {
                    floatingNumber.style.opacity = '0';
                    floatingNumber.style.transform = 'translateY(-40px)';
                    resource.row.style.background = 'rgba(255, 255, 255, 0.1)';
                    resource.countElement.style.transform = 'scale(1)';
                    resource.countElement.style.color = 'white';
                    
                    // Remove floating number after animation
                    setTimeout(() => {
                        floatingNumber.remove();
                    }, 500);
                }, 1000);
            });
        }
    }

    getResourceCount(resourceType) {
        return this.resources[resourceType.toLowerCase()] || 0;
    }
} 