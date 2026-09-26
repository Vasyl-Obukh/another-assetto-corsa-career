import { describe, expect, it } from '@jest/globals';

import { COMPACT_TOP } from '../constants.ts';
import { compactRows } from '../utils.ts';
import type { DriverRow } from '@/lib/season-results';

/**
 * A table of driver rows, the player at one place in it.
 * @param count How many rows
 * @param player Where the player sits, counting from zero, or -1 for nowhere
 * @returns The rows, best placed first
 */
const table = (count: number, player: number): DriverRow[] => Array.from({ length: count }, (unused, at) => ({
  seat: `s${at}`,
  driver: `D${at}`,
  team: null,
  position: at + 1,
  points: 0,
  wins: 0,
  podiums: 0,
  bestFinish: null,
  races: 0,
  key: `s${at}`,
  move: null,
  player: at === player,
  qualifyingPoints: 0,
  fastestLapPoints: 0,
  places: [],
}));

describe('renderer/components/results/utils', () => {
  describe('compactRows', () => {
    it('keeps a short table whole', () => {
      const rows = compactRows(table(COMPACT_TOP, 2));

      expect(rows.map(({ row, gap }) => [row.position, gap])).toEqual(
        Array.from({ length: COMPACT_TOP }, (unused, at) => [at + 1, false]),
      );
    });

    it('keeps the top, then the player with whoever is either side, marking the rows skipped', () => {
      const rows = compactRows(table(20, 11));

      expect(rows.map(({ row }) => row.position)).toEqual([1, 2, 3, 4, 5, 11, 12, 13]);
      expect(rows.map(({ gap }) => gap)).toEqual([false, false, false, false, false, true, false, false]);
    });

    it('runs straight on where the player sits just below the top', () => {
      const rows = compactRows(table(20, COMPACT_TOP));

      expect(rows.map(({ row }) => row.position)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(rows.some(({ gap }) => gap)).toBe(false);
    });

    it('keeps the top alone when the player is not in the table', () => {
      expect(compactRows(table(20, -1)).map(({ row }) => row.position)).toEqual([1, 2, 3, 4, 5]);
    });

    it('stops at the last row for a player in last place', () => {
      expect(compactRows(table(20, 19)).map(({ row }) => row.position)).toEqual([1, 2, 3, 4, 5, 19, 20]);
    });
  });
});
