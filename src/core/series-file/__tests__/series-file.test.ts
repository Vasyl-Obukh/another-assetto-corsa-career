import { describe, expect, it } from '@jest/globals';

import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { SHIPPED_SERIES } from '../../series-library/index.ts';
import { parseSeries, readSeries, writeSeries } from '../index.ts';

/**
 * A championship file with everything the parser insists on.
 * @param overrides What to change about it
 * @returns The value JSON.parse would have returned
 */
const raw = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  version: SERIES_FORMAT_VERSION,
  id: 'sunday-cup',
  name: 'Sunday Cup',
  teams: [{ id: 'privateer', name: 'Privateer', budget: 'privateer' }],
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: 'road', tier: 6 },
    seats: [{ id: 'main-1', team: 'privateer', driver: { name: 'Ada Marchetti' } }, { id: 'main-2' }],
    eligibility: { kind: 'cars', cars: ['ks_mazda_mx5_cup'] },
  }],
  rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' } }],
  weekendFormats: [{
    id: 'standard',
    name: 'Race weekend',
    sessions: [{ type: 'race', name: 'Race', laps: 8, day: 0 }],
  }],
  defaultWeekendFormat: 'standard',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
  defaultPointsSystem: 'race',
  ...overrides,
});

/**
 * The codes parsing a value reported.
 * @param value The value to parse
 * @returns One code per problem
 */
const codesFor = (value: unknown): string[] => (
  parseSeries(value, 'test.json').problems.map((problem) => problem.code)
);

describe('core/series-file', () => {
  describe('parseSeries', () => {
    it('reads a well-formed championship', () => {
      const { series, problems } = parseSeries(raw(), 'test.json');

      expect(problems).toEqual([]);
      expect(series?.id).toBe('sunday-cup');
    });

    it('refuses anything that is not an object', () => {
      expect(codesFor([1, 2, 3])).toEqual(['seriesFile.notAnObject']);
      expect(parseSeries('nope', 'test.json').series).toBeNull();
    });

    // This is the check that replaced the compiler for user files: a spec is a
    // key into SPEC_CARS, so a typo would resolve to undefined and read as a
    // class nobody owns rather than as a mistake.
    it('rejects a car spec that is not a real one', () => {
      const value = raw({
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          eligibility: { kind: 'spec', spec: 'gt3-2010' },
        }],
      });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
      expect(parseSeries(value, 'test.json').series).toBeNull();
    });

    it('accepts a car spec that is', () => {
      const value = raw({
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          eligibility: { kind: 'spec', spec: 'gt3-2010s' },
        }],
      });

      expect(codesFor(value)).toEqual([]);
    });

    it('rejects a discipline that is not a real one', () => {
      const value = raw({
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          ladder: { discipline: 'sportscars', tier: 3 },
        }],
      });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
    });

    it('rejects a session type that is not a real one', () => {
      const value = raw({
        weekendFormats: [{
          id: 'standard',
          name: 'Race weekend',
          sessions: [{ type: 'practise', minutes: 10 }],
        }],
      });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
    });

    // WeatherType is numeric, so TypeScript gives it a reverse mapping and
    // Object.values holds the names too - a bare membership check would take
    // "HAIL" as a weather type.
    it('rejects a weather type given by name rather than by number', () => {
      const value = raw({
        rounds: [{
          id: 'magione',
          name: 'Magione',
          track: { id: 'magione' },
          conditions: { weatherType: 'HAIL' },
        }],
      });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
    });

    it('accepts the number that names the same weather', () => {
      const value = raw({
        rounds: [{
          id: 'magione',
          name: 'Magione',
          track: { id: 'magione' },
          conditions: { weatherType: 32, trackState: 'optimum' },
        }],
      });

      expect(codesFor(value)).toEqual([]);
    });

    it('rejects a weekend format with no id to be named by', () => {
      // A round names its format by id, so one without is a format nothing can
      // reach - and the file must not read as though it had been understood.
      const value = raw({
        weekendFormats: [{
          name: 'Race weekend',
          sessions: [{ type: 'race', name: 'Race', laps: 8, day: 0 }],
        }],
      });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
      expect(parseSeries(value, 'test.json').series).toBeNull();
    });

    it('rejects points that are not numbers, which would score as NaN', () => {
      const value = raw({
        pointsSystems: [{ id: 'race', name: 'Race points', positions: ['ten', 8] }],
      });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
    });

    it('rejects a points system that pays nothing readable at all', () => {
      expect(codesFor(raw({ pointsSystems: [{ id: 'race', name: 'Race points' }] })))
        .toEqual(['seriesFile.field.invalid']);
      expect(codesFor(raw({ pointsSystems: ['race'] }))).toEqual(['seriesFile.field.invalid']);
    });

    it('names every fault at once rather than the first', () => {
      const value = raw({ id: 42, name: null, rounds: 'nope' });

      expect(codesFor(value)).toHaveLength(3);
    });

    it('rejects a class entry with no seat list at all', () => {
      const { seats, ...entry } = (raw().entries as Record<string, unknown>[])[0];

      expect(codesFor(raw({ entries: [entry] }))).toEqual(['seriesFile.field.invalid']);
      expect(seats).toBeDefined();
    });

    it('rejects a seat with no id to be named by', () => {
      expect(codesFor(raw({
        entries: [{ ...(raw().entries as Record<string, unknown>[])[0], seats: [{ team: 'privateer' }] }],
      }))).toEqual(['seriesFile.field.invalid']);
    });

    // A driver with no name would race under a generated one while claiming to
    // hold somebody, which is worse than the seat holding nobody at all.
    it('rejects a seat holding a driver with no name', () => {
      expect(codesFor(raw({
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          seats: [{ id: 'main-1', driver: { nationCode: 'ITA' } }],
        }],
      }))).toEqual(['seriesFile.field.invalid']);
    });

    it('names every bad seat rather than the first', () => {
      expect(codesFor(raw({
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          seats: [{ team: 1 }, { id: 'ok' }, 'nope'],
        }],
      }))).toHaveLength(3);
    });

    it('rejects a team budget tier that is not a real one', () => {
      const value = raw({ teams: [{ id: 'works', name: 'Works', budget: 'enormous' }] });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
    });

    it('accepts a championship that names no teams at all', () => {
      const { teams, ...rest } = raw();

      expect(codesFor(rest)).toEqual([]);
      expect(teams).toBeDefined();
    });

    it('rejects prize money that is not numbers, which would pay NaN', () => {
      expect(codesFor(raw({ prizes: { positions: [1000, 'lots'] } })))
        .toEqual(['seriesFile.field.invalid']);
    });

    it('rejects an entry fee or a drop count that is not a number', () => {
      expect(codesFor(raw({ entryFee: 'free' }))).toEqual(['seriesFile.field.invalid']);
      expect(codesFor(raw({ drops: 'one' }))).toEqual(['seriesFile.field.invalid']);
      expect(codesFor(raw({ rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' }, entryFee: 'free' }] })))
        .toEqual(['seriesFile.field.invalid']);
    });
  });

  describe('readSeries', () => {
    it('reports text that is not JSON at all', () => {
      const { series, problems } = readSeries('{ not json', 'test.json');

      expect(series).toBeNull();
      expect(problems.map((problem) => problem.code)).toEqual(['seriesFile.unparseable']);
    });

    it('reads text that is', () => {
      expect(readSeries(JSON.stringify(raw()), 'test.json').series?.name).toBe('Sunday Cup');
    });
  });

  describe('writeSeries', () => {
    // What forking a shipped championship will do, so the two halves of the
    // library have to agree: a constant written out has to read back in.
    it.each(SHIPPED_SERIES.map((series) => [series.id, series] as const))(
      'writes %s back out as a file that reads as itself',
      (unused, series) => {
        const { series: read, problems } = readSeries(writeSeries(series), 'forked.json');

        expect(problems).toEqual([]);
        expect(read).toEqual(series);
      },
    );

    it('ends the file with a newline', () => {
      expect(writeSeries(SHIPPED_SERIES[0]).endsWith('\n')).toBe(true);
    });
  });
});
