import * as Config from '../config.js';

const MatterBody = Phaser.Physics.Matter.Matter.Body;

export default class Projectile {
    constructor(scene, x, y, vx, vy) {
        this.scene = scene;
        this.trail = [];
        this.alive = true;

        this.body = scene.matter.add.circle(x, y, Config.PROJECTILE_RADIUS, {
            frictionAir: 0,
            friction: 0,
            restitution: 0,
            collisionFilter: { group: -1 },
            label: 'projectile'
        });

        MatterBody.setVelocity(this.body, { x: vx, y: vy });
        this.graphics = scene.add.graphics();
    }

    getPosition() {
        return this.body.position;
    }

    updateTrail() {
        if (!this.alive) return;
        const pos = this.body.position;

        this.trail.push({ x: pos.x, y: pos.y });
        if (this.trail.length > Config.TRAIL_LENGTH) {
            this.trail.shift();
        }

        this.graphics.clear();

        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length;
            const radius = Config.PROJECTILE_RADIUS * alpha * 0.8;
            this.graphics.fillStyle(0xff6600, alpha * 0.4);
            this.graphics.fillCircle(this.trail[i].x, this.trail[i].y, radius);
        }

        this.graphics.fillStyle(0x222222);
        this.graphics.fillCircle(pos.x, pos.y, Config.PROJECTILE_RADIUS);
    }

    destroy() {
        this.alive = false;
        this.scene.matter.world.remove(this.body);
        this.graphics.destroy();
    }
}
