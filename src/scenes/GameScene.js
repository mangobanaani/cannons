export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.add.text(400, 300, 'Game Scene', { fontSize: '24px', fill: '#333' }).setOrigin(0.5);
    }
}
