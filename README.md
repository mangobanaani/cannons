# Cannons

A 2D artillery game where you battle an AI opponent by lobbing projectiles across destructible terrain.

## How to Play

Adjust your cannon's angle and power, then fire to hit the enemy cannon. The terrain deforms on impact, creating craters. First cannon to reach 0 HP loses.

### Controls

- **UP/DOWN** - Adjust barrel angle
- **LEFT/RIGHT** - Adjust power
- **SPACE** - Fire

## Running

```
npx serve . -l 3000
```

Open http://localhost:3000 in a browser.

## Running Tests

```
node --test tests/*.test.js
```

## Tech

- Phaser 3 with Matter.js physics
- Vanilla JS ES modules, no build step
- Procedural terrain via midpoint displacement
- Distance-based damage with cosine-falloff craters

## License

GPL-3.0 - see [LICENSE](LICENSE)
