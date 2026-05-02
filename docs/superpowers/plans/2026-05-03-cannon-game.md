# Cannon Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 2D artillery game where the player battles an AI opponent, shooting projectiles across destructible terrain with particle effects.

**Architecture:** Phaser 3 with Matter.js physics for projectile simulation. Terrain stored as a per-column heightmap array, rendered via Phaser Graphics, carved with cosine falloff on impact. Turn-based gameplay alternates between player keyboard input and AI opponent.

**Tech Stack:** Phaser 3 (CDN), Matter.js (built into Phaser), vanilla JS ES modules, no build step.

---

## File Structure

```
cannons/
  index.html                    - Entry point, loads Phaser CDN + main module
  package.json                  - Dev server script only
  src/
    main.js                     - Phaser game config, scene registration
    config.js                   - All game constants
    utils/
      terrain.js                - Pure functions: generateHeightmap, carveCrater
      combat.js                 - Pure function: calculateDamage
      ai.js                     - Pure function: calculateAIShot
    scenes/
      MenuScene.js              - Start screen
      GameScene.js              - Main gameplay loop
      GameOverScene.js          - Win/lose screen with replay
    objects/
      Terrain.js                - Phaser terrain renderer wrapping utils/terrain
      Cannon.js                 - Cannon drawing, angle/power, HP
      Projectile.js             - Matter.js body, trail rendering
      ParticleEffects.js        - Explosion particle emitters
  tests/
    terrain.test.js             - Tests for heightmap generation and crater carving
    combat.test.js              - Tests for damage calculation
    ai.test.js                  - Tests for AI shot calculation
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/config.js`
- Create: `src/main.js`
- Create: `src/scenes/MenuScene.js`
- Create: `src/scenes/GameScene.js`
- Create: `src/scenes/GameOverScene.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "cannons",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "npx serve . -l 3000",
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cannons</title>
  <style>
    body { margin: 0; background: #000; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create src/config.js**

```js
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GRAVITY = 0.3;

export const MAX_POWER = 15;
export const MIN_POWER = 2;
export const DEFAULT_POWER = 8;
export const DEFAULT_ANGLE = Math.PI / 4;
export const ANGLE_STEP = 0.02;
export const POWER_STEP = 0.3;
export const MIN_ANGLE = 10 * Math.PI / 180;
export const MAX_ANGLE = 80 * Math.PI / 180;

export const CANNON_HP = 100;
export const BLAST_RADIUS = 40;
export const CRATER_DEPTH = 30;
export const MAX_DAMAGE = 35;

export const TERRAIN_MIN_Y = 300;
export const TERRAIN_MAX_Y = 500;
export const PLAYER_X_PERCENT = 0.15;
export const AI_X_PERCENT = 0.85;

export const PROJECTILE_RADIUS = 4;
export const TRAIL_LENGTH = 20;
export const BARREL_LENGTH = 25;
```

- [ ] **Step 4: Create stub scene files**

`src/scenes/MenuScene.js`:
```js
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.scene.start('GameScene');
    }
}
```

`src/scenes/GameScene.js`:
```js
export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.add.text(400, 300, 'Game Scene', { fontSize: '24px', fill: '#333' }).setOrigin(0.5);
    }
}
```

`src/scenes/GameOverScene.js`:
```js
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(400, 300, 'Game Over', { fontSize: '24px', fill: '#333' }).setOrigin(0.5);
    }
}
```

- [ ] **Step 5: Create src/main.js**

```js
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './config.js';

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#87CEEB',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: GRAVITY },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
```

- [ ] **Step 6: Run dev server and verify**

Run: `npx serve . -l 3000`

Open `http://localhost:3000`. Expected: sky-blue canvas with "Game Scene" text centered.

- [ ] **Step 7: Commit**

```bash
git add package.json index.html src/
git commit -m "scaffold project with phaser 3 and stub scenes"
```

---

### Task 2: Terrain Logic & Tests

**Files:**
- Create: `src/utils/terrain.js`
- Create: `tests/terrain.test.js`

- [ ] **Step 1: Write failing tests for generateHeightmap**

`tests/terrain.test.js`:
```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateHeightmap, carveCrater } from '../src/utils/terrain.js';

describe('generateHeightmap', () => {
    it('returns array of correct length', () => {
        const hm = generateHeightmap(100, 300, 500);
        assert.equal(hm.length, 100);
    });

    it('all values within min/max range', () => {
        const hm = generateHeightmap(200, 300, 500);
        for (const h of hm) {
            assert.ok(h >= 300 && h <= 500, `height ${h} out of range`);
        }
    });

    it('produces varied terrain', () => {
        const hm = generateHeightmap(100, 300, 500);
        const unique = new Set(hm.map(h => Math.round(h)));
        assert.ok(unique.size > 5, 'terrain should have variation');
    });
});

describe('carveCrater', () => {
    it('lowers terrain at impact center', () => {
        const hm = new Array(100).fill(400);
        carveCrater(hm, 50, 20, 30, 600);
        assert.ok(hm[50] > 400, 'center should move down (higher y)');
    });

    it('does not affect terrain outside radius', () => {
        const hm = new Array(100).fill(400);
        carveCrater(hm, 50, 10, 30, 600);
        assert.equal(hm[0], 400);
        assert.equal(hm[99], 400);
    });

    it('crater is deepest at center', () => {
        const hm = new Array(100).fill(400);
        carveCrater(hm, 50, 20, 30, 600);
        assert.ok(hm[50] > hm[40]);
    });

    it('does not push terrain below maxY', () => {
        const hm = new Array(100).fill(590);
        carveCrater(hm, 50, 20, 30, 600);
        for (const h of hm) {
            assert.ok(h <= 600, `height ${h} exceeds maxY`);
        }
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/terrain.test.js`

Expected: FAIL — module `../src/utils/terrain.js` not found.

- [ ] **Step 3: Implement terrain utilities**

`src/utils/terrain.js`:
```js
export function generateHeightmap(width, minY, maxY, roughness = 0.6) {
    const heights = new Array(width);
    heights[0] = minY + Math.random() * (maxY - minY);
    heights[width - 1] = minY + Math.random() * (maxY - minY);

    function subdivide(left, right, displacement) {
        if (right - left <= 1) return;
        const mid = Math.floor((left + right) / 2);
        heights[mid] = (heights[left] + heights[right]) / 2
            + (Math.random() - 0.5) * displacement;
        heights[mid] = Math.max(minY, Math.min(maxY, heights[mid]));
        subdivide(left, mid, displacement * roughness);
        subdivide(mid, right, displacement * roughness);
    }

    subdivide(0, width - 1, (maxY - minY) * 0.5);
    return heights;
}

export function carveCrater(heightmap, centerX, radius, depth, maxY) {
    const startX = Math.max(0, Math.floor(centerX - radius));
    const endX = Math.min(heightmap.length - 1, Math.ceil(centerX + radius));

    for (let x = startX; x <= endX; x++) {
        const dist = Math.abs(x - centerX);
        if (dist < radius) {
            const factor = Math.cos((dist / radius) * Math.PI / 2);
            heightmap[x] = Math.min(heightmap[x] + depth * factor, maxY);
        }
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/terrain.test.js`

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/terrain.js tests/terrain.test.js
git commit -m "add terrain heightmap generation and crater carving with tests"
```

---

### Task 3: Terrain Rendering

**Files:**
- Create: `src/objects/Terrain.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Create Terrain renderer class**

`src/objects/Terrain.js`:
```js
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
```

- [ ] **Step 2: Wire terrain into GameScene**

Replace `src/scenes/GameScene.js`:
```js
import Terrain from '../objects/Terrain.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.terrain = new Terrain(this);
    }
}
```

- [ ] **Step 3: Run dev server and verify visually**

Run: `npx serve . -l 3000`

Expected: sky-blue background with brown terrain and a green grass line on top, with natural-looking hills.

- [ ] **Step 4: Commit**

```bash
git add src/objects/Terrain.js src/scenes/GameScene.js
git commit -m "add terrain rendering with heightmap and grass surface"
```

---

### Task 4: Cannons

**Files:**
- Create: `src/objects/Cannon.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Create Cannon class**

`src/objects/Cannon.js`:
```js
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
        const dir = this.isPlayer ? 1 : -1;

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
```

- [ ] **Step 2: Add cannons to GameScene**

Replace `src/scenes/GameScene.js`:
```js
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
    }

    update() {
        this.playerCannon.update();
        this.aiCannon.update();
    }
}
```

- [ ] **Step 3: Run dev server and verify visually**

Expected: two cannons sitting on the terrain — blue on the left, red on the right, each with a barrel and HP bar.

- [ ] **Step 4: Commit**

```bash
git add src/objects/Cannon.js src/scenes/GameScene.js
git commit -m "add cannon drawing with barrel, base, wheels, and hp bar"
```

---

### Task 5: Player Controls & HUD

**Files:**
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Add keyboard input and HUD to GameScene**

Replace `src/scenes/GameScene.js`:
```js
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
```

- [ ] **Step 2: Run dev server and verify**

Expected: "YOUR TURN" at the top. Up/down keys rotate the player's barrel. Left/right adjust displayed power value. Angle and power readout shown above the player cannon.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "add player input controls and aiming hud"
```

---

### Task 6: Projectile, Trajectory & Impact

**Files:**
- Create: `src/objects/Projectile.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Create Projectile class with Matter.js body and trail**

`src/objects/Projectile.js`:
```js
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

        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length;
            const radius = Config.PROJECTILE_RADIUS * alpha * 0.8;
            this.graphics.fillStyle(0xff6600, alpha * 0.4);
            this.graphics.fillCircle(this.trail[i].x, this.trail[i].y, radius);
        }

        // Projectile
        this.graphics.fillStyle(0x222222);
        this.graphics.fillCircle(pos.x, pos.y, Config.PROJECTILE_RADIUS);
    }

    destroy() {
        this.alive = false;
        this.scene.matter.world.remove(this.body);
        this.graphics.destroy();
    }
}
```

- [ ] **Step 2: Add firing and impact detection to GameScene**

Add these imports to the top of `src/scenes/GameScene.js`:
```js
import Projectile from '../objects/Projectile.js';
```

Add this method to the `GameScene` class:
```js
    fireProjectile(cannon) {
        const tip = cannon.getBarrelTip();
        const dir = cannon.isPlayer ? 1 : -1;
        const vx = cannon.power * Math.cos(cannon.angle) * dir;
        const vy = -cannon.power * Math.sin(cannon.angle);

        this.projectile = new Projectile(this, tip.x, tip.y, vx, vy);
        this.canFire = false;
    }
```

Add spacebar firing inside `handleInput()`, after the power controls:
```js
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.fireProjectile(this.playerCannon);
        }
```

Add projectile tracking at the end of `update()`:
```js
        if (this.projectile && this.projectile.alive) {
            this.projectile.updateTrail();

            const pos = this.projectile.getPosition();
            const ix = Math.floor(pos.x);

            // Terrain hit
            if (ix >= 0 && ix < Config.GAME_WIDTH && pos.y >= this.terrain.getHeightAt(ix)) {
                this.onProjectileImpact(pos.x, pos.y);
                return;
            }

            // Off screen
            if (pos.x < -50 || pos.x > Config.GAME_WIDTH + 50 || pos.y > Config.GAME_HEIGHT + 50) {
                this.onProjectileMiss();
                return;
            }
        }
```

Add impact and miss handlers:
```js
    onProjectileImpact(x, y) {
        const ix = Phaser.Math.Clamp(Math.floor(x), 0, Config.GAME_WIDTH - 1);

        this.projectile.destroy();
        this.projectile = null;

        // Carve terrain
        this.terrain.carve(ix, Config.BLAST_RADIUS);

        // Update cannon positions
        this.playerCannon.updatePosition();
        this.aiCannon.updatePosition();

        // Next turn
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
    }
```

- [ ] **Step 3: Run dev server and verify**

Expected: spacebar fires a projectile from the player cannon in a parabolic arc. Trail renders behind it. On terrain hit, a crater is carved and the turn switches. Cannons settle into craters. If projectile goes off-screen, turn switches without crater.

- [ ] **Step 4: Commit**

```bash
git add src/objects/Projectile.js src/scenes/GameScene.js
git commit -m "add projectile firing with trajectory, trail, and terrain destruction"
```

---

### Task 7: Particle Effects & Screen Shake

**Files:**
- Create: `src/objects/ParticleEffects.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Create ParticleEffects class**

`src/objects/ParticleEffects.js`:
```js
export default class ParticleEffects {
    constructor(scene) {
        this.scene = scene;

        // Generate a small white circle texture for tinting
        const gfx = scene.make.graphics({ add: false });
        gfx.fillStyle(0xffffff);
        gfx.fillCircle(4, 4, 4);
        gfx.generateTexture('particle', 8, 8);
        gfx.destroy();

        // Dirt emitter
        this.dirtEmitter = scene.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 200 },
            angle: { min: 220, max: 320 },
            scale: { start: 0.6, end: 0 },
            lifespan: { min: 400, max: 800 },
            gravityY: 300,
            tint: [0x8B6914, 0x6B4F12, 0x4a3610],
            emitting: false
        });

        // Fire emitter
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
```

- [ ] **Step 2: Integrate particles and screen shake into GameScene**

Add import at top of `src/scenes/GameScene.js`:
```js
import ParticleEffects from '../objects/ParticleEffects.js';
```

In `create()`, after creating the cannons, add:
```js
        this.particles = new ParticleEffects(this);
```

In `onProjectileImpact()`, after `this.projectile = null;` and before terrain carving, add:
```js
        // Explosion effects
        this.particles.explode(ix, y);
        this.cameras.main.shake(200, 0.008);
```

- [ ] **Step 3: Run dev server and verify**

Expected: on impact, dirt and fire particles burst from the impact point. Camera shakes briefly. Crater still carves correctly beneath the particles.

- [ ] **Step 4: Commit**

```bash
git add src/objects/ParticleEffects.js src/scenes/GameScene.js
git commit -m "add explosion particle effects and screen shake on impact"
```

---

### Task 8: Damage & HP System

**Files:**
- Create: `src/utils/combat.js`
- Create: `tests/combat.test.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Write failing tests for calculateDamage**

`tests/combat.test.js`:
```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDamage } from '../src/utils/combat.js';

describe('calculateDamage', () => {
    it('returns max damage for direct hit', () => {
        const dmg = calculateDamage(100, 400, 100, 400, 40, 35);
        assert.equal(dmg, 35);
    });

    it('returns zero outside blast radius', () => {
        const dmg = calculateDamage(100, 400, 200, 400, 40, 35);
        assert.equal(dmg, 0);
    });

    it('returns partial damage for near miss', () => {
        const dmg = calculateDamage(100, 400, 120, 400, 40, 35);
        assert.ok(dmg > 0 && dmg < 35);
    });

    it('damage decreases with distance', () => {
        const close = calculateDamage(100, 400, 110, 400, 40, 35);
        const far = calculateDamage(100, 400, 130, 400, 40, 35);
        assert.ok(close > far);
    });

    it('returns zero for exactly at blast radius', () => {
        const dmg = calculateDamage(100, 400, 140, 400, 40, 35);
        assert.equal(dmg, 0);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/combat.test.js`

Expected: FAIL — module not found.

- [ ] **Step 3: Implement calculateDamage**

`src/utils/combat.js`:
```js
export function calculateDamage(impactX, impactY, targetX, targetY, blastRadius, maxDamage) {
    const dx = impactX - targetX;
    const dy = impactY - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= blastRadius) return 0;

    const factor = 1 - (distance / blastRadius);
    return Math.round(maxDamage * factor);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/combat.test.js`

Expected: all 5 tests PASS.

- [ ] **Step 5: Add damage calculation to GameScene impact handler**

Add import at top of `src/scenes/GameScene.js`:
```js
import { calculateDamage } from '../utils/combat.js';
```

In `onProjectileImpact()`, after terrain carving and before cannon position updates, add:
```js
        // Calculate damage to target
        const target = this.isPlayerTurn ? this.aiCannon : this.playerCannon;
        const damage = calculateDamage(
            ix, y, target.x, target.y,
            Config.BLAST_RADIUS, Config.MAX_DAMAGE
        );
        if (damage > 0) {
            target.takeDamage(damage);
            this.cameras.main.shake(300, 0.015);
        }
```

- [ ] **Step 6: Run dev server and verify**

Expected: hitting near a cannon reduces its HP bar. HP bar animates smoothly. Stronger shake on cannon hit.

- [ ] **Step 7: Commit**

```bash
git add src/utils/combat.js tests/combat.test.js src/scenes/GameScene.js
git commit -m "add distance-based damage calculation with tests"
```

---

### Task 9: Turn System & Game Over Detection

**Files:**
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Add game over detection to onProjectileImpact**

In `onProjectileImpact()`, replace the delayed `switchTurn()` call at the end with:
```js
        // Check game over
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
```

- [ ] **Step 2: Run dev server and verify**

Expected: when a cannon's HP reaches 0, there is an extra explosion on it, then the game transitions to the GameOver scene after a pause.

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameScene.js
git commit -m "add game over detection on cannon destruction"
```

---

### Task 10: AI Opponent

**Files:**
- Create: `src/utils/ai.js`
- Create: `tests/ai.test.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Write failing tests for AI targeting**

`tests/ai.test.js`:
```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAIShot } from '../src/utils/ai.js';

describe('calculateAIShot', () => {
    it('returns angle and power', () => {
        const shot = calculateAIShot(680, 400, 120, 400, 0.3, 15);
        assert.ok('angle' in shot);
        assert.ok('power' in shot);
    });

    it('angle is between 0 and PI/2', () => {
        for (let i = 0; i < 20; i++) {
            const shot = calculateAIShot(680, 400, 120, 400, 0.3, 15);
            assert.ok(shot.angle > 0, `angle ${shot.angle} should be > 0`);
            assert.ok(shot.angle < Math.PI / 2, `angle ${shot.angle} should be < PI/2`);
        }
    });

    it('power is within valid range', () => {
        for (let i = 0; i < 20; i++) {
            const shot = calculateAIShot(680, 400, 120, 400, 0.3, 15);
            assert.ok(shot.power >= 1, `power ${shot.power} should be >= 1`);
            assert.ok(shot.power <= 15, `power ${shot.power} should be <= 15`);
        }
    });

    it('produces varied shots due to randomness', () => {
        const angles = new Set();
        for (let i = 0; i < 20; i++) {
            const shot = calculateAIShot(680, 400, 120, 400, 0.3, 15);
            angles.add(Math.round(shot.angle * 100));
        }
        assert.ok(angles.size > 3, 'AI should produce varied angles');
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/ai.test.js`

Expected: FAIL — module not found.

- [ ] **Step 3: Implement AI targeting**

`src/utils/ai.js`:
```js
export function calculateAIShot(cannonX, cannonY, targetX, targetY, gravity, maxPower, errorFactor = 0.15) {
    const dx = Math.abs(cannonX - targetX);
    const dy = targetY - cannonY;

    const baseAngle = (35 + Math.random() * 20) * Math.PI / 180;
    const tanA = Math.tan(baseAngle);
    const cosA = Math.cos(baseAngle);

    const denominator = 2 * cosA * cosA * (dx * tanA + dy);

    let power;
    if (denominator <= 0) {
        power = maxPower;
    } else {
        power = Math.sqrt(gravity * dx * dx / denominator);
    }

    power = Math.max(1, Math.min(power, maxPower));

    // Add random error
    const angle = baseAngle + (Math.random() - 0.5) * errorFactor;
    power = power * (1 + (Math.random() - 0.5) * errorFactor);
    power = Math.max(1, Math.min(power, maxPower));

    return { angle, power };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/ai.test.js`

Expected: all 4 tests PASS.

- [ ] **Step 5: Integrate AI into GameScene turn system**

Add import at top of `src/scenes/GameScene.js`:
```js
import { calculateAIShot } from '../utils/ai.js';
```

Update `switchTurn()` to trigger AI:
```js
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
```

Add the `aiTurn()` method:
```js
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
```

- [ ] **Step 6: Run dev server and verify**

Expected: after the player fires and the turn switches, the AI cannon adjusts its barrel and fires back. AI shots land in the general vicinity of the player cannon, with some randomness.

- [ ] **Step 7: Commit**

```bash
git add src/utils/ai.js tests/ai.test.js src/scenes/GameScene.js
git commit -m "add ai opponent with ballistic targeting and random error"
```

---

### Task 11: Menu & Game Over Scenes

**Files:**
- Modify: `src/scenes/MenuScene.js`
- Modify: `src/scenes/GameOverScene.js`

- [ ] **Step 1: Implement MenuScene**

Replace `src/scenes/MenuScene.js`:
```js
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
```

- [ ] **Step 2: Implement GameOverScene**

Replace `src/scenes/GameOverScene.js`:
```js
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
```

- [ ] **Step 3: Run dev server and verify full game flow**

Expected: game starts at menu scene. Clicking START begins gameplay. After a cannon is destroyed, game over scene shows win/lose. PLAY AGAIN restarts the game. MAIN MENU returns to title.

- [ ] **Step 4: Run all tests**

Run: `node --test tests/`

Expected: all tests pass (terrain: 7, combat: 5, ai: 4 = 16 total).

- [ ] **Step 5: Commit**

```bash
git add src/scenes/MenuScene.js src/scenes/GameOverScene.js
git commit -m "add menu and game over scenes with full game flow"
```
