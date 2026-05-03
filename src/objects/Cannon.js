import * as Config from '../config.js';

export default class Cannon {
    constructor(scene, x, isPlayer, terrain) {
        this.scene = scene;
        this.x = x;
        this.isPlayer = isPlayer;
        this.terrain = terrain;

        this.y = terrain.getHeightAt(x);
        this.angle = Config.DEFAULT_ANGLE;
        this.power = Config.DEFAULT_POWER;
        this.hp = Config.CANNON_HP;
        this.targetHp = Config.CANNON_HP;

        this.graphics = scene.add.graphics();
        this.draw();
    }

    adjustAngle(delta) {
        this.angle = Phaser.Math.Clamp(
            this.angle + delta,
            Config.MIN_ANGLE,
            Config.MAX_ANGLE
        );
        this.draw();
    }

    adjustPower(delta) {
        this.power = Phaser.Math.Clamp(
            this.power + delta,
            Config.MIN_POWER,
            Config.MAX_POWER
        );
    }

    getBarrelTip() {
        const dir = this.isPlayer ? 1 : -1;
        return {
            x: this.x + dir * Math.cos(this.angle) * Config.BARREL_LENGTH,
            y: this.y - Math.sin(this.angle) * Config.BARREL_LENGTH
        };
    }

    takeDamage(amount) {
        this.targetHp = Math.max(0, this.targetHp - amount);
    }

    updatePosition() {
        this.y = this.terrain.getHeightAt(this.x);
        this.draw();
    }

    draw() {
        this.graphics.clear();

        // Barrel
        const tip = this.getBarrelTip();
        this.graphics.lineStyle(6, 0x333333);
        this.graphics.lineBetween(this.x, this.y, tip.x, tip.y);

        // Base
        const color = this.isPlayer ? 0x3366cc : 0xcc3333;
        this.graphics.fillStyle(color);
        this.graphics.fillRect(this.x - 15, this.y - 10, 30, 12);

        // Wheel
        this.graphics.fillStyle(0x333333);
        this.graphics.fillCircle(this.x - 8, this.y, 6);
        this.graphics.fillCircle(this.x + 8, this.y, 6);

        // HP bar
        this.drawHPBar();
    }

    drawHPBar() {
        const barWidth = 40;
        const barHeight = 6;
        const barX = this.x - barWidth / 2;
        const barY = this.y - 35;

        // Lerp displayed HP toward target
        this.hp += (this.targetHp - this.hp) * 0.1;
        if (Math.abs(this.hp - this.targetHp) < 0.5) this.hp = this.targetHp;

        const pct = this.hp / Config.CANNON_HP;
        const color = pct > 0.5 ? 0x00cc00 : pct > 0.25 ? 0xcccc00 : 0xcc0000;

        this.graphics.fillStyle(0x333333);
        this.graphics.fillRect(barX, barY, barWidth, barHeight);
        this.graphics.fillStyle(color);
        this.graphics.fillRect(barX, barY, barWidth * pct, barHeight);
    }

    update() {
        if (Math.abs(this.hp - this.targetHp) > 0.5) {
            this.draw();
        }
    }
}
