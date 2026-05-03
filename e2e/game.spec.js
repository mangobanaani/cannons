import { test, expect } from '@playwright/test';

function gameState(page) {
    return page.evaluate(() => {
        const game = window.game;
        if (!game) return null;
        const scenes = game.scene.scenes;
        const active = scenes.find(s => s.scene.isActive());
        if (!active) return null;
        const state = { scene: active.scene.key };
        if (active.scene.key === 'GameScene') {
            state.isPlayerTurn = active.isPlayerTurn;
            state.canFire = active.canFire;
            state.hasProjectile = active.projectile !== null;
            state.playerAngle = active.playerCannon?.angle;
            state.playerPower = active.playerCannon?.power;
            state.playerHp = active.playerCannon?.targetHp;
            state.aiHp = active.aiCannon?.targetHp;
        }
        if (active.scene.key === 'GameOverScene') {
            state.playerWon = active.playerWon;
        }
        return state;
    });
}

async function waitForScene(page, sceneKey, timeout = 10000) {
    await page.waitForFunction(
        (key) => {
            const game = window.game;
            if (!game) return false;
            const active = game.scene.scenes.find(s => s.scene.isActive());
            return active && active.scene.key === key;
        },
        sceneKey,
        { timeout }
    );
}

async function waitForPlayerTurn(page, timeout = 15000) {
    await page.waitForFunction(
        () => {
            const game = window.game;
            if (!game) return false;
            const active = game.scene.scenes.find(s => s.scene.isActive());
            return active && active.scene.key === 'GameScene' && active.isPlayerTurn && active.canFire && !active.projectile;
        },
        { timeout }
    );
}

test.describe('Cannons E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForFunction(() => window.game && window.game.isBooted);
    });

    test('menu loads with canvas', async ({ page }) => {
        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();
        const state = await gameState(page);
        expect(state.scene).toBe('MenuScene');
    });

    test('start game transitions to GameScene', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');
        const state = await gameState(page);
        expect(state.scene).toBe('GameScene');
    });

    test('HUD shows player turn', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');
        const state = await gameState(page);
        expect(state.isPlayerTurn).toBe(true);
    });

    test('adjust angle with ArrowUp', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        const before = await gameState(page);
        const initialAngle = before.playerAngle;

        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('ArrowUp');
        }
        await page.waitForTimeout(100);

        const after = await gameState(page);
        expect(after.playerAngle).toBeGreaterThan(initialAngle);
    });

    test('adjust power with ArrowRight', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        const before = await gameState(page);
        const initialPower = before.playerPower;

        for (let i = 0; i < 10; i++) {
            await page.keyboard.press('ArrowRight');
        }
        await page.waitForTimeout(100);

        const after = await gameState(page);
        expect(after.playerPower).toBeGreaterThan(initialPower);
    });

    test('fire projectile with Space', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        await page.keyboard.press('Space');
        await page.waitForFunction(() => {
            const game = window.game;
            const active = game.scene.scenes.find(s => s.scene.isActive());
            return active && active.scene.key === 'GameScene' && active.projectile !== null;
        }, { timeout: 5000 });

        const state = await gameState(page);
        expect(state.hasProjectile).toBe(true);
    });

    test('projectile resolves and turn switches to AI', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        await page.keyboard.press('Space');
        await page.waitForFunction(
            () => {
                const game = window.game;
                const active = game.scene.scenes.find(s => s.scene.isActive());
                return active && active.scene.key === 'GameScene' && active.projectile === null && !active.isPlayerTurn;
            },
            { timeout: 10000 }
        );

        const state = await gameState(page);
        expect(state.isPlayerTurn).toBe(false);
        expect(state.hasProjectile).toBe(false);
    });

    test('AI fires and turn returns to player', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        await page.keyboard.press('Space');
        await waitForPlayerTurn(page);

        const state = await gameState(page);
        expect(state.isPlayerTurn).toBe(true);
        expect(state.canFire).toBe(true);
    });

    test('game over flow on AI destruction', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        // Simulate a killing blow by setting AI HP to 0 and triggering game over
        await page.evaluate(() => {
            const game = window.game;
            const active = game.scene.scenes.find(s => s.scene.isActive());
            active.aiCannon.targetHp = 0;
            active.scene.start('GameOverScene', { playerWon: true });
        });

        await waitForScene(page, 'GameOverScene', 10000);

        const state = await gameState(page);
        expect(state.scene).toBe('GameOverScene');
        expect(state.playerWon).toBe(true);
    });

    test('play again from GameOverScene', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        // Force game over immediately
        await page.evaluate(() => {
            const game = window.game;
            const active = game.scene.scenes.find(s => s.scene.isActive());
            active.scene.start('GameOverScene', { playerWon: true });
        });
        await waitForScene(page, 'GameOverScene');

        // Click PLAY AGAIN button at (400, 380)
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        const state = await gameState(page);
        expect(state.scene).toBe('GameScene');
    });

    test('main menu from GameOverScene', async ({ page }) => {
        await waitForScene(page, 'MenuScene');
        await page.click('canvas', { position: { x: 400, y: 380 } });
        await waitForScene(page, 'GameScene');

        // Force game over immediately
        await page.evaluate(() => {
            const game = window.game;
            const active = game.scene.scenes.find(s => s.scene.isActive());
            active.scene.start('GameOverScene', { playerWon: false });
        });
        await waitForScene(page, 'GameOverScene');

        // Click MAIN MENU button at (400, 440)
        await page.click('canvas', { position: { x: 400, y: 440 } });
        await waitForScene(page, 'MenuScene');

        const state = await gameState(page);
        expect(state.scene).toBe('MenuScene');
    });
});
