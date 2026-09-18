import { describe, expect, it } from '@jest/globals';

import { SERIES_FORMAT_VERSION } from '../../../shared/constants/index.ts';
import {
  Climate, ContentSource, Discipline, DLCPack, ModMaker,
} from '../../../shared/types/index.ts';
import type {
  Championship, Eligibility, SeriesSession, WeekendFormat,
} from '../../../shared/types/index.ts';
import { resolveCatalogue, SHIPPED_CATALOGUE } from '../../../shared/utils/car-classes/index.ts';
import {
  climateOf, eligibleCars, minModelsOf, requirementsOf, roundRaceId, seatSkin, validateFormat,
  validateMoney,
} from '../utils.ts';
import { makeContent } from './fixtures.ts';

/**
 * A championship with one format, which the tests below replace.
 * @param sessions The sessions the format runs
 * @returns The championship and the format to check, which is its only one
 */
const withSessions = (
  sessions: SeriesSession[],
): { series: Championship; format: WeekendFormat } => {
  const format: WeekendFormat = { id: 'standard', name: 'Race weekend', sessions };
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
    weekendFormats: [format],
    defaultWeekendFormat: 'standard',
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
    // a weekend of either locked both championships in the editor.
    it('never composes one id for two different pairs', () => {
      expect(roundRaceId('gt3', 'sprint-r1')).not.toBe(roundRaceId('gt3-sprint', 'r1'));
      expect(roundRaceId('a/b', 'c')).not.toBe(roundRaceId('a', 'b/c'));
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
      // Only a qualifying leaves a classification behind for the next session
      // to follow; advanceWeekend records one for nothing else.
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

  describe('minModelsOf', () => {
    /**
     * The catalogue of a user whose spec holds the given cars.
     * @param cars The cars they put in it
     * @returns The resolved catalogue
     */
    const holding = (cars: string[]) => resolveCatalogue({
      version: 1,
      classes: [{ id: 'user-class', name: 'Hillclimb' }],
      specs: [{ id: 'user-spec', name: 'Hillclimb (2020s)', class: 'user-class' }],
      cars: Object.fromEntries(cars.map((car) => [car, ['user-spec']])),
    });

    it('needs every car a car list names', () => {
      expect(minModelsOf({ kind: 'cars', cars: ['a', 'b'] }, SHIPPED_CATALOGUE)).toBe(2);
    });

    it('needs no more of a spec than its grid holds', () => {
      expect(minModelsOf({ kind: 'spec', spec: 'user-spec', minModels: 5 }, holding(['a', 'b']))).toBe(2);
    });

    // A spec the user emptied, or one this catalogue lacks, would otherwise be
    // satisfied by owning nothing and read as raceable.
    it('needs at least one car of a spec with nobody on its grid', () => {
      expect(minModelsOf({ kind: 'spec', spec: 'user-spec' }, holding([]))).toBe(1);
      expect(minModelsOf({ kind: 'spec', spec: 'ghost-spec' }, SHIPPED_CATALOGUE)).toBe(1);
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

    it('accepts a free championship, which is not the same as charging nothing', () => {
      expect(moneyCodes({ entryFee: 0 })).toEqual([]);
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
      const requires = requirementsOf(racing({ kind: 'spec', spec: 'user-spec', minModels: 3 }), catalogue);

      expect(requires.packs).toEqual([]);
      expect(requires.widenedBy.packs).toEqual([DLCPack.READY_TO_RACE]);
      expect(requires.sources).toEqual([ContentSource.BASE]);
      expect(requires.pools).toEqual([{ minModels: 3, cars: expect.any(Array) }]);
      expect(requires.pools[0].cars).toHaveLength(4);
    });

    it('needs a source the spec cannot keep its floor without', () => {
      const catalogue = specOf(['abarth500', 'rss_formula_2000', 'rss_formula_2010']);
      const requires = requirementsOf(racing({ kind: 'spec', spec: 'user-spec', minModels: 2 }), catalogue);

      expect(requires.makers).toEqual([ModMaker.RSS]);
      expect(requires.widenedBy.makers).toEqual([]);
      expect(requires.sources).toContain(ContentSource.MOD);
    });

    it('needs a pack for the track a round races', () => {
      const requires = requirementsOf(racing({ kind: 'cars', cars: ['abarth500'] }, 'ks_brands_hatch'), SHIPPED_CATALOGUE);

      expect(requires.packs).toEqual([DLCPack.DREAM_PACK_3]);
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
          eligibility: [{ entry: 'main', eligibility: { kind: 'spec', spec: 'user-spec', minModels: 1 } }],
        }],
      };

      expect(requirementsOf(series, catalogue).pools).toHaveLength(1);
    });
  });
});
