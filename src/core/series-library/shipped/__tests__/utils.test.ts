import { describe, expect, it } from '@jest/globals';

import { SERIES_FORMAT_VERSION } from '../../../../shared/constants/index.ts';
import { CarSpec, Discipline, Weekday } from '../../../../shared/types/index.ts';
import type { Championship } from '../../../../shared/types/index.ts';
import {
  filler, reclassed, reclassedBy, seat,
} from '../utils.ts';

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
  eventFormats: [{
    id: 'event',
    name: 'Event',
    sessions: [
      { id: 'quali', type: 'qualify', minutes: 20 },
      { id: 'race', type: 'race', laps: 20 },
      { id: 'endurance', type: 'race', minutes: 40 },
      { id: 'grand-prix', type: 'race', distance: 100 },
    ],
  }],
  defaultEventFormat: 'event',
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

    // Found in review: copied over with the rest of the base, a stated day put
    // the filler on its base's day rather than on its own rung's.
    it('races on its own rung\'s day rather than the day its base states', () => {
      expect(filler({ ...BASE, raceWeekday: Weekday.SATURDAY }, 1, '').raceWeekday).toBeUndefined();
    });

    it('runs every race longer, in whatever it is measured in, and nothing else', () => {
      expect(plus.eventFormats[0].sessions).toEqual([
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

    it('races its base grid unchanged, the AI at the player strength on every rung', () => {
      expect(plus.grid).toEqual({ strength: 3, aggression: 5 });
    });

    it('adds nothing its base does not state', () => {
      const bare = filler({ ...BASE, entryFee: undefined, prizes: undefined, grid: undefined }, 1, '');

      expect(bare.prizes).toBeUndefined();
      expect(bare.grid).toBeUndefined();
    });
  });

  describe('reclassed', () => {
    const TWO: Championship = { ...BASE, entries: [BASE.entries[0], { ...BASE.entries[0], id: 'second' }] };
    const FSR = { kind: 'spec', spec: CarSpec.GT4_FSR } as const;

    it('puts every class on the cars it is given', () => {
      expect(reclassed(TWO, FSR).map((entry) => entry.eligibility)).toEqual([FSR, FSR]);
    });

    it('keeps the seats, rung and money of every class', () => {
      expect(reclassed(TWO, FSR)[0]).toEqual({ ...TWO.entries[0], eligibility: FSR });
    });

    it('leaves the championship it copies racing its own cars', () => {
      reclassed(TWO, FSR);

      expect(TWO.entries[0].eligibility).toEqual({ kind: 'cars', cars: ['tatuusfa1'] });
    });
  });

  describe('reclassedBy', () => {
    const TWO: Championship = { ...BASE, entries: [BASE.entries[0], { ...BASE.entries[0], id: 'second' }] };
    const FSR = { kind: 'spec', spec: CarSpec.GT4_FSR } as const;

    it('puts only the classes it names on other cars, the rest racing the original\'s', () => {
      expect(reclassedBy(TWO, { second: FSR }).map((entry) => entry.eligibility))
        .toEqual([{ kind: 'cars', cars: ['tatuusfa1'] }, FSR]);
    });

    it('keeps the seats, rung and money of a class it moves', () => {
      expect(reclassedBy(TWO, { main: FSR })[0]).toEqual({ ...TWO.entries[0], eligibility: FSR });
    });

    it('leaves the championship it copies racing its own cars', () => {
      reclassedBy(TWO, { main: FSR });

      expect(TWO.entries[0].eligibility).toEqual({ kind: 'cars', cars: ['tatuusfa1'] });
    });
  });

  describe('seat', () => {
    it('seats a named driver with a team', () => {
      expect(seat('rbr-1', 'red-bull', 'Max Verstappen', 'NLD')).toEqual({
        id: 'rbr-1',
        team: 'red-bull',
        driver: { name: 'Max Verstappen', nationCode: 'NLD' },
      });
    });

    it('gives the driver an offset of their own only when one is stated', () => {
      expect(seat('rbr-1', 'red-bull', 'Max Verstappen', 'NLD', 4).strength).toBe(4);
      expect(seat('rbr-2', 'red-bull', 'Sergio Perez', 'MEX')).not.toHaveProperty('strength');
    });
  });
});
