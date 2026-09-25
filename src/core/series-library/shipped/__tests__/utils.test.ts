import { describe, expect, it } from '@jest/globals';

import { SERIES_FORMAT_VERSION } from '../../../../shared/constants/index.ts';
import { Discipline } from '../../../../shared/types/index.ts';
import type { Championship } from '../../../../shared/types/index.ts';
import { filler, seat } from '../utils.ts';

/**
 * A championship to derive fillers from, stating a length and a sum
 * everywhere one can be stated.
 */
const BASE: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'junior-cup',
  name: 'Junior Cup',
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.SINGLE_SEATER, tier: 5 },
    seats: [{ id: 'main-1' }, { id: 'main-2' }],
    eligibility: { kind: 'cars', cars: ['tatuusfa1'] },
    prizes: { positions: [1000], standings: [4000] },
  }],
  rounds: [{
    id: 'monza',
    name: 'Monza',
    track: { id: 'monza' },
    entryFee: 200,
    sessionLengths: [{ session: 'race', distance: 40 }, { session: 'quali', minutes: 20 }],
  }],
  weekendFormats: [{
    id: 'weekend',
    name: 'Weekend',
    sessions: [
      { id: 'quali', type: 'qualify', minutes: 20 },
      { id: 'race', type: 'race', laps: 20 },
      { id: 'endurance', type: 'race', minutes: 40 },
      { id: 'grand-prix', type: 'race', distance: 100 },
    ],
  }],
  defaultWeekendFormat: 'weekend',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
  defaultPointsSystem: 'race',
  grid: { strength: 3, aggression: 5 },
  entryFee: 1000,
  prizes: { positions: [2000, 1000], standings: [10_000] },
};

describe('core/series-library/shipped/utils', () => {
  describe('filler', () => {
    const plus = filler(BASE, 1, 'Longer races.');

    it('repeats the championship a rung higher, under a name and id of its own', () => {
      expect(plus).toMatchObject({
        id: 'junior-cup-plus', name: 'Junior Cup +', description: 'Longer races.',
      });
      expect(plus.entries[0].ladder.tier).toBe(4);
      expect(filler(BASE, 2, '').id).toBe('junior-cup-plus-plus');
    });

    it('runs every race longer, in whatever it is measured in, and nothing else', () => {
      expect(plus.weekendFormats[0].sessions).toEqual([
        { id: 'quali', type: 'qualify', minutes: 20 },
        { id: 'race', type: 'race', laps: 25 },
        { id: 'endurance', type: 'race', minutes: 50 },
        { id: 'grand-prix', type: 'race', distance: 125 },
      ]);
    });

    // Found in review: an override replaces the format's length outright, so
    // one left alone raced the filler exactly as long as its base.
    it('runs a round\'s own race length longer too, leaving other sessions alone', () => {
      expect(plus.rounds[0].sessionLengths).toEqual([
        { session: 'race', distance: 50 }, { session: 'quali', minutes: 20 },
      ]);
    });

    it('pays more and charges more, everywhere a sum is stated', () => {
      expect(plus.prizes).toEqual({ positions: [3000, 1500], standings: [15_000] });
      expect(plus.entries[0].prizes).toEqual({ positions: [1500], standings: [6000] });
      expect(plus.entryFee).toBe(1500);
      expect(plus.rounds[0].entryFee).toBe(300);
    });

    it('fields a stronger grid', () => {
      expect(plus.grid).toEqual({ strength: 5, aggression: 5 });
    });

    it('adds nothing its base does not state', () => {
      const bare = filler({ ...BASE, entryFee: undefined, prizes: undefined, grid: undefined }, 1, '');

      expect(bare.prizes).toBeUndefined();
      // An offset rather than a level, so a base that states none is still
      // raced a step stronger.
      expect(bare.grid).toEqual({ strength: 2 });
    });
  });

  describe('seat', () => {
    it('seats a named driver with a team', () => {
      expect(seat('rbr-1', 'red-bull', 'Max Verstappen', 'Netherlands', 'NED')).toEqual({
        id: 'rbr-1',
        team: 'red-bull',
        driver: { name: 'Max Verstappen', nationality: 'Netherlands', nationCode: 'NED' },
      });
    });

    it('gives the driver an offset of their own only when one is stated', () => {
      expect(seat('rbr-1', 'red-bull', 'Max Verstappen', 'Netherlands', 'NED', 4).strength).toBe(4);
      expect(seat('rbr-2', 'red-bull', 'Sergio Perez', 'Mexico', 'MEX')).not.toHaveProperty('strength');
    });
  });
});
