import { generateHeightmap, carveCrater } from '../utils/terrain.js';
import * as Config from '../config.js';

export default class Terrain {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.heightmap = generateHeightmap(
            Config.GAME_WIDTH,
            Config.TERRAIN_MIN_Y,
            Config.TERRAIN_MAX_Y
        );
        this.render();
    }

    getHeightAt(x) {
        const ix = Math.max(0, Math.min(Math.floor(x), this.heightmap.length - 1));
        return this.heightmap[ix];
    }

    carve(centerX, radius) {
        carveCrater(this.heightmap, centerX, radius, Config.CRATER_DEPTH, Config.GAME_HEIGHT);
        this.render();
    }

    render() {
        this.graphics.clear();

        // Earth body
        this.graphics.fillStyle(0x8B6914);
        this.graphics.beginPath();
        this.graphics.moveTo(0, this.heightmap[0]);
        for (let x = 1; x < this.heightmap.length; x++) {
            this.graphics.lineTo(x, this.heightmap[x]);
        }
        this.graphics.lineTo(Config.GAME_WIDTH, Config.GAME_HEIGHT);
        this.graphics.lineTo(0, Config.GAME_HEIGHT);
        this.graphics.closePath();
        this.graphics.fillPath();

        // Grass surface
        this.graphics.lineStyle(4, 0x4a7c3f);
        this.graphics.beginPath();
        this.graphics.moveTo(0, this.heightmap[0]);
        for (let x = 1; x < this.heightmap.length; x++) {
            this.graphics.lineTo(x, this.heightmap[x]);
        }
        this.graphics.strokePath();
    }
}
