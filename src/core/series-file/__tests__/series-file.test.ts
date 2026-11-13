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
  eventFormats: [{
    id: 'standard',
    name: 'Standard',
    sessions: [{ type: 'race', name: 'Race', laps: 8, day: 0 }],
  }],
  defaultEventFormat: 'standard',
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

/**
 * The fields parsing a value reported as invalid.
 * @param value The value to parse
 * @returns One dotted path per problem that names one
 */
const fieldsFor = (value: unknown): string[] => parseSeries(value, 'test.json').problems
  .map((problem) => (problem.params as { field?: string }).field)
  .filter((field): field is string => field !== undefined);

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

    // A spec may be one the user made, so whether it resolves is validateSeries'
    // question against the catalogue it is handed, not a closed set here.
    it('leaves a spec it cannot resolve to validateSeries', () => {
      const value = raw({
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          eligibility: { kind: 'spec', spec: 'gt3-2010' },
        }],
      });

      expect(codesFor(value)).toEqual([]);
    });

    it('rejects a spec that is not a string at all', () => {
      const value = raw({
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          eligibility: { kind: 'spec', spec: 42 },
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
        eventFormats: [{
          id: 'standard',
          name: 'Standard',
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

    it('accepts generated weather and a round climate that are real ones', () => {
      const { series, problems } = parseSeries(raw({
        generatedWeather: { climate: 'temperate' },
        rounds: [{
          id: 'magione', name: 'Magione', track: { id: 'magione' }, climate: 'arid',
        }],
      }), 'test.json');

      expect(problems).toEqual([]);
      expect(series?.generatedWeather?.climate).toBe('temperate');
      expect(series?.rounds[0].climate).toBe('arid');
    });

    it('rejects a championship climate that is not a real one', () => {
      expect(codesFor(raw({ generatedWeather: { climate: 'tropical' } })))
        .toEqual(['seriesFile.field.invalid']);
    });

    it('rejects generated weather that is not an object', () => {
      expect(codesFor(raw({ generatedWeather: 'temperate' })))
        .toEqual(['seriesFile.field.invalid']);
    });

    it('accepts a hemisphere on the championship and on a round', () => {
      const { series, problems } = parseSeries(raw({
        generatedWeather: { climate: 'temperate', hemisphere: 'south' },
        rounds: [{
          id: 'magione', name: 'Magione', track: { id: 'magione' }, hemisphere: 'north',
        }],
      }), 'test.json');

      expect(problems).toEqual([]);
      expect(series?.generatedWeather?.hemisphere).toBe('south');
      expect(series?.rounds[0].hemisphere).toBe('north');
    });

    it('rejects a championship hemisphere that is not a real one', () => {
      expect(codesFor(raw({ generatedWeather: { climate: 'temperate', hemisphere: 'east' } })))
        .toEqual(['seriesFile.field.invalid']);
    });

    it('rejects a round hemisphere that is not a real one', () => {
      const value = raw({
        rounds: [{
          id: 'magione', name: 'Magione', track: { id: 'magione' }, hemisphere: 'South',
        }],
      });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
    });

    it('rejects a round climate that is not a real one', () => {
      const value = raw({
        rounds: [{
          id: 'magione', name: 'Magione', track: { id: 'magione' }, climate: 'Temperate',
        }],
      });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
    });

    it('rejects an event format with no id to be named by', () => {
      // A round names its format by id, so one without is a format nothing can
      // reach - and the file must not read as though it had been understood.
      const value = raw({
        eventFormats: [{
          name: 'Standard',
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

    it('reads AI offsets on the championship, a class, a round and a seat', () => {
      const [entry] = raw().entries as Record<string, unknown>[];

      expect(codesFor(raw({
        grid: { strength: 4, aggression: -5 },
        entries: [{
          ...entry,
          grid: { strength: -2 },
          seats: [{ id: 'main-1', strength: 3, aggression: 10 }, { id: 'main-2' }],
        }],
        rounds: [{
          id: 'magione', name: 'Magione', track: { id: 'magione' }, grid: { aggression: 5 },
        }],
      }))).toEqual([]);
    });

    it('rejects an offset that is not a number, wherever it sits', () => {
      const [entry] = raw().entries as Record<string, unknown>[];

      expect(codesFor(raw({
        grid: { strength: 'fast' },
        entries: [{ ...entry, grid: { aggression: null } }],
        rounds: [{
          id: 'magione', name: 'Magione', track: { id: 'magione' }, grid: 'hard',
        }],
      }))).toHaveLength(3);
    });

    // Read as nothing, an absolute level would race at the difficulty in
    // settings while claiming a field of its own - so the file is refused.
    it('rejects the absolute AI levels championships were written with before', () => {
      const [entry] = raw().entries as Record<string, unknown>[];

      expect(codesFor(raw({
        grid: { aiLevel: 95, aiLevelMin: 85, aiAggression: 30 },
        entries: [{ ...entry, seats: [{ id: 'main-1', aiLevel: 99 }, { id: 'main-2' }] }],
      }))).toHaveLength(4);
    });

    // Fixed: a grid was only read once the prizes or the fee beside it had
    // passed, so a file wrong in both named one fault at a time.
    it('names a bad grid beside a bad fee or bad prizes', () => {
      const [entry] = raw().entries as Record<string, unknown>[];

      expect(codesFor(raw({
        entries: [{ ...entry, prizes: 'lots', grid: { aiLevel: 95 } }],
        rounds: [{
          id: 'magione', name: 'Magione', track: { id: 'magione' }, entryFee: 'free', grid: { aiLevel: 95 },
        }],
      }))).toHaveLength(4);
    });

    it('rejects a team budget tier that is not a real one', () => {
      const value = raw({ teams: [{ id: 'works', name: 'Works', budget: 'enormous' }] });

      expect(codesFor(value)).toEqual(['seriesFile.field.invalid']);
    });

    it('reads a nation Assetto Corsa has a flag for, on a driver and on a team', () => {
      const value = raw({
        teams: [{ id: 'privateer', name: 'Privateer', nationCode: 'SCT' }],
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          seats: [{ id: 'main-1', driver: { name: 'Ada Marchetti', nationCode: 'ITA' } }],
        }],
      });

      expect(codesFor(value)).toEqual([]);
    });

    // A sports code is not one of AC's flags, and races flagless with nothing said.
    it('rejects a nation Assetto Corsa has no flag for', () => {
      const value = raw({
        teams: [{ id: 'privateer', name: 'Privateer', nationCode: 'GER' }],
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          seats: [{ id: 'main-1', driver: { name: 'Ada Marchetti', nationCode: 'NED' } }],
        }],
      });

      expect(fieldsFor(value)).toEqual(expect.arrayContaining([
        'teams[0].nationCode', 'entries[0].seats[0].driver.nationCode',
      ]));
    });

    // Looked up from the code now, so one left in a file would round-trip
    // straight back out of writeSeries.
    it('rejects a nationality written out, on a driver and on a team', () => {
      const value = raw({
        teams: [{ id: 'privateer', name: 'Privateer', nationality: 'Italy' }],
        entries: [{
          ...(raw().entries as Record<string, unknown>[])[0],
          seats: [{ id: 'main-1', driver: { name: 'Ada Marchetti', nationality: 'Italy' } }],
        }],
      });

      expect(fieldsFor(value)).toEqual(expect.arrayContaining([
        'teams[0].nationality', 'entries[0].seats[0].driver.nationality',
      ]));
    });

    // A fixed bug: the nation was only checked once everything before it read.
    it('names a team\'s bad nation beside its other faults', () => {
      const value = raw({ teams: [{ id: '', name: 'Privateer', nationCode: 'GER' }] });

      expect(fieldsFor(value)).toEqual(['teams[0].id', 'teams[0].nationCode']);
    });

    it('reads where a race starts the player, by name or by slot', () => {
      /**
       * The fixture with its race starting the player where it says.
       * @param start Where the race starts the player
       * @returns The value JSON.parse would have returned
       */
      const withStart = (start: unknown): Record<string, unknown> => raw({
        eventFormats: [{
          id: 'standard',
          name: 'Standard',
          sessions: [{
            type: 'race', name: 'Race', laps: 8, day: 0, start,
          }],
        }],
      });

      ['last', 'pole', 'random', 3].forEach((start) => expect(codesFor(withStart(start))).toEqual([]));
      expect(fieldsFor(withStart('front'))).toEqual(['eventFormats[0].sessions[0].start']);
      expect(fieldsFor(withStart(true))).toEqual(['eventFormats[0].sessions[0].start']);
    });

    it('reads how a session runs and lines up its classes', () => {
      /**
       * The fixture with its one session saying how it treats classes.
       * @param classes How a qualifying runs them
       * @param classGrid How a race lines them up
       * @returns The value JSON.parse would have returned
       */
      const withClasses = (classes: unknown, classGrid: unknown): Record<string, unknown> => raw({
        eventFormats: [{
          id: 'standard',
          name: 'Standard',
          sessions: [{
            type: 'race', name: 'Race', laps: 8, day: 0, classes, classGrid,
          }],
        }],
      });

      expect(codesFor(withClasses('apart', 'mixed'))).toEqual([]);
      expect(codesFor(withClasses('together', 'byClass'))).toEqual([]);
      expect(fieldsFor(withClasses('separate', 'mixed'))).toEqual(['eventFormats[0].sessions[0].classes']);
      expect(fieldsFor(withClasses('apart', true))).toEqual(['eventFormats[0].sessions[0].classGrid']);
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

    it('reads a class paying its own prize money', () => {
      const entry = { ...(raw().entries as Record<string, unknown>[])[0], prizes: { positions: [500, 300] } };

      expect(codesFor(raw({ entries: [entry] }))).toEqual([]);
    });

    it('rejects a class\'s prize money that is not numbers', () => {
      const entry = { ...(raw().entries as Record<string, unknown>[])[0], prizes: { standings: ['lots'] } };

      expect(codesFor(raw({ entries: [entry] }))).toEqual(['seriesFile.field.invalid']);
    });

    it('reads the lengths a round replaces', () => {
      const round = {
        id: 'magione', name: 'Magione', track: { id: 'magione' }, sessionLengths: [{ session: 'race', laps: 12 }],
      };

      expect(codesFor(raw({ rounds: [round] }))).toEqual([]);
    });

    // Whether it names a real session, and states one length, is validateSeries'.
    // A bad item was once reported twice, as itself and as the whole list.
    it('rejects a round length that is not shaped like one, once', () => {
      const round = (sessionLengths: unknown) => ({
        id: 'magione', name: 'Magione', track: { id: 'magione' }, sessionLengths,
      });

      expect(codesFor(raw({ rounds: [round('twelve laps')] }))).toEqual(['seriesFile.field.invalid']);
      expect(codesFor(raw({ rounds: [round([{ laps: 12 }])] }))).toEqual(['seriesFile.field.invalid']);
      expect(codesFor(raw({ rounds: [round([{ session: 'race', distance: '305 km' }])] })))
        .toEqual(['seriesFile.field.invalid']);
    });

    it('reads the day of the week a championship races on', () => {
      const { series, problems } = parseSeries(raw({ raceWeekday: 'wednesday' }), 'test.json');

      expect(problems).toEqual([]);
      expect(series?.raceWeekday).toBe('wednesday');
    });

    it('rejects a race day that is not a day of the week', () => {
      expect(fieldsFor(raw({ raceWeekday: 'Wednesday' }))).toEqual(['raceWeekday']);
      expect(fieldsFor(raw({ raceWeekday: 3 }))).toEqual(['raceWeekday']);
    });

    it('rejects an entry fee that is not a number', () => {
      expect(codesFor(raw({ entryFee: 'free' }))).toEqual(['seriesFile.field.invalid']);
      expect(codesFor(raw({ rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' }, entryFee: 'free' }] })))
        .toEqual(['seriesFile.field.invalid']);
    });

    it('reads a class entry fee, and rejects one that is not a number', () => {
      const [entry] = raw().entries as Record<string, unknown>[];

      expect(parseSeries(raw({ entries: [{ ...entry, entryFee: 900 }] }), 'test.json').series?.entries[0].entryFee).toBe(900);
      expect(fieldsFor(raw({ entries: [{ ...entry, entryFee: 'free' }] }))).toEqual(['entries[0].entryFee']);
    });

    it('reads whether rain is allowed, and rejects anything but true or false', () => {
      expect(parseSeries(raw({ rain: false }), 'test.json').series?.rain).toBe(false);
      expect(fieldsFor(raw({ rain: 'no' }))).toEqual(['rain']);
      expect(fieldsFor(raw({ rain: 0 }))).toEqual(['rain']);
    });

    it('reads a description as one text or as a text per language', () => {
      const translated = { en: 'Club racing', uk: 'Клубні перегони' };

      expect(parseSeries(raw({ description: 'Club racing' }), 'test.json').series?.description).toBe('Club racing');
      expect(parseSeries(raw({ description: translated }), 'test.json').series?.description).toEqual(translated);
    });

    it('rejects a description that is neither a string nor a text per language', () => {
      expect(codesFor(raw({ description: 42 }))).toEqual(['seriesFile.field.invalid']);
      expect(fieldsFor(raw({ description: ['Club racing'] }))).toEqual(['description']);
      expect(fieldsFor(raw({ description: {} }))).toEqual(['description']);
    });

    it('rejects a translation into a language the app does not speak, naming it', () => {
      expect(fieldsFor(raw({ description: { en: 'Club racing', fr: 'Course de club' } })))
        .toEqual(['description.fr']);
    });

    it('rejects a translation that is not a string', () => {
      expect(fieldsFor(raw({ description: { en: 'Club racing', uk: 7 } }))).toEqual(['description.uk']);
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
