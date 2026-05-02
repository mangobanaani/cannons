# Cannon Game Design Spec

## Overview

A 2D artillery game where the player controls a cannon and battles an AI opponent. Players take turns adjusting angle and power to lob projectiles across destructible terrain. Built with Phaser 3 and Matter.js physics.

## Tech Stack

- **Framework:** Phaser 3 with Matter.js physics engine
- **Art style:** Minimal / clean geometric shapes, solid colors
- **Build:** No build step, local dev server, Phaser via CDN or npm
- **Target:** Browser (desktop)

## Project Structure

```
cannons/
  index.html
  src/
    main.js              - Phaser game config, scene registration
    scenes/
      GameScene.js       - Main gameplay (terrain, cannons, turns, AI)
      MenuScene.js       - Start screen
      GameOverScene.js   - Win/lose screen with replay
    objects/
      Cannon.js          - Cannon class (sprite, angle, power, HP, fire)
      Projectile.js      - Projectile with Matter.js body, trail
      Terrain.js         - Heightmap terrain: generation, rendering, destruction
      ParticleEffects.js - Explosion and dirt particle configs
    ai/
      SimpleAI.js        - AI opponent with adjustable accuracy
    config.js            - Constants (gravity, max power, HP, blast radius)
  assets/
  package.json
  .gitignore
```

## Terrain System

- **Data model:** Heightmap array — one height value per pixel column across screen width (800 values for 800px).
- **Generation:** Midpoint displacement algorithm for natural hills/valleys.
- **Rendering:** Phaser Graphics object draws a filled polygon each frame. Two visual layers: green surface line (2-3px) and brown earth fill below.
- **Destruction:** On projectile impact, reduce height values in a radius around impact column using circular cosine falloff. Creates smooth craters.
- **Cannon settling:** After terrain destruction under a cannon, it lerps down to the new terrain height.

## Cannon

- **Visual:** Geometric base rectangle + rotatable barrel rectangle.
- **HUD:** Angle/power readout displayed near the active cannon. HP bar above each cannon.
- **Controls:** Up/down arrow keys adjust barrel angle. Left/right adjust power. Spacebar fires.
- **Placement:** Player cannon at ~15% screen width, AI cannon at ~85%, both sitting on terrain surface.

## Projectile & Trajectory

- **Spawn:** Small circle with a Matter.js body created at barrel tip on fire.
- **Velocity:** `vx = power * cos(angle)`, `vy = power * sin(angle)`.
- **Physics:** Matter.js gravity creates parabolic arc.
- **Trail:** Store last 15-20 positions, draw fading circles behind projectile.
- **Impact detection:** Projectile y >= terrain height at that x column triggers explosion.

## Combat & Turn System

1. Player adjusts angle/power and fires (spacebar).
2. Camera follows projectile until impact.
3. Explosion triggers: particles, terrain destruction, damage calculation.
4. Brief pause (~1s).
5. AI takes its turn (same sequence).
6. Repeat until one cannon reaches 0 HP.

### Damage

- HP starts at 100.
- Damage based on distance from explosion center to cannon position.
- Direct hit: ~40 damage. Edge of blast radius: ~10 damage.
- No damage if explosion is outside blast radius of the cannon.

## AI

- Calculates ideal angle/power using kinematic equations to reach player's x-position.
- Adds random error (+/- 10-15%) to both angle and power so it's imperfect.
- Difficulty could be scaled by reducing error range.

## Particle Effects

### Explosion

- 30-50 particles spawned at impact point via Phaser particle emitter.
- Mix of brown/dark dirt particles (arc up and outward, gravity-affected) and orange/yellow fire particles (brief, fast-fading).
- Lifespan: 500-800ms. Random size and velocity for organic look.

### Projectile Trail

- Last 15-20 positions stored and drawn as circles with decreasing alpha and size.
- Cleared on impact.

### Screen Shake

- Brief camera shake on explosion. Intensity scales with proximity to a cannon.

### HP Bar

- Smooth lerp animation when HP decreases. Red flash on damaged cannon.

## UI & Game Flow

### Menu Scene

- Game title, "Start Game" button.

### Game Scene HUD

- Turn indicator: "Your Turn" / "Enemy Turn".
- Angle and power readout next to active cannon.

### Game Over Scene

- Winning cannon: barrel pump animation.
- Losing cannon: destruction particle burst.
- "You Win" / "You Lose" text with "Play Again" button.

## Scope Boundaries

- No wind mechanic in v1 (easy to add later).
- No multiplayer networking.
- No sound in v1.
- No mobile/touch controls.
- Single difficulty level for AI.
