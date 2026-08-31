import { describe, expect, it } from '@jest/globals';

import { lap, makeSession, makeWeekend } from './fixtures.ts';
import type { GridEntry } from '../../../shared/types/index.ts';
import {
  bestLapOrder,
  dayOf,
  defaultOrder,
  gripAfter,
  lastQualifying,
  materialiseRace,
  randomFrom,
  seedFrom,
} from '../utils.ts';

/**
 * Builds a grid entry, defaulting everything but the fields being tested.
 * @param driver Driver name
 * @param aiLevel AI skill, omitted for the player
 * @returns A complete GridEntry
 */
const entry = (driver: string, aiLevel?: number): GridEntry => ({
  model: 'test_car',
  skin: 'skin_0',
  driver,
  nationality: '',
  nationCode: '',
  setup: '',
  ballast: 0,
  restrictor: 0,
  ...(aiLevel == null ? {} : { aiLevel, aiAggression: 30 }),
});

/**
 * A field of the given size, the player first and the AI slowing steadily.
 * @param size How many cars
 * @returns The grid
 */
const makeGrid = (size: number): GridEntry[] => Array.from(
  { length: size },
  (unused, index) => (index === 0 ? entry('Player') : entry(`AI ${index}`, 95 - index)),
);

describe('core/weekend/utils', () => {
  describe('dayOf', () => {
    it('reads the day a session names', () => {
      expect(dayOf({ type: 'race', day: 2 })).toBe(2);
    });

    it('puts a session with no day on the opening day', () => {
      expect(dayOf({ type: 'race' })).toBe(0);
    });
  });


  describe('gripAfter', () => {
    it('leaves an untouched track on the preset for the opening launch', () => {
      expect(gripAfter({ trackState: 'green' }, 0)).toBe(80);
      expect(gripAfter({ trackState: 'fast' }, 0)).toBe(95);
    });

    it('rubbers the track in as sessions are run', () => {
      const green = [0, 1, 2, 3].map((sessions) => gripAfter({ trackState: 'green' }, sessions));
      expect(green).toEqual([80, 83, 86, 88]);
    });

    it('never climbs past a fully rubbered track', () => {
      expect(gripAfter({ trackState: 'green' }, 500)).toBe(100);
    });

    it('leaves an already optimum track where it is', () => {
      expect(gripAfter({ trackState: 'optimum' }, 4)).toBe(100);
    });

    it('assumes the same default track state buildRaceIni does', () => {
      expect(gripAfter(undefined, 0)).toBe(gripAfter({ trackState: 'fast' }, 0));
    });

    it('builds on an explicit starting grip rather than the preset', () => {
      expect(gripAfter({ trackState: 'green', startGrip: 90 }, 0)).toBe(90);
      expect(gripAfter({ trackState: 'green', startGrip: 90 }, 1)).toBeGreaterThan(90);
    });
  });

  describe('seedFrom', () => {
    it('gives the same label the same seed', () => {
      expect(seedFrom('weekend:1')).toBe(seedFrom('weekend:1'));
    });

    it('gives different labels different seeds', () => {
      expect(seedFrom('weekend:1')).not.toBe(seedFrom('weekend:2'));
    });

    it('stays inside the generator range, empty string included', () => {
      [' ', '', 'weekend:0', 'a much longer label than any launch would carry'].forEach((label) => {
        expect(seedFrom(label)).toBeGreaterThanOrEqual(1);
        expect(seedFrom(label)).toBeLessThanOrEqual(2147483646);
      });
    });
  });

  describe('randomFrom', () => {
    it('yields the same sequence from the same seed', () => {
      const left = randomFrom(seedFrom('x'));
      const right = randomFrom(seedFrom('x'));

      expect([left(), left(), left()]).toEqual([right(), right(), right()]);
    });

    it('yields numbers from zero up to but not including one', () => {
      const random = randomFrom(seedFrom('y'));
      Array.from({ length: 200 }).forEach(() => {
        const value = random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      });
    });
  });

  describe('defaultOrder', () => {
    it('starts the player last, having earned nothing', () => {
      const order = defaultOrder(makeGrid(6), 'test:1');
      expect(order[order.length - 1]).toBe(0);
    });

    it('lines every car up exactly once', () => {
      expect([...defaultOrder(makeGrid(6), 'test:1')].sort((a, b) => a - b))
        .toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('reproduces the same grid from the same label', () => {
      expect(defaultOrder(makeGrid(8), 'test:1')).toEqual(defaultOrder(makeGrid(8), 'test:1'));
    });

    it('gives a different launch a different grid', () => {
      expect(defaultOrder(makeGrid(8), 'test:1')).not.toEqual(defaultOrder(makeGrid(8), 'test:2'));
    });

    it('keeps a clearly faster driver ahead of a clearly slower one', () => {
      const grid = [entry('Player'), entry('Quick', 99), entry('Slow', 60)];
      expect(defaultOrder(grid, 'test:1')).toEqual([1, 2, 0]);
    });

    it('copes with a field of nothing but the player', () => {
      expect(defaultOrder([entry('Player')], 'test:1')).toEqual([0]);
    });
  });

  describe('bestLapOrder', () => {
    it('classifies on the fastest valid lap', () => {
      const session = makeSession(2, 'Q', [lap(0, 62_000), lap(1, 60_000), lap(2, 61_000)]);
      expect(bestLapOrder(session, 3)).toEqual([1, 2, 0]);
    });

    it('ignores an invalidated lap rather than reading -1 as a pole time', () => {
      const session = makeSession(2, 'Q', [lap(0, -1), lap(0, 63_000), lap(1, 62_000)]);
      expect(bestLapOrder(session, 2)).toEqual([1, 0]);
    });

    it('puts a car that set no time behind every car that did', () => {
      const session = makeSession(2, 'Q', [lap(1, 60_000), lap(2, 61_000)]);
      expect(bestLapOrder(session, 3)).toEqual([1, 2, 0]);
    });

    it('keeps entry order among cars that all set nothing', () => {
      expect(bestLapOrder(makeSession(2, 'Q', []), 3)).toEqual([0, 1, 2]);
    });

    it('still returns a slot for every car, so the order can be indexed', () => {
      const session = makeSession(2, 'Q', [lap(0, 60_000)]);
      expect(bestLapOrder(session, 4)).toHaveLength(4);
    });
  });

  describe('lastQualifying', () => {
    it('finds the qualifying session among the others', () => {
      const raceOut = {
        track: 't',
        number_of_sessions: 3,
        players: [],
        sessions: [makeSession(1, 'P'), makeSession(2, 'Q'), makeSession(3, 'R')],
      };

      expect(lastQualifying(raceOut, 2)?.name).toBe('Q');
    });

    it('takes the last of several qualifying sessions', () => {
      const raceOut = {
        track: 't',
        number_of_sessions: 2,
        players: [],
        sessions: [makeSession(2, 'Q1'), makeSession(2, 'Q2')],
      };

      expect(lastQualifying(raceOut, 2)?.name).toBe('Q2');
    });

    it('returns null when the launch ran no qualifying', () => {
      const raceOut = {
        track: 't', number_of_sessions: 1, players: [], sessions: [makeSession(3, 'R')],
      };

      expect(lastQualifying(raceOut, 2)).toBeNull();
    });
  });

  describe('materialiseRace', () => {
    it('writes the grid out entry by entry rather than as a bulk description', () => {
      const grid = makeGrid(6);
      const race = materialiseRace(makeWeekend(), grid, { type: 'race' });

      expect(race.grid?.size).toBe(6);
      expect(race.grid?.opponents).toHaveLength(5);
      expect(race.grid?.opponents?.[0].driver).toBe('AI 1');
      expect(race.playerCar.driver).toBe('Player');
    });

    it('carries only the session this launch runs', () => {
      const race = materialiseRace(makeWeekend(), makeGrid(2), { type: 'practice' });
      expect(race.sessions).toEqual([{ type: 'practice' }]);
    });

    it('strips the session conditions once they are resolved onto the race', () => {
      // Otherwise a materialised launch carries conditions in two places and
      // buildRaceIni could read the wrong one.
      const race = materialiseRace(makeWeekend(), makeGrid(2), {
        type: 'race', conditions: { ambient: 11 },
      });

      expect(race.sessions).toEqual([{ type: 'race' }]);
      expect(race.conditions?.ambient).toBe(11);
    });

    it('leaves the weekend conditions alone when the session overrides nothing', () => {
      const race = materialiseRace(makeWeekend(), makeGrid(2), { type: 'practice' });
      expect(race.conditions?.startGrip).toBeUndefined();
      expect(race.conditions?.trackState).toBe('green');
    });

    it('applies the starting grip it is handed', () => {
      const race = materialiseRace(makeWeekend(), makeGrid(2), { type: 'race' }, 97);
      expect(race.conditions?.startGrip).toBe(97);
    });

    it('lets the session keep its own starting grip over the carried one', () => {
      const race = materialiseRace(makeWeekend(), makeGrid(2), {
        type: 'race', conditions: { startGrip: 62 },
      }, 97);

      expect(race.conditions?.startGrip).toBe(62);
    });

    it('does not mutate the weekend it was built from', () => {
      const weekend = makeWeekend();
      materialiseRace(weekend, makeGrid(6), { type: 'race' }, 97);

      expect(weekend.sessions).toHaveLength(4);
      expect(weekend.grid?.opponents).toBeUndefined();
      expect(weekend.conditions?.startGrip).toBeUndefined();
    });
  });
});
