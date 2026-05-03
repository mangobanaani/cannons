export default class ParticleEffects {
    constructor(scene) {
        this.scene = scene;

        const gfx = scene.make.graphics({ add: false });
        gfx.fillStyle(0xffffff);
        gfx.fillCircle(4, 4, 4);
        gfx.generateTexture('particle', 8, 8);
        gfx.destroy();

        this.dirtEmitter = scene.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 200 },
            angle: { min: 220, max: 320 },
            scale: { start: 0.6, end: 0 },
            lifespan: { min: 400, max: 800 },
            gravityY: 300,
            tint: [0x8B6914, 0x6B4F12, 0x4a3610],
            emitting: false
        });

        this.fireEmitter = scene.add.particles(0, 0, 'particle', {
            speed: { min: 30, max: 120 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.8, end: 0 },
            lifespan: { min: 100, max: 300 },
            tint: [0xff6600, 0xff9900, 0xffcc00],
            blendMode: 'ADD',
            emitting: false
        });
    }

    explode(x, y) {
        this.dirtEmitter.emitParticleAt(x, y, 30);
        this.fireEmitter.emitParticleAt(x, y, 15);
    }
}
