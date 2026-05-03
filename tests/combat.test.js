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
