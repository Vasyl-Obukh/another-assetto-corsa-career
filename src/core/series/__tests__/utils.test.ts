import { describe, expect, it } from '@jest/globals';

import {
  DRIVER_AGGRESSION_SPREAD, DRIVER_STRENGTH_SPREAD, MAX_GRID_OFFSET, SERIES_FORMAT_VERSION,
} from '../../../shared/constants/index.ts';
import {
  Climate, ContentSource, Discipline, DLCPack, Hemisphere, ModDistributor, ModMaker, Weekday,
} from '../../../shared/types/index.ts';
import type {
  Championship, Eligibility, EventFormat, SeriesSession,
} from '../../../shared/types/index.ts';
import { resolveCatalogue, SHIPPED_CATALOGUE } from '../../../shared/utils/car-classes/index.ts';
import {
  aiSeats, baseRaceId, classOffset, climateOf, eligibleCars, hemisphereOf, lapsFor,
  nationOf, raceLengths, raceWeekdayOf, regulatedOnly, requirementsOf, roundRaceId, roundSessions, runRaceId, seatDraw,
  seatSkin,
  validateFormat, validateLength, validateMoney, validateOffsets, withDistancesInLaps,
} from '../utils.ts';
import { makeContent } from './fixtures.ts';

/**
 * A championship with one format, which the tests below replace.
 * @param sessions The sessions the format runs
 * @returns The championship and the format to check, which is its only one
 */
const withSessions = (
  sessions: SeriesSession[],
): { series: Championship; format: EventFormat } => {
  const format: EventFormat = { id: 'standard', name: 'Standard', sessions };
  const series: Championship = {
    version: SERIES_FORMAT_VERSION,
    id: 'test-cup',
    name: 'Test Cup',
    entries: [{
      id: 'main',
      name: 'Main',
      ladder: { discipline: Discipline.ROAD, tier: 6 },
      seats: Array.from({ length: 8 }, (unused, at) => ({ id: `main-${at + 1}` })),
      eligibility: { kind: 'cars', cars: ['test_car'] },
    }],
    rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' } }],
    eventFormats: [format],
    defaultEventFormat: 'standard',
    pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
    defaultPointsSystem: 'race',
  };

  return { series, format };
};

/**
 * The codes checking a format produced.
 * @param sessions The sessions the format runs
 * @returns One code per problem
 */
const codesFor = (sessions: SeriesSession[]): string[] => {
  const { series, format } = withSessions(sessions);

  return validateFormat(series, format).map((problem) => problem.code);
};

describe('core/series/utils', () => {
  describe('roundRaceId', () => {
    it('composes the id the race a round lowers into carries', () => {
      expect(roundRaceId('lotus-cup', 'monza')).toBe('lotus-cup/monza');
    });

    // Guards a bug: joined with a hyphen, these two pairs composed one id, so
    // an event of either locked both championships in the editor.
    it('never composes one id for two different pairs', () => {
      expect(roundRaceId('gt3', 'sprint-r1')).not.toBe(roundRaceId('gt3-sprint', 'r1'));
      expect(roundRaceId('a/b', 'c')).not.toBe(roundRaceId('a', 'b/c'));
    });
  });

  describe('runRaceId', () => {
    it('names the run a career races a round in', () => {
      expect(runRaceId('lotus-cup', 'monza', { season: 2, edition: 1 })).toBe('lotus-cup/monza@2.1');
    });

    // Guards a bug: one id per round let last year's round, still in the race
    // store's slot, pass for this year's.
    it('tells apart the same round of two seasons and of two editions', () => {
      const first = runRaceId('cup', 'r1', { season: 0, edition: 0 });

      expect(runRaceId('cup', 'r1', { season: 1, edition: 0 })).not.toBe(first);
      expect(runRaceId('cup', 'r1', { season: 0, edition: 1 })).not.toBe(first);
    });
  });

  describe('baseRaceId', () => {
    it('recovers the round id a run was composed from', () => {
      expect(baseRaceId(runRaceId('lotus-cup', 'monza', { season: 3, edition: 2 }))).toBe(roundRaceId('lotus-cup', 'monza'));
    });

    it('leaves a round id with no run as it is', () => {
      expect(baseRaceId('lotus-cup/monza')).toBe('lotus-cup/monza');
    });

    it('splits cleanly where an id holds the separator itself', () => {
      const id = roundRaceId('a@b', 'c@d');

      expect(baseRaceId(runRaceId('a@b', 'c@d', { season: 0, edition: 0 }))).toBe(id);
    });
  });

  describe('climateOf', () => {
    it('answers null for a championship that authors its weather', () => {
      const { series } = withSessions([{ type: 'race', laps: 5 }]);

      expect(climateOf(series, { ...series.rounds[0], climate: Climate.ARID })).toBeNull();
    });

    it('takes the round climate over the championship default', () => {
      const { series } = withSessions([{ type: 'race', laps: 5 }]);
      const generated = { ...series, generatedWeather: { climate: Climate.OCEANIC } };

      expect(climateOf(generated, { ...series.rounds[0], climate: Climate.ARID }))
        .toBe(Climate.ARID);
    });

    it('falls back to the championship climate for a round naming none', () => {
      const { series } = withSessions([{ type: 'race', laps: 5 }]);
      const generated = { ...series, generatedWeather: { climate: Climate.OCEANIC } };

      expect(climateOf(generated, series.rounds[0])).toBe(Climate.OCEANIC);
    });
  });

  describe('hemisphereOf', () => {
    it('takes the round hemisphere over the championship default', () => {
      const { series } = withSessions([{ type: 'race', laps: 5 }]);
      const generated = {
        ...series,
        generatedWeather: { climate: Climate.OCEANIC, hemisphere: Hemisphere.NORTH },
      };

      expect(hemisphereOf(generated, { ...series.rounds[0], hemisphere: Hemisphere.SOUTH }))
        .toBe(Hemisphere.SOUTH);
    });

    it('falls back to the championship hemisphere for a round naming none', () => {
      const { series } = withSessions([{ type: 'race', laps: 5 }]);
      const generated = {
        ...series,
        generatedWeather: { climate: Climate.OCEANIC, hemisphere: Hemisphere.SOUTH },
      };

      expect(hemisphereOf(generated, series.rounds[0])).toBe(Hemisphere.SOUTH);
    });

    it('reads north where neither says', () => {
      const { series } = withSessions([{ type: 'race', laps: 5 }]);

      expect(hemisphereOf(series, series.rounds[0])).toBe(Hemisphere.NORTH);
    });
  });

  describe('raceWeekdayOf', () => {
    // getUTCDay's numbering, which is what the season calendar dates on.
    const SUNDAY = 0;
    const WEDNESDAY = 3;
    const FRIDAY = 5;
    const SATURDAY = 6;

    /**
     * The test championship with its one class at a tier.
     * @param tier Where its class enters the ladder
     * @param id The championship's id, which seeds a lower tier's day
     * @returns The championship
     */
    const atTier = (tier: number, id = 'test-cup'): Championship => {
      const { series } = withSessions([{ type: 'race', laps: 5 }]);

      return {
        ...series,
        id,
        entries: series.entries.map((entry) => ({ ...entry, ladder: { ...entry.ladder, tier } })),
      };
    };

    it('races the top tier on a Sunday and the next on a Saturday', () => {
      expect(raceWeekdayOf(atTier(1))).toBe(SUNDAY);
      expect(raceWeekdayOf(atTier(2))).toBe(SATURDAY);
    });

    it('races any lower tier on a weekday', () => {
      [3, 4, 5, 6].forEach((tier) => {
        const day = raceWeekdayOf(atTier(tier));

        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(FRIDAY);
      });
    });

    it('spreads lower-tier championships across the week by their ids', () => {
      const days = new Set(Array.from({ length: 20 }, (unused, at) => raceWeekdayOf(atTier(4, `cup-${at}`))));

      expect(days.size).toBeGreaterThan(1);
    });

    it('gives a championship the same day every time it is asked', () => {
      expect(raceWeekdayOf(atTier(4, 'lotus-cup'))).toBe(raceWeekdayOf(atTier(4, 'lotus-cup')));
    });

    it('goes by the highest class of a multi-class championship', () => {
      const series = atTier(3);
      const multi = {
        ...series,
        entries: [...series.entries, { ...series.entries[0], id: 'pro', ladder: { discipline: Discipline.ROAD, tier: 1 } }],
      };

      expect(raceWeekdayOf(multi)).toBe(SUNDAY);
    });

    it('takes the day a championship states over its tier', () => {
      expect(raceWeekdayOf({ ...atTier(1), raceWeekday: Weekday.WEDNESDAY })).toBe(WEDNESDAY);
    });
  });

  describe('validateFormat', () => {
    it('passes a knockout whose segments each follow the one before', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 18 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 15, inherit: { from: 'q1', top: 15 },
        },
        {
          id: 'q3', type: 'qualify', name: 'Q3', minutes: 12, inherit: { from: 'q2', top: 10 },
        },
        {
          type: 'race', name: 'Race', laps: 25, day: 1, inherit: { from: 'q3' },
        },
      ])).toEqual([]);
    });

    // The rule that refused this stood in for "never on a Friday", which means
    // nothing once a format's days are the event's own rather than dates.
    it('passes a race on the opening day of a three-day format', () => {
      expect(codesFor([
        { type: 'race', name: 'Race 1', laps: 10, day: 0 },
        { type: 'practice', name: 'Practice', minutes: 30, day: 1 },
        { type: 'race', name: 'Race 2', laps: 10, day: 2 },
      ])).toEqual([]);
    });

    it('passes a format that links nothing at all, as every older one does', () => {
      expect(codesFor([
        { type: 'qualify', name: 'Qualifying', minutes: 15 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual([]);
    });

    it('reports two sessions claiming one id, which a link could not tell apart', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        { id: 'q1', type: 'qualify', name: 'Q2', minutes: 12 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.id.duplicate']);
    });

    it('reports a link to a session the format does not have', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'sq3' },
        },
      ])).toEqual(['series.inherit.unknown']);
    });

    it('reports a link to a session that does not run first', () => {
      expect(codesFor([
        {
          id: 'q1', type: 'qualify', name: 'Q1', minutes: 15, inherit: { from: 'q2' },
        },
        { id: 'q2', type: 'qualify', name: 'Q2', minutes: 12 },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.notEarlier']);
    });

    it('reports a session that follows itself', () => {
      expect(codesFor([
        {
          id: 'q1', type: 'qualify', name: 'Q1', minutes: 15, inherit: { from: 'q1' },
        },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.notEarlier']);
    });

    it('reports a link to something that classifies nobody', () => {
      // Only a qualifying or a race leaves a classification behind for the next
      // session to follow; advanceEvent records one for nothing else.
      expect(codesFor([
        { id: 'fp1', type: 'practice', name: 'Practice', minutes: 30 },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'fp1' },
        },
      ])).toEqual(['series.inherit.notQualifying']);
    });

    it('reports a link that lets nobody through', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 12, inherit: { from: 'q1', top: 0 },
        },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.topInvalid']);
    });

    it('lets a race follow an earlier race, which is how a reverse grid is lined up', () => {
      expect(codesFor([
        { id: 'race-1', type: 'race', name: 'Race 1', laps: 10 },
        {
          type: 'race', name: 'Race 2', laps: 10, day: 1, inherit: { from: 'race-1', reverse: 8 },
        },
      ])).toEqual([]);
    });

    it('refuses a qualifying following a race, whose order means nothing to it', () => {
      expect(codesFor([
        { id: 'race-1', type: 'race', name: 'Race 1', laps: 10 },
        {
          type: 'qualify', name: 'Qualifying', minutes: 15, day: 1, inherit: { from: 'race-1' },
        },
        { type: 'race', name: 'Race 2', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.notQualifying']);
    });

    it('refuses a reverse too short to turn anything round', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Qualifying', minutes: 15 },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'q1', reverse: 1 },
        },
      ])).toEqual(['series.inherit.reverseInvalid']);
    });

    it('refuses a reverse on anything but a race, since nothing else lines up a grid', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 12, inherit: { from: 'q1', reverse: 4 },
        },
        { type: 'race', name: 'Race', laps: 10, day: 1 },
      ])).toEqual(['series.inherit.reverseInvalid']);
    });

    it('checks every session\'s length', () => {
      expect(codesFor([
        { type: 'qualify', name: 'Qualifying', distance: 20 },
        { type: 'race', name: 'Race', laps: 10, minutes: 30, day: 1 },
      ])).toEqual(['series.distance.onNonRace', 'series.length.conflict', 'series.race.timed']);
    });

    it('names every broken link rather than the first', () => {
      expect(codesFor([
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15 },
        {
          id: 'q2', type: 'qualify', name: 'Q2', minutes: 12, inherit: { from: 'nope', top: -1 },
        },
        {
          type: 'race', name: 'Race', laps: 10, day: 1, inherit: { from: 'also-nope' },
        },
      ])).toEqual([
        'series.inherit.unknown', 'series.inherit.topInvalid', 'series.inherit.unknown',
      ]);
    });
  });

  describe('regulatedOnly', () => {
    it('keeps the assists a series sets', () => {
      expect(regulatedOnly({
        fuelRate: 2, tyreWear: 1.5, slipstream: 3, tyreBlankets: false,
      })).toEqual({
        fuelRate: 2, tyreWear: 1.5, slipstream: 3, tyreBlankets: false,
      });
    });

    // Damage moved from the regulations to the player; a file written before
    // that may still name it, and it must not reach the race.
    it('drops damage and every other aid the player sets', () => {
      expect(regulatedOnly({ damage: 50, tyreWear: 2, abs: 0 })).toEqual({ tyreWear: 2 });
    });

    it('leaves out what the regulations do not state', () => {
      expect(regulatedOnly({ damage: 50 })).toEqual({});
    });

    it('is undefined when the regulations state no assists', () => {
      expect(regulatedOnly(undefined)).toBeUndefined();
    });
  });

  describe('seatSkin', () => {
    const content = makeContent();

    it('takes the livery when the resolved car has it installed', () => {
      expect(seatSkin(content, 'test_car', 'blue')).toBe('blue');
    });

    // A user pins a livery against their own copy of a mod, and the next
    // release of it may have renamed the folder. Falling back to automatic
    // assignment beats writing a SKIN key Assetto Corsa cannot resolve.
    it('gives up on a livery that car does not have', () => {
      expect(seatSkin(content, 'test_car', 'chartreuse')).toBeUndefined();
      expect(seatSkin(content, 'ghost_car', 'blue')).toBeUndefined();
    });

    it('asks for nothing when the seat pinned nothing', () => {
      expect(seatSkin(content, 'test_car', undefined)).toBeUndefined();
    });
  });

  describe('eligibleCars', () => {
    it('resolves a spec through the catalogue it is handed, skipping cars not installed', () => {
      const catalogue = resolveCatalogue({
        version: 1,
        classes: [{ id: 'user-class', name: 'Hillclimb' }],
        specs: [{ id: 'user-spec', name: 'Hillclimb (2020s)', class: 'user-class' }],
        cars: { oval_car: ['user-spec'], ghost_car: ['user-spec'], skinless_car: ['user-spec'] },
      });

      expect(eligibleCars({ kind: 'spec', spec: 'user-spec' }, makeContent(), catalogue).map((car) => car.id))
        .toEqual(['oval_car']);
    });
  });

  describe('validateMoney', () => {
    /**
     * The codes checking one championship's money produced.
     * @param overrides What to change about a clean championship
     * @returns One code per problem
     */
    const moneyCodes = (overrides: Partial<Championship>): string[] => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);

      return validateMoney({ ...series, ...overrides }).map((problem) => problem.code);
    };

    it('passes a championship that says nothing about money', () => {
      expect(moneyCodes({})).toEqual([]);
    });

    // A flat rate is a real way to pay a series, so only a negative figure is
    // refused - a table that does not descend is deliberately left alone.
    it('accepts a prize table that does not descend', () => {
      expect(moneyCodes({ prizes: { positions: [100, 100, 100] } })).toEqual([]);
    });

    it('refuses a negative prize, naming which table and position', () => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
      const [problem] = validateMoney({ ...series, prizes: { standings: [500, -1] } });

      expect(problem.code).toBe('series.prizes.invalid');
      expect(problem.params).toMatchObject({ table: 'championship', position: 2, amount: -1 });
    });

    it('refuses a negative entry fee on the championship', () => {
      expect(moneyCodes({ entryFee: -1 })).toEqual(['series.entryFee.invalid']);
    });

    // Round five of twenty is otherwise reported as a number with nowhere to
    // go and look for it.
    it('names the round a bad entry fee is on', () => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
      const rounds = [{ ...series.rounds[0], entryFee: -5 }];
      const [problem] = validateMoney({ ...series, rounds });

      expect(problem.code).toBe('series.entryFee.invalid');
      expect(problem.params).toMatchObject({ scope: 'round magione', amount: -5 });
    });

    it('names the class a bad entry fee is on', () => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
      const entries = [{ ...series.entries[0], entryFee: -5 }];
      const [problem] = validateMoney({ ...series, entries });

      expect(problem.code).toBe('series.entryFee.invalid');
      expect(problem.params).toMatchObject({ scope: `class ${series.entries[0].id}`, amount: -5 });
    });

    it('accepts a free championship, which is not the same as charging nothing', () => {
      expect(moneyCodes({ entryFee: 0 })).toEqual([]);
    });

    it('refuses a negative prize in a class\'s own tables, naming the class', () => {
      const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
      const entries = [{ ...series.entries[0], prizes: { positions: [100, -2] } }];
      const [problem] = validateMoney({ ...series, entries });

      expect(problem.code).toBe('series.prizes.invalid');
      expect(problem.params).toMatchObject({ table: 'class main round', position: 2, amount: -2 });
    });
  });

  describe('aiSeats', () => {
    const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
    const [entry] = series.entries;

    it('leaves the player\'s own class its every seat but the last', () => {
      const seats = aiSeats(entry, 'main').map((seat) => seat.id);

      expect(seats).toHaveLength(7);
      expect(seats).not.toContain('main-8');
    });

    it('leaves every other class all of its seats', () => {
      expect(aiSeats(entry, 'another')).toHaveLength(8);
    });
  });

  describe('classOffset', () => {
    const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);

    it('is nothing when no layer states an offset', () => {
      expect(classOffset(series, series.entries[0], series.rounds[0]))
        .toEqual({ strength: 0, aggression: 0 });
    });

    // Each layer says how far it moves the one below, so a class a tier down
    // and a round the specialists turn up for both count.
    it('adds the championship, the class and the round together', () => {
      const championship = { ...series, grid: { strength: 4, aggression: 10 } };
      const entry = { ...series.entries[0], grid: { strength: -3 } };
      const round = { ...series.rounds[0], grid: { strength: 2, aggression: -5 } };

      expect(classOffset(championship, entry, round)).toEqual({ strength: 3, aggression: 5 });
    });

    it('leaves the round out when there is none', () => {
      const championship = { ...series, grid: { strength: 4 } };

      expect(classOffset(championship, series.entries[0]).strength).toBe(4);
    });
  });

  describe('validateOffsets', () => {
    const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);

    it('passes offsets up to the limit either way', () => {
      expect(validateOffsets({
        ...series, grid: { strength: MAX_GRID_OFFSET, aggression: -MAX_GRID_OFFSET },
      })).toEqual([]);
    });

    // A typo of 90 for 9 would otherwise race every driver at the ceiling.
    it('refuses an offset beyond the limit, naming where it is', () => {
      const [problem] = validateOffsets({ ...series, grid: { strength: 90 } });

      expect(problem.code).toBe('series.grid.offsetOutOfRange');
      expect(problem.params).toMatchObject({ field: 'grid.strength', value: 90 });
    });

    it('checks every layer a championship states one on', () => {
      const entry = {
        ...series.entries[0],
        grid: { aggression: -40 },
        seats: [{ id: 'star', strength: 31 }, ...series.entries[0].seats],
      };
      const rounds = [{ ...series.rounds[0], grid: { strength: -35 } }];
      const fields = validateOffsets({ ...series, entries: [entry], rounds })
        .map((problem) => problem.params.field);

      expect(fields).toEqual([
        'entries[0].grid.aggression',
        'entries[0].seats[0].strength',
        'rounds[0].grid.strength',
      ]);
    });
  });

  describe('validateLength', () => {
    const where = { series: 'test-cup', format: 'standard', session: 'Race' };

    /**
     * The codes checking one length produced.
     * @param length The length to check
     * @param type What kind of session it measures
     * @returns One code per problem
     */
    const lengthCodes = (
      length: Pick<SeriesSession, 'laps' | 'minutes' | 'distance'>,
      type: SeriesSession['type'] = 'race',
    ): string[] => validateLength(length, type, where).map((problem) => problem.code);

    it('passes a single positive length in any unit', () => {
      expect(lengthCodes({ laps: 10 })).toEqual([]);
      expect(lengthCodes({ minutes: 30 }, 'practice')).toEqual([]);
      expect(lengthCodes({ distance: 305 })).toEqual([]);
    });

    // Driven: a race sent as three minutes and no laps let the player carry on
    // past the clock while the AI parked in the pits. AC times a race on a
    // server alone.
    it('refuses a race measured by the clock', () => {
      expect(lengthCodes({ minutes: 30 })).toEqual(['series.race.timed']);
    });

    it('passes a session stating no length, which runs AC\'s default', () => {
      expect(lengthCodes({})).toEqual([]);
    });

    // Two lengths would race whichever the lowering happened to read first.
    it('refuses two lengths at once', () => {
      expect(lengthCodes({ laps: 10, distance: 100 })).toEqual(['series.length.conflict']);
    });

    it('refuses a length that is not a positive number, naming its unit', () => {
      const problems = validateLength({ distance: 0 }, 'race', where);

      expect(problems.map((problem) => problem.code)).toEqual(['series.length.invalid']);
      expect(problems[0].params).toMatchObject({ unit: 'distance', length: 0 });
      expect(lengthCodes({ laps: Number.NaN })).toEqual(['series.length.invalid']);
    });

    it('refuses a distance on anything but a race', () => {
      expect(lengthCodes({ distance: 50 }, 'qualify')).toEqual(['series.distance.onNonRace']);
    });
  });

  describe('roundSessions', () => {
    const format: EventFormat = {
      id: 'event',
      name: 'Event',
      sessions: [
        { type: 'qualify', name: 'Qualifying', minutes: 15 },
        { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305 },
      ],
    };
    const round = { id: 'monaco', name: 'Monaco', track: { id: 'monaco' } };

    it('runs the format as it stands where the round replaces nothing', () => {
      expect(roundSessions(format, round)).toEqual(format.sessions);
    });

    // Merging would leave a race of 305 km and 78 laps, which validateLength
    // refuses and the lowering could not honour both of.
    it('replaces a session\'s length outright rather than merging with it', () => {
      const sessions = roundSessions(format, {
        ...round, sessionLengths: [{ session: 'grand-prix', laps: 78 }],
      });

      expect(sessions[1]).toEqual({
        id: 'grand-prix', type: 'race', name: 'Grand Prix', laps: 78, minutes: undefined, distance: undefined,
      });
      expect(sessions[0]).toBe(format.sessions[0]);
    });
  });

  describe('lapsFor', () => {
    it('takes the fewest laps that cover the distance', () => {
      expect(lapsFor(305, 5793)).toBe(53);
      expect(lapsFor(100, 5793)).toBe(18);
    });

    // 32.7 km over 1090 m comes to 30.000000000000004 in floating point, and a
    // distance that is a whole number of laps must not gain one for it.
    it('does not add a lap for a rounding error on an exact multiple', () => {
      expect(lapsFor(32.7, 1090)).toBe(30);
    });

    it('never runs a race of no laps', () => {
      expect(lapsFor(0.001, 5000)).toBe(1);
    });
  });

  describe('withDistancesInLaps', () => {
    const sessions: SeriesSession[] = [
      { type: 'qualify', name: 'Qualifying', minutes: 15 },
      { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305 },
    ];

    it('turns every distance into laps on the track\'s lap', () => {
      expect(withDistancesInLaps(sessions, 5793)).toEqual([
        sessions[0],
        {
          id: 'grand-prix', type: 'race', name: 'Grand Prix', laps: 53,
        },
      ]);
    });

    it('cannot run a distance where the lap length is not known', () => {
      expect(withDistancesInLaps(sessions, null)).toBeNull();
    });

    it('needs no lap length where nothing is a distance', () => {
      expect(withDistancesInLaps([sessions[0]], null)).toEqual([sessions[0]]);
    });
  });

  describe('raceLengths', () => {
    it('says each race\'s laps, and the distance they come from', () => {
      expect(raceLengths([
        { type: 'qualify', name: 'Qualifying', minutes: 15 },
        { id: 'sprint', type: 'race', name: 'Sprint', distance: 100 },
        { id: 'grand-prix', type: 'race', laps: 50 },
      ], 5793)).toEqual([
        { name: 'Sprint', laps: 18, distance: 100 },
        { name: null, laps: 50 },
      ]);
    });

    it('has no laps for a distance where the lap length is not known', () => {
      expect(raceLengths([{ type: 'race', name: 'Race', distance: 100 }], null))
        .toEqual([{ name: 'Race', laps: null, distance: 100 }]);
    });

    it('leaves out a race run to the clock, which has no lap count to show', () => {
      expect(raceLengths([{ type: 'race', name: 'Race', minutes: 30 }], 5000)).toEqual([]);
    });
  });

  describe('requirementsOf', () => {
    /**
     * A catalogue whose one spec holds the given cars.
     * @param cars The cars on its grid
     * @returns The resolved catalogue
     */
    const specOf = (cars: string[]) => resolveCatalogue({
      version: 1,
      classes: [{ id: 'user-class', name: 'Mixed' }],
      specs: [{ id: 'user-spec', name: 'Mixed', class: 'user-class' }],
      cars: Object.fromEntries(cars.map((car) => [car, ['user-spec']])),
    });

    /**
     * A championship racing one class at one round.
     * @param eligibility What the class may field
     * @param track The round's track
     * @returns The championship
     */
    const racing = (eligibility: Eligibility, track = 'magione'): Championship => ({
      ...withSessions([]).series,
      entries: [{ ...withSessions([]).series.entries[0], eligibility }],
      rounds: [{ id: 'r1', name: 'Round 1', track: { id: track } }],
    });

    it('needs every source a car list names', () => {
      const requires = requirementsOf(
        racing({ kind: 'cars', cars: ['abarth500', 'ks_audi_r8_lms_2016', 'rss_formula_2010'] }),
        SHIPPED_CATALOGUE,
      );

      expect(requires.packs).toEqual([DLCPack.READY_TO_RACE]);
      expect(requires.makers).toEqual([ModMaker.RSS]);
      expect(requires.sources).toEqual(expect.arrayContaining([ContentSource.DLC, ContentSource.MOD]));
      expect(requires.pools).toEqual([]);
    });

    it('records what a spec only reaches as widening it rather than as needed', () => {
      const catalogue = specOf(['abarth500', 'abarth500_s1', 'bmw_1m', 'ks_audi_r8_lms_2016']);
      const requires = requirementsOf(racing({ kind: 'spec', spec: 'user-spec' }), catalogue);

      expect(requires.packs).toEqual([]);
      expect(requires.widenedBy.packs).toEqual([DLCPack.READY_TO_RACE]);
      expect(requires.sources).toEqual([ContentSource.BASE]);
      expect(requires.pools).toEqual([{ cars: expect.any(Array) }]);
      expect(requires.pools[0].cars).toHaveLength(4);
    });

    it('needs a source the spec cannot be raced without', () => {
      const catalogue = specOf(['rss_formula_2000', 'rss_formula_2010']);
      const requires = requirementsOf(racing({ kind: 'spec', spec: 'user-spec' }), catalogue);

      expect(requires.makers).toEqual([ModMaker.RSS]);
      expect(requires.widenedBy.makers).toEqual([]);
      expect(requires.sources).toContain(ContentSource.MOD);
    });

    it('records the pack a round races in against that round rather than as needed', () => {
      const requires = requirementsOf(racing({ kind: 'cars', cars: ['abarth500'] }, 'ks_brands_hatch'), SHIPPED_CATALOGUE);

      expect(requires.packs).toEqual([]);
      expect(requires.rounds.packs).toEqual([DLCPack.DREAM_PACK_3]);
    });

    // A mod nobody is credited with has no maker, so this is the only trace of
    // it - the settings card read "Needs: Base game" without it.
    it('keeps an uncredited mod a car list names as a needed source', () => {
      const requires = requirementsOf(racing({ kind: 'cars', cars: ['someones_mod_car'] }), SHIPPED_CATALOGUE);

      expect(requires.makers).toEqual([]);
      expect(requires.sources).toContain(ContentSource.MOD);
    });

    it('pools a spec a round swaps in', () => {
      const catalogue = specOf(['abarth500', 'bmw_1m']);
      const base = racing({ kind: 'cars', cars: ['abarth500'] });
      const series: Championship = {
        ...base,
        rounds: [{
          ...base.rounds[0],
          eligibility: [{ entry: 'main', eligibility: { kind: 'spec', spec: 'user-spec' } }],
        }],
      };

      expect(requirementsOf(series, catalogue).pools).toHaveLength(1);
    });

    // A car LFM redistributes credits no mod team, so without its own list the
    // championship read as needing an uncredited mod.
    it('needs the redistributor of every car a car list names', () => {
      const requires = requirementsOf(racing({ kind: 'cars', cars: ['alpine_a424'] }), SHIPPED_CATALOGUE);

      expect(requires.distributors).toEqual([ModDistributor.LFM]);
      expect(requires.sources).toContain(ContentSource.MOD);
    });

    it('records a redistributor a spec only reaches as widening it', () => {
      const catalogue = specOf(['abarth500', 'bmw_1m', 'alpine_a424']);
      const requires = requirementsOf(racing({ kind: 'spec', spec: 'user-spec' }), catalogue);

      expect(requires.distributors).toEqual([]);
      expect(requires.widenedBy.distributors).toEqual([ModDistributor.LFM]);
      expect(requires.pools[0].cars).toContainEqual({ pack: null, maker: null, distributor: ModDistributor.LFM });
    });

    it('needs a redistributor the spec cannot be raced without', () => {
      const catalogue = specOf(['alpine_a424', 'bmw_m_hybrid_v8_2023']);
      const requires = requirementsOf(racing({ kind: 'spec', spec: 'user-spec' }), catalogue);

      expect(requires.distributors).toEqual([ModDistributor.LFM]);
      expect(requires.widenedBy.distributors).toEqual([]);
    });
  });

  describe('seatDraw', () => {
    const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
    const [seat] = series.entries[0].seats;

    it('draws offsets inside the spread a season allows', () => {
      series.entries[0].seats.forEach((one) => {
        const { strength, aggression } = seatDraw(series, one, 'career:1');

        expect(Math.abs(strength)).toBeLessThanOrEqual(DRIVER_STRENGTH_SPREAD);
        expect(Math.abs(aggression)).toBeLessThanOrEqual(DRIVER_AGGRESSION_SPREAD);
      });
    });

    it('draws the same offsets for the same seat and season every time', () => {
      expect(seatDraw(series, seat, 'career:1')).toEqual(seatDraw(series, seat, 'career:1'));
    });

    it('draws a season of its own for each salt', () => {
      const draws = Array.from({ length: 8 }, (unused, at) => seatDraw(series, seat, `career:${at}`));

      expect(new Set(draws.map((draw) => JSON.stringify(draw))).size).toBeGreaterThan(1);
    });

    // Both are drawn either way, so stating one leaves the other where it was.
    it('keeps an offset the seat states, and draws the other as it would have', () => {
      const drawn = seatDraw(series, seat, 'career:1');

      expect(seatDraw(series, { ...seat, strength: 7 }, 'career:1')).toEqual({ ...drawn, strength: 7 });
      expect(seatDraw(series, { ...seat, aggression: -9 }, 'career:1')).toEqual({ ...drawn, aggression: -9 });
    });
  });

  describe('nationOf', () => {
    const { series } = withSessions([{ type: 'race', name: 'Race', laps: 8 }]);
    const teamed: Championship = { ...series, teams: [{ id: 'works', name: 'Works', nationCode: 'DEU' }] };

    it('names the driver\'s own nation from its code, in English', () => {
      expect(nationOf(teamed, { id: 's', team: 'works', driver: { name: 'A', nationCode: 'ITA' } }))
        .toEqual({ nationCode: 'ITA', nationality: 'Italy' });
    });

    it('falls back to the team\'s nation for a driver who names none', () => {
      expect(nationOf(teamed, { id: 's', team: 'works', driver: { name: 'A' } }))
        .toEqual({ nationCode: 'DEU', nationality: 'Germany' });
    });

    it('says nothing when neither the driver nor a team names a nation', () => {
      expect(nationOf(teamed, { id: 's', driver: { name: 'A' } })).toEqual({});
      expect(nationOf(series, { id: 's', team: 'works' })).toEqual({});
    });
  });
});
