import Terrain from '../objects/Terrain.js';
import Cannon from '../objects/Cannon.js';
import Projectile from '../objects/Projectile.js';
import ParticleEffects from '../objects/ParticleEffects.js';
import { calculateDamage } from '../utils/combat.js';
import { calculateAIShot } from '../utils/ai.js';
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

        this.particles = new ParticleEffects(this);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.isPlayerTurn = true;
        this.canFire = true;
        this.projectile = null;

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

        if (this.projectile && this.projectile.alive) {
            this.projectile.updateTrail();

            const pos = this.projectile.getPosition();
            const ix = Math.floor(pos.x);

            if (ix >= 0 && ix < Config.GAME_WIDTH && pos.y >= this.terrain.getHeightAt(ix)) {
                this.onProjectileImpact(pos.x, pos.y);
                return;
            }

            if (pos.x < -50 || pos.x > Config.GAME_WIDTH + 50 || pos.y > Config.GAME_HEIGHT + 50) {
                this.onProjectileMiss();
                return;
            }
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

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.fireProjectile(this.playerCannon);
        }

        this.updateHUD();
    }

    fireProjectile(cannon) {
        const tip = cannon.getBarrelTip();
        const dir = cannon.isPlayer ? 1 : -1;
        const vx = cannon.power * Math.cos(cannon.angle) * dir;
        const vy = -cannon.power * Math.sin(cannon.angle);

        this.projectile = new Projectile(this, tip.x, tip.y, vx, vy);
        this.canFire = false;
    }

    onProjectileImpact(x, y) {
        const ix = Phaser.Math.Clamp(Math.floor(x), 0, Config.GAME_WIDTH - 1);

        this.projectile.destroy();
        this.projectile = null;

        this.particles.explode(ix, y);
        this.cameras.main.shake(200, 0.008);

        this.terrain.carve(ix, Config.BLAST_RADIUS);

        const target = this.isPlayerTurn ? this.aiCannon : this.playerCannon;
        const damage = calculateDamage(
            ix, y, target.x, target.y,
            Config.BLAST_RADIUS, Config.MAX_DAMAGE
        );
        if (damage > 0) {
            target.takeDamage(damage);
            this.cameras.main.shake(300, 0.015);
        }

        this.playerCannon.updatePosition();
        this.aiCannon.updatePosition();

        if (target.targetHp <= 0) {
            this.particles.explode(target.x, target.y);
            this.canFire = false;
            this.time.delayedCall(1500, () => {
                this.scene.start('GameOverScene', { playerWon: this.isPlayerTurn });
            });
            return;
        }

        this.time.delayedCall(500, () => {
            this.switchTurn();
        });
    }

    onProjectileMiss() {
        this.projectile.destroy();
        this.projectile = null;

        this.time.delayedCall(500, () => {
            this.switchTurn();
        });
    }

    switchTurn() {
        this.isPlayerTurn = !this.isPlayerTurn;
        this.canFire = true;
        this.updateHUD();

        if (!this.isPlayerTurn) {
            this.canFire = false;
            this.time.delayedCall(800, () => {
                this.aiTurn();
            });
        }
    }

    aiTurn() {
        const shot = calculateAIShot(
            this.aiCannon.x, this.aiCannon.y,
            this.playerCannon.x, this.playerCannon.y,
            Config.GRAVITY, Config.MAX_POWER
        );

        this.aiCannon.angle = shot.angle;
        this.aiCannon.power = shot.power;
        this.aiCannon.draw();

        this.time.delayedCall(400, () => {
            this.fireProjectile(this.aiCannon);
        });
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
