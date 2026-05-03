import Terrain from '../objects/Terrain.js';
import Cannon from '../objects/Cannon.js';
import * as Config from '../config.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.terrain = new Terrain(this);

        const playerX = Math.floor(Config.GAME_WIDTH * Config.PLAYER_X_PERCENT);
        const aiX = Math.floor(Config.GAME_WIDTH * Config.AI_X_PERCENT);

        this.playerCannon = new Cannon(this, playerX, true, this.terrain);
        this.aiCannon = new Cannon(this, aiX, false, this.terrain);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.isPlayerTurn = true;
        this.canFire = true;
        this.projectile = null;

        // HUD
        this.turnText = this.add.text(Config.GAME_WIDTH / 2, 16, '', {
            fontSize: '18px', fill: '#333', fontFamily: 'monospace'
        }).setOrigin(0.5, 0);

        this.aimText = this.add.text(0, 0, '', {
            fontSize: '12px', fill: '#333', fontFamily: 'monospace'
        });

        this.updateHUD();
    }

    update() {
        this.playerCannon.update();
        this.aiCannon.update();

        if (this.isPlayerTurn && this.canFire && !this.projectile) {
            this.handleInput();
        }
    }

    handleInput() {
        if (this.cursors.up.isDown) {
            this.playerCannon.adjustAngle(Config.ANGLE_STEP);
        } else if (this.cursors.down.isDown) {
            this.playerCannon.adjustAngle(-Config.ANGLE_STEP);
        }

        if (this.cursors.right.isDown) {
            this.playerCannon.adjustPower(Config.POWER_STEP);
        } else if (this.cursors.left.isDown) {
            this.playerCannon.adjustPower(-Config.POWER_STEP);
        }

        this.updateHUD();
    }

    updateHUD() {
        this.turnText.setText(this.isPlayerTurn ? 'YOUR TURN' : 'ENEMY TURN');

        if (this.isPlayerTurn) {
            const deg = Math.round(this.playerCannon.angle * 180 / Math.PI);
            const pwr = Math.round(this.playerCannon.power * 10) / 10;
            this.aimText.setText(`Angle: ${deg}°  Power: ${pwr}`);
            this.aimText.setPosition(this.playerCannon.x - 40, this.playerCannon.y - 55);
            this.aimText.setVisible(true);
        } else {
            this.aimText.setVisible(false);
        }
    }
}
