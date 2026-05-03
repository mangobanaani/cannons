import Terrain from '../objects/Terrain.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.terrain = new Terrain(this);
    }
}
