import * as Config from '../config.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.playerWon = data.playerWon;
    }

    create() {
        this.cameras.main.setBackgroundColor(this.playerWon ? '#d4edda' : '#f8d7da');

        const title = this.playerWon ? 'VICTORY' : 'DEFEAT';
        const color = this.playerWon ? '#155724' : '#721c24';
        const subtitle = this.playerWon
            ? 'You destroyed the enemy cannon!'
            : 'Your cannon was destroyed!';

        this.add.text(Config.GAME_WIDTH / 2, 200, title, {
            fontSize: '64px',
            fill: color,
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(Config.GAME_WIDTH / 2, 280, subtitle, {
            fontSize: '18px',
            fill: color,
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        const replayBtn = this.add.text(Config.GAME_WIDTH / 2, 380, '[ PLAY AGAIN ]', {
            fontSize: '24px',
            fill: '#333',
            fontFamily: 'monospace',
            backgroundColor: '#fff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        replayBtn.on('pointerover', () => replayBtn.setStyle({ fill: '#3366cc' }));
        replayBtn.on('pointerout', () => replayBtn.setStyle({ fill: '#333' }));
        replayBtn.on('pointerdown', () => this.scene.start('GameScene'));

        const menuBtn = this.add.text(Config.GAME_WIDTH / 2, 440, '[ MAIN MENU ]', {
            fontSize: '18px',
            fill: '#666',
            fontFamily: 'monospace',
            padding: { x: 15, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerover', () => menuBtn.setStyle({ fill: '#3366cc' }));
        menuBtn.on('pointerout', () => menuBtn.setStyle({ fill: '#666' }));
        menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}
