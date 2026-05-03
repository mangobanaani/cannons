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
