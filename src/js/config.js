import { Wood } from './models/resources/Wood.js';
import { Brick } from './models/resources/Brick.js';
import { Wheat } from './models/resources/Wheat.js';
import { Sheep } from './models/resources/Sheep.js';
import { Ore } from './models/resources/Ore.js';
import { Desert } from './models/resources/Desert.js';

// Hex dimensions
export const hexRadius = 1;
export const hexHeight = 0.2;
export const gridRadius = 2; // Standard Catan has 19 tiles (2 rings)

// Derived measurements
export const hexWidth = Math.sqrt(3) * hexRadius;
export const hexVerticalDist = 1.5 * hexRadius;

// Resource colors
export const resourceColors = {
    DESERT: 0xC19A6B,  // Sandy brown
    WOOD: 0x2F6C45,    // Darker forest green
    BRICK: 0xC45C45,   // Darker terracotta
    WHEAT: 0xD4AF37,   // Darker wheat gold
    SHEEP: 0x90B77D,   // Darker meadow green
    ORE: 0x71797E      // Darker stone gray
};

// Resource definitions
export const resourceTypes = {
    DESERT: {
        color: resourceColors.DESERT,
        count: 1,
        createPlaceholder: () => Desert.createPlaceholder(),
        getColor: () => resourceColors.DESERT
    },
    WOOD: {
        color: resourceColors.WOOD,
        count: 4,
        createPlaceholder: () => Wood.createPlaceholder(),
        getColor: () => resourceColors.WOOD
    },
    BRICK: {
        color: resourceColors.BRICK,
        count: 3,
        createPlaceholder: () => Brick.createPlaceholder(),
        getColor: () => resourceColors.BRICK
    },
    WHEAT: {
        color: resourceColors.WHEAT,
        count: 4,
        createPlaceholder: () => Wheat.createPlaceholder(),
        getColor: () => resourceColors.WHEAT
    },
    SHEEP: {
        color: resourceColors.SHEEP,
        count: 4,
        createPlaceholder: () => Sheep.createPlaceholder(),
        getColor: () => resourceColors.SHEEP
    },
    ORE: {
        color: resourceColors.ORE,
        count: 3,
        createPlaceholder: () => Ore.createPlaceholder(),
        getColor: () => resourceColors.ORE
    }
};

// Standard Catan resource distribution
export const standardResourceCounts = {
    DESERT: 1,
    WOOD: 4,
    BRICK: 3,
    WHEAT: 4,
    SHEEP: 4,
    ORE: 3
};

// --- Number Token Values ---
export const numberTokenValues = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]; // Standard 18 tokens 