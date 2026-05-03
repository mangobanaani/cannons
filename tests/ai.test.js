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
