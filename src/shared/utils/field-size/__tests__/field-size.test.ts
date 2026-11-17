import { describe, expect, it } from '@jest/globals';

import type { Championship } from '../../../types/index.ts';
import { fieldSize, tooFewPitboxes } from '../index.ts';

describe('shared/utils/field-size', () => {
  describe('fieldSize', () => {
    it("counts every seat of every class, the player's included", () => {
      const series = {
        entries: [
          { seats: [{ id: 'a' }, { id: 'b' }] },
          { seats: [{ id: 'c' }] },
        ],
      } as unknown as Championship;

      expect(fieldSize(series)).toBe(3);
    });

    it('counts nothing for a championship with no classes yet', () => {
      expect(fieldSize({ entries: [] })).toBe(0);
    });
  });

  describe('tooFewPitboxes', () => {
    it('refuses a field bigger than the pit boxes', () => {
      expect(tooFewPitboxes(25, 24)).toBe(true);
    });

    it('holds a field that fills every box exactly', () => {
      expect(tooFewPitboxes(24, 24)).toBe(false);
    });

    it('holds any field on a track that does not say how many boxes it has', () => {
      expect(tooFewPitboxes(60, null)).toBe(false);
      expect(tooFewPitboxes(60, undefined)).toBe(false);
    });

    // Fixed: the core took a track saying 0 to hold any field while the editor
    // and the track page called it short; both now read it as not saying.
    it('holds any field on a track that says it has no boxes', () => {
      expect(tooFewPitboxes(60, 0)).toBe(false);
    });
  });
});
