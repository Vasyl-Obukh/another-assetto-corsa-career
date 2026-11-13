import { describe, expect, it } from '@jest/globals';

import type {
  CareerSeason, OwnedCar, SeasonEntry, SeasonEvent,
} from '../../../types/index.ts';
import {
  liveryName, ownedCar, racingIn, roundUnderWay, withCarIn,
} from '../garage.ts';

/**
 * A round of an entry, carrying only what these helpers read.
 * @param round Its id
 * @param status How it stands
 * @param sessions How many of its sessions have run
 * @returns The round
 */
const event = (round: string, status: SeasonEvent['status'] = 'scheduled', sessions = 0): SeasonEvent => (
  { round, status, sessions: Array.from({ length: sessions }, () => ({})) } as unknown as SeasonEvent
);

/**
 * A season entry racing a car, carrying only what these helpers read.
 * @param series Its id
 * @param over Whatever the test wants said differently
 * @returns The entry
 */
const entry = (series: string, over: Partial<SeasonEntry> = {}): SeasonEntry => ({
  series,
  championship: { name: series, rounds: [] },
  car: { model: 'test_car', source: 'owned' },
  events: [event('one')],
  ...over,
} as SeasonEntry);

/**
 * A season of entries.
 * @param entries What it entered
 * @returns The season
 */
const season = (entries: SeasonEntry[]): CareerSeason => ({
  index: 0, startDate: '2027-01-01', endDate: '2027-12-31', entries,
});

const OWNED: OwnedCar = {
  model: 'test_car', skin: 'red', paid: 40_000, listed: 40_000, bought: '2027-02-01',
};

describe('shared/utils/garage', () => {
  describe('ownedCar', () => {
    it('finds a car the career owns', () => {
      expect(ownedCar({ garage: [OWNED] }, 'test_car')).toBe(OWNED);
    });

    it('answers null for a car it does not', () => {
      expect(ownedCar({ garage: [OWNED] }, 'other_car')).toBeNull();
    });
  });

  describe('racingIn', () => {
    it('finds every entry still to race the car', () => {
      const cup = entry('cup');
      const other = entry('other', { car: { model: 'other_car', source: 'owned' } });

      expect(racingIn(season([cup, other]), 'test_car')).toEqual([cup]);
    });

    it('leaves out an entry withdrawn from, a car an invitation came with and one with nothing left to run', () => {
      const entries = [
        entry('withdrawn', { withdrawn: true }),
        entry('invited', { historic: true, car: { model: 'test_car' } }),
        entry('over', { events: [event('one', 'raced'), event('two', 'missed')] }),
      ];

      expect(racingIn(season(entries), 'test_car')).toEqual([]);
    });

    it('keeps a historic event entered at the player\'s own cost', () => {
      const paid = entry('paid', { historic: true, car: { model: 'test_car', source: 'rented' } });

      expect(racingIn(season([paid]), 'test_car')).toEqual([paid]);
    });

    it('keeps to the entries racing it owned, or rented, when asked', () => {
      const owned = entry('owned');
      const rented = entry('rented', { car: { model: 'test_car', source: 'rented' } });

      expect(racingIn(season([owned, rented]), 'test_car', 'rented')).toEqual([rented]);
      expect(racingIn(season([owned, rented]), 'test_car', 'owned')).toEqual([owned]);
    });
  });

  describe('withCarIn', () => {
    it('puts the entries given in the car, and leaves the rest', () => {
      const cup = entry('cup');
      const other = entry('other');
      const car = { model: 'test_car', skin: 'blue', source: 'rented' as const };
      const next = withCarIn(season([cup, other]), [cup], car);

      expect(next.entries.map((one) => one.car)).toEqual([car, other.car]);
    });

    it('hands back the same season when there is nothing to change', () => {
      const same = season([entry('cup')]);

      expect(withCarIn(same, [], { model: 'test_car' })).toBe(same);
    });
  });

  describe('roundUnderWay', () => {
    it('finds the round a session of which has run', () => {
      const cup = entry('cup', { events: [event('one', 'raced', 2), event('two', 'scheduled', 1)] });

      expect(roundUnderWay([entry('other'), cup])).toEqual({ entry: cup, event: cup.events[1] });
    });

    it('answers null where every round is still to start or over', () => {
      expect(roundUnderWay([entry('cup', { events: [event('one', 'raced', 2), event('two')] })])).toBeNull();
    });
  });

  describe('liveryName', () => {
    const car = {
      skins: [{
        id: 'red', name: 'Rosso Corsa', driver: null, team: null, number: null, country: null,
      }],
    };

    it("is the livery's own name", () => {
      expect(liveryName(car, 'red')).toBe('Rosso Corsa');
    });

    it('falls back to the folder ID for a livery, or a car, the install does not have', () => {
      expect(liveryName(car, 'blue')).toBe('blue');
      expect(liveryName(null, 'red')).toBe('red');
    });

    it('is undefined for no livery', () => {
      expect(liveryName(car, undefined)).toBeUndefined();
    });
  });
});
