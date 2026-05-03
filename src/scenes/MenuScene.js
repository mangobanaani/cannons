import * as Config from '../config.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#87CEEB');

        this.add.text(Config.GAME_WIDTH / 2, 180, 'CANNONS', {
            fontSize: '64px',
            fill: '#333',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(Config.GAME_WIDTH / 2, 260, 'Destroy the enemy cannon!', {
            fontSize: '18px',
            fill: '#555',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const startBtn = this.add.text(Config.GAME_WIDTH / 2, 380, '[ START GAME ]', {
            fontSize: '24px',
            fill: '#333',
            fontFamily: 'monospace',
            backgroundColor: '#fff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => startBtn.setStyle({ fill: '#3366cc' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ fill: '#333' }));
        startBtn.on('pointerdown', () => this.scene.start('GameScene'));

        this.add.text(Config.GAME_WIDTH / 2, 480, 'Controls:\nUP/DOWN - Adjust angle\nLEFT/RIGHT - Adjust power\nSPACE - Fire', {
            fontSize: '14px',
            fill: '#666',
            fontFamily: 'monospace',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);
    }
}
