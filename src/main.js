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
