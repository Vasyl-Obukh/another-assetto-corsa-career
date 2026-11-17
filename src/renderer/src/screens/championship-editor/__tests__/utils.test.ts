import { describe, expect, it } from '@jest/globals';

import {
  AI_RANGE, MAX_GRID_OFFSET, SERIES_FORMAT_VERSION, WeatherType,
} from '../../../../../shared/constants';
import { ContentSource, Discipline } from '../../../../../shared/types';
import type {
  Championship, ClassEntry, EventFormat, Round, SeriesAvailability, SeriesSession, Weather,
} from '../../../../../shared/types';
import { SHIPPED_CATALOGUE } from '../../../../../shared/utils/car-classes';
import {
  DEFAULT_LENGTH, DEFAULT_POINTS, DEFAULT_PURSE_PLACES, DEFAULT_TIER, HISTORIC_EDITOR_TABS, HISTORIC_IDS, PURSE_SHAPES,
} from '../constants.ts';
import {
  changedTabs,
  coeffOf,
  daysOf,
  diagramField,
  emptyHistoric,
  emptySeries,
  freeId,
  generatePurse,
  groupSet,
  groupsSet,
  historicTab,
  lengthUnit,
  minutesOf,
  namedCars,
  namesIn,
  namesItsType,
  nationsIn,
  nextEntry,
  nextFormat,
  nextPoints,
  nextRound,
  nextSeat,
  nextTeam,
  offsetBounds,
  paysInAll,
  pitboxShort,
  problemTab,
  problemTabs,
  racesPaying,
  recipeOf,
  roundsRunning,
  seatRuns,
  sessionSource,
  sessionSources,
  shownLength,
  startingSeats,
  startKindOf,
  storedLength,
  withAddedFormat,
  withAddedPoints,
  withBop,
  withDefaultFormat,
  withEntry,
  withEntryEligibility,
  withEntryPrizes,
  withFormat,
  withHistoricNames,
  withLengthUnit,
  withoutDay,
  withoutEntry,
  withoutFormat,
  withoutGroup,
  withoutPoints,
  withoutRound,
  withoutSession,
  withoutTeam,
  withPlace,
  withPoints,
  withPrizes,
  withRaceIds,
  withRound,
  withRoundEligibility,
  withRoundLength,
  withRoundLengthsPruned,
  withSession,
  withSessionConditionsOf,
  withSessionMoved,
  withTeam,
} from '../utils.ts';

/**
 * A championship holding the rounds a test names.
 *
 * Written out rather than cast from a partial, so the fixture cannot drift out
 * of the shape it claims to be. The version is a literal because the renderer
 * may not reach into core for the constant.
 * @param rounds The rounds it should hold
 * @param overrides Anything else to change about it
 * @returns The championship
 */
const series = (rounds: Round[], overrides: Partial<Championship> = {}): Championship => ({
  version: 1,
  id: 'sunday-cup',
  name: 'Sunday Cup',
  rounds,
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 5 },
    seats: [{ id: 'main-1' }],
    eligibility: { kind: 'cars', cars: ['ks_mazda_mx5_cup'] },
  }],
  eventFormats: [{ id: 'sprint', name: 'Sprint', sessions: [{ type: 'race', laps: 5 }] }],
  defaultEventFormat: 'sprint',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10] }],
  defaultPointsSystem: 'race',
  ...overrides,
});

/**
 * One round, named after its id.
 * @param id The round's id
 * @returns The round
 */
const round = (id: string): Round => ({ id, name: id, track: { id: 'magione' } });

/**
 * One class entry fielding the cars a test names.
 * @param id The entry's id
 * @param cars The cars it may field
 * @param overrides Anything else to change about it
 * @returns The class entry
 */
const entry = (id: string, cars: string[], overrides: Partial<ClassEntry> = {}): ClassEntry => ({
  id,
  name: id,
  ladder: { discipline: Discipline.ROAD, tier: 5 },
  seats: [{ id: `${id}-1` }],
  eligibility: { kind: 'cars', cars },
  ...overrides,
});

/**
 * A format running the sessions a test names.
 * @param sessions Its sessions
 * @returns The format
 */
const format = (sessions: SeriesSession[]): EventFormat => ({ id: 'standard', name: 'Standard', sessions });

/**
 * A draft checked against the install, with nothing wrong unless a test says.
 * @param overrides What the check found
 * @returns The availability
 */
const checked = (overrides: Partial<SeriesAvailability> = {}): SeriesAvailability => ({
  series: 'sunday-cup',
  available: true,
  problems: [],
  entries: [],
  rounds: [],
  requires: {
    sources: [],
    packs: [],
    makers: [],
    distributors: [],
    pools: [],
    rounds: { packs: [] },
    widenedBy: { packs: [], makers: [], distributors: [] },
  },
  ...overrides,
});

/**
 * One installed weather preset.
 * @param id Its folder name
 * @param type The CSP weather type it declares, or null
 * @param temperatureCoeff How far the sun warms the road under it
 * @returns The preset
 */
const preset = (id: string, type: WeatherType | null, temperatureCoeff: number): Weather => ({
  id,
  name: id,
  type,
  temperatureCoeff,
  author: null,
  timeDiapason: null,
  cloudCover: 0,
  rain: null,
  forceHeadlights: false,
});

/**
 * Whether a table never pays a place more than the one above it.
 * @param values The table, the winner first
 * @returns Whether it falls away or holds
 */
const nonIncreasing = (values: readonly number[]): boolean => (
  values.every((value, place) => place === 0 || value <= values[place - 1])
);

describe('renderer/screens/championship-editor/utils', () => {
  describe('freeId', () => {
    it('keeps the stem when nothing holds it', () => {
      expect(freeId('round-3', new Set())).toBe('round-3');
    });

    it('counts on past whatever is taken', () => {
      expect(freeId('round-3', new Set(['round-3']))).toBe('round-3-2');
      expect(freeId('round-3', new Set(['round-3', 'round-3-2']))).toBe('round-3-3');
    });
  });

  describe('emptySeries', () => {
    // Four choices nobody made are what a seeded draft would carry, so a new
    // championship starts with none of them.
    it('starts with no class, round, format or points system', () => {
      expect(emptySeries('My championship')).toEqual({
        version: SERIES_FORMAT_VERSION,
        id: '',
        name: 'My championship',
        entries: [],
        rounds: [],
        eventFormats: [],
        defaultEventFormat: '',
        pointsSystems: [],
        defaultPointsSystem: '',
      });
    });
  });

  describe('nextRound', () => {
    it('numbers the new round after the ones already there', () => {
      expect(nextRound(series([round('magione')]))).toEqual({
        id: 'round-2', name: 'Round 2', track: { id: '' },
      });
    });

    it('names no track, so the round reads as needing one', () => {
      expect(nextRound(series([])).track).toEqual({ id: '' });
    });

    // The number comes from the length, so deleting a round and adding another
    // can land on an id that is already spent. validateSeries refuses duplicate
    // round ids, so minting one would be a document nobody could save.
    it('does not reuse an id a surviving round still holds', () => {
      const clashing = series([round('round-1'), round('round-2'), round('round-3')]);

      // Length 3 wants `round-4`, which is free.
      expect(nextRound(clashing).id).toBe('round-4');
      // Length 2 wants `round-3`, which the third round still holds.
      expect(nextRound(series([round('round-1'), round('round-3')])).id).toBe('round-3-2');
    });
  });

  describe('withRound', () => {
    it('replaces only the round named', () => {
      const edited = { ...round('monza'), name: 'Monza, renamed' };
      const next = withRound(series([round('magione'), round('monza')]), 'monza', edited);

      expect(next.rounds.map((one) => one.name)).toEqual(['magione', 'Monza, renamed']);
    });

    it('leaves the calendar alone when nothing matches', () => {
      const next = withRound(series([round('magione')]), 'spa', round('spa'));

      expect(next.rounds.map((one) => one.id)).toEqual(['magione']);
    });

    it('keeps the order it found, so replacing never reshuffles the calendar', () => {
      const next = withRound(
        series([round('a'), round('b'), round('c')]),
        'a',
        { ...round('a'), name: 'A' },
      );

      expect(next.rounds.map((one) => one.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('withoutRound', () => {
    it('drops the round named and keeps the rest in order', () => {
      const next = withoutRound(series([round('a'), round('b'), round('c')]), 'b');

      expect(next.rounds.map((one) => one.id)).toEqual(['a', 'c']);
    });

    it('leaves the calendar alone when nothing matches', () => {
      expect(withoutRound(series([round('a')]), 'spa').rounds).toHaveLength(1);
    });
  });

  describe('nextEntry', () => {
    it('numbers the class after the ones already there, with one seat and no cars', () => {
      expect(nextEntry(series([]))).toEqual({
        id: 'class-2',
        name: 'Class 2',
        ladder: { discipline: Discipline.ROAD, tier: DEFAULT_TIER },
        seats: [{ id: 'class-2-1' }],
        eligibility: { kind: 'cars', cars: [] },
      });
    });

    it('gives its seat an id no other class has spent', () => {
      const taken = series([], {
        entries: [entry('main', [], { seats: [{ id: 'class-2-1' }] })],
      });

      expect(nextEntry(taken).seats[0].id).toBe('class-2-1-2');
    });
  });

  describe('nextSeat', () => {
    it('numbers the seat after the ones its class already has', () => {
      const championship = series([]);

      expect(nextSeat(championship, championship.entries[0])).toEqual({ id: 'main-2' });
    });

    it('steps past an id another class has spent', () => {
      const championship = series([], {
        entries: [entry('main', []), entry('other', [], { seats: [{ id: 'main-2' }] })],
      });

      expect(nextSeat(championship, championship.entries[0]).id).toBe('main-2-2');
    });
  });

  describe('nextTeam', () => {
    it('starts at one for a championship with no teams', () => {
      expect(nextTeam(series([]))).toEqual({ id: 'team-1', name: 'Team 1' });
    });

    it('numbers the team after the ones already there', () => {
      expect(nextTeam(series([], { teams: [{ id: 'red', name: 'Red' }] })).id).toBe('team-2');
    });
  });

  describe('withEntry', () => {
    it('replaces only the class entry named', () => {
      const championship = series([], { entries: [entry('pro', []), entry('am', [])] });
      const next = withEntry(championship, 'am', { ...entry('am', []), name: 'Amateur' });

      expect(next.entries.map((one) => one.name)).toEqual(['pro', 'Amateur']);
    });
  });

  describe('withoutEntry', () => {
    it('drops the class entry named', () => {
      const championship = series([], { entries: [entry('pro', []), entry('am', [])] });

      expect(withoutEntry(championship, 'am').entries.map((one) => one.id)).toEqual(['pro']);
    });

    it('drops the round overrides aimed at it, which would name a class that is gone', () => {
      const swapped: Round = {
        ...round('oval'),
        eligibility: [
          { entry: 'am', eligibility: { kind: 'cars', cars: ['oval_car'] } },
          { entry: 'pro', eligibility: { kind: 'cars', cars: ['oval_car'] } },
        ],
      };
      const championship = series([swapped], { entries: [entry('pro', []), entry('am', [])] });

      expect(withoutEntry(championship, 'am').rounds[0].eligibility?.map((one) => one.entry))
        .toEqual(['pro']);
    });

    it('leaves no empty override list behind', () => {
      const swapped: Round = {
        ...round('oval'),
        eligibility: [{ entry: 'am', eligibility: { kind: 'cars', cars: ['oval_car'] } }],
      };
      const championship = series([swapped], { entries: [entry('pro', []), entry('am', [])] });

      expect(withoutEntry(championship, 'am').rounds[0].eligibility).toBeUndefined();
    });
  });

  describe('withTeam', () => {
    it('replaces only the team named', () => {
      const championship = series([], {
        teams: [{ id: 'red', name: 'Red' }, { id: 'blue', name: 'Blue' }],
      });

      expect(withTeam(championship, 'blue', { id: 'blue', name: 'Azure' }).teams)
        .toEqual([{ id: 'red', name: 'Red' }, { id: 'blue', name: 'Azure' }]);
    });
  });

  describe('withoutTeam', () => {
    it('unseats whoever the team fielded rather than leaving them pointing at nothing', () => {
      const championship = series([], {
        teams: [{ id: 'red', name: 'Red' }, { id: 'blue', name: 'Blue' }],
        entries: [entry('main', [], {
          seats: [{ id: 'a', team: 'red' }, { id: 'b', team: 'blue' }],
        })],
      });
      const next = withoutTeam(championship, 'red');

      expect(next.teams).toEqual([{ id: 'blue', name: 'Blue' }]);
      expect(next.entries[0].seats).toEqual([{ id: 'a', team: undefined }, { id: 'b', team: 'blue' }]);
    });

    it('leaves no empty team list behind', () => {
      expect(withoutTeam(series([], { teams: [{ id: 'red', name: 'Red' }] }), 'red').teams)
        .toBeUndefined();
    });
  });

  describe('withEntryEligibility', () => {
    const cars = (list: string[]) => ({ kind: 'cars' as const, cars: list });

    it('unpins a seat from a car its class can no longer field', () => {
      const championship = series([], {
        entries: [entry('main', ['old_car', 'kept_car'], {
          seats: [
            { id: 'a', car: { model: 'old_car' } },
            { id: 'b', car: { model: 'kept_car' } },
          ],
        })],
      });
      const next = withEntryEligibility(championship, 'main', cars(['kept_car']), SHIPPED_CATALOGUE);

      expect(next.series.entries[0].seats).toEqual([
        { id: 'a', car: undefined },
        { id: 'b', car: { model: 'kept_car' } },
      ]);
    });

    it('drops balance of performance for a car the class no longer fields', () => {
      const championship = series([], {
        entries: [entry('main', ['old_car'], { bop: [{ car: 'old_car', ballast: 20 }] })],
      });

      expect(withEntryEligibility(championship, 'main', cars(['new_car']), SHIPPED_CATALOGUE).series.entries[0].bop)
        .toBeUndefined();
    });

    it('keeps a pinned car a round still swaps the class onto', () => {
      const swapped: Round = {
        ...round('oval'),
        eligibility: [{ entry: 'main', eligibility: cars(['oval_car']) }],
      };
      const championship = series([swapped], {
        entries: [entry('main', ['road_car'], { seats: [{ id: 'a', car: { model: 'oval_car' } }] })],
      });
      const next = withEntryEligibility(championship, 'main', cars(['other_car']), SHIPPED_CATALOGUE);

      expect(next.series.entries[0].seats[0].car).toEqual({ model: 'oval_car' });
    });

    it('sets aside what it takes off, by seat and by car', () => {
      const championship = series([], {
        entries: [entry('main', ['a_car'], {
          seats: [{ id: 'a', car: { model: 'a_car', skin: 'red' } }],
          bop: [{ car: 'a_car', ballast: 20 }],
        })],
      });

      expect(withEntryEligibility(championship, 'main', cars([]), SHIPPED_CATALOGUE).aside).toEqual({
        main: { cars: { a: { model: 'a_car', skin: 'red' } }, bop: [{ car: 'a_car', ballast: 20 }] },
      });
    });

    // Guards a bug: switching a class's kind or spec to look at another and
    // back wiped every pinned livery and BoP row the detour did not allow.
    it('puts back what an earlier change set aside once the rule allows it again', () => {
      const original = series([], {
        entries: [entry('main', ['a_car', 'b_car'], {
          seats: [{ id: 'a', car: { model: 'a_car', skin: 'red' } }, { id: 'b', car: { model: 'b_car' } }],
          bop: [{ car: 'a_car', ballast: 20 }],
        })],
      });
      const away = withEntryEligibility(original, 'main', cars(['b_car']), SHIPPED_CATALOGUE);
      const back = withEntryEligibility(away.series, 'main', cars(['a_car', 'b_car']), SHIPPED_CATALOGUE, away.aside);

      expect(back.series.entries[0]).toEqual(original.entries[0]);
      expect(back.aside).toEqual({ main: { cars: {}, bop: [] } });
    });

    it('lets a seat pinned again in the meantime keep its own car', () => {
      const original = series([], {
        entries: [entry('main', ['a_car', 'b_car'], { seats: [{ id: 'a', car: { model: 'a_car' } }] })],
      });
      const away = withEntryEligibility(original, 'main', cars(['b_car']), SHIPPED_CATALOGUE);
      const repinned = withEntry(away.series, 'main', {
        ...away.series.entries[0],
        seats: [{ id: 'a', car: { model: 'b_car' } }],
      });
      const back = withEntryEligibility(repinned, 'main', cars(['a_car', 'b_car']), SHIPPED_CATALOGUE, away.aside);

      expect(back.series.entries[0].seats).toEqual([{ id: 'a', car: { model: 'b_car' } }]);
      expect(back.aside.main.cars).toEqual({});
    });

    it('keeps holding what the rule still does not allow', () => {
      const original = series([], {
        entries: [entry('main', ['a_car'], { seats: [{ id: 'a', car: { model: 'a_car' } }] })],
      });
      const away = withEntryEligibility(original, 'main', cars(['b_car']), SHIPPED_CATALOGUE);
      const further = withEntryEligibility(away.series, 'main', cars(['c_car']), SHIPPED_CATALOGUE, away.aside);

      expect(further.series.entries[0].seats[0].car).toBeUndefined();
      expect(further.aside.main.cars).toEqual({ a: { model: 'a_car' } });
    });

    // Repairing a class nobody touched would quietly fix problems the user has
    // not been shown.
    it('leaves every other class entry alone, even one naming a car it cannot field', () => {
      const championship = series([], {
        entries: [
          entry('main', ['a_car']),
          entry('other', ['b_car'], { seats: [{ id: 'x', car: { model: 'stray_car' } }] }),
        ],
      });
      const next = withEntryEligibility(championship, 'main', cars(['c_car']), SHIPPED_CATALOGUE);

      expect(next.series.entries[1]).toBe(championship.entries[1]);
    });
  });

  describe('withRoundEligibility', () => {
    const cars = (list: string[]) => ({ kind: 'cars' as const, cars: list });

    it('adds an override to a round that had none', () => {
      const next = withRoundEligibility(series([round('oval')]), 'oval', 'main', cars(['oval_car']), SHIPPED_CATALOGUE);

      expect(next.series.rounds[0].eligibility).toEqual([{ entry: 'main', eligibility: cars(['oval_car']) }]);
    });

    it('replaces an override the round already held for that class', () => {
      const swapped: Round = { ...round('oval'), eligibility: [{ entry: 'main', eligibility: cars(['a']) }] };
      const next = withRoundEligibility(series([swapped]), 'oval', 'main', cars(['b']), SHIPPED_CATALOGUE);

      expect(next.series.rounds[0].eligibility).toEqual([{ entry: 'main', eligibility: cars(['b']) }]);
    });

    it('stops overriding, leaving no empty list behind', () => {
      const swapped: Round = { ...round('oval'), eligibility: [{ entry: 'main', eligibility: cars(['a']) }] };

      expect(withRoundEligibility(series([swapped]), 'oval', 'main', null, SHIPPED_CATALOGUE).series.rounds[0].eligibility)
        .toBeUndefined();
    });

    it('unpins a seat from a car only the dropped override allowed, and pins it back when it returns', () => {
      const swapped: Round = { ...round('oval'), eligibility: [{ entry: 'main', eligibility: cars(['oval_car']) }] };
      const championship = series([swapped], {
        entries: [entry('main', ['road_car'], { seats: [{ id: 'a', car: { model: 'oval_car' } }] })],
      });
      const off = withRoundEligibility(championship, 'oval', 'main', null, SHIPPED_CATALOGUE);
      const on = withRoundEligibility(off.series, 'oval', 'main', cars(['oval_car']), SHIPPED_CATALOGUE, off.aside);

      expect(off.series.entries[0].seats[0].car).toBeUndefined();
      expect(on.series.entries[0].seats[0].car).toEqual({ model: 'oval_car' });
    });
  });

  describe('namedCars', () => {
    it('gathers every car any class may field, each once', () => {
      const swapped: Round = {
        ...round('oval'),
        eligibility: [{ entry: 'pro', eligibility: { kind: 'cars', cars: ['oval_car', 'b_car'] } }],
      };
      const championship = series([swapped], {
        entries: [entry('pro', ['a_car', 'b_car']), entry('am', ['b_car'])],
      });

      expect(namedCars(championship, SHIPPED_CATALOGUE).sort()).toEqual(['a_car', 'b_car', 'oval_car']);
    });
  });

  describe('nextFormat', () => {
    it('numbers the format after the ones already there, running what it was handed', () => {
      const sessions: SeriesSession[] = [{ type: 'race', laps: 10 }];

      expect(nextFormat(series([]), sessions)).toEqual({
        id: 'format-2', name: 'Format 2', sessions: [{ id: 'race-1', type: 'race', laps: 10 }],
      });
    });

    it('steps past an id a surviving format still holds', () => {
      const taken = series([], {
        eventFormats: [{ id: 'format-2', name: 'Two', sessions: [{ type: 'race' }] }],
      });

      expect(nextFormat(taken, []).id).toBe('format-2-2');
    });
  });

  describe('withFormat', () => {
    it('replaces only the format named', () => {
      const next = withFormat(series([]), 'sprint', { id: 'sprint', name: 'Short', sessions: [] });

      expect(next.eventFormats).toEqual([{ id: 'sprint', name: 'Short', sessions: [] }]);
    });

    it('drops a round\'s length for a session the format no longer runs', () => {
      const lengths = [{ session: 'race-1', laps: 3 }, { session: 'race-2', laps: 4 }];
      const championship = series([{ ...round('a'), sessionLengths: lengths }], {
        eventFormats: [{
          id: 'sprint', name: 'Sprint', sessions: [{ id: 'race-1', type: 'race' }, { id: 'race-2', type: 'race' }],
        }],
      });
      const next = withFormat(championship, 'sprint', {
        id: 'sprint', name: 'Sprint', sessions: [{ id: 'race-1', type: 'race' }],
      });

      expect(next.rounds[0].sessionLengths).toEqual([{ session: 'race-1', laps: 3 }]);
    });
  });

  describe('withAddedFormat', () => {
    const added: EventFormat = { id: 'endurance', name: 'Endurance', sessions: [{ type: 'race' }] };

    it('appends the format and leaves a default that resolves alone', () => {
      const next = withAddedFormat(series([]), added);

      expect(next.eventFormats.map((one) => one.id)).toEqual(['sprint', 'endurance']);
      expect(next.defaultEventFormat).toBe('sprint');
    });

    it('makes the first format of a new championship its default', () => {
      const next = withAddedFormat(series([], { eventFormats: [], defaultEventFormat: '' }), added);

      expect(next.defaultEventFormat).toBe('endurance');
    });

    it('takes over a default that names no format', () => {
      expect(withAddedFormat(series([], { defaultEventFormat: 'gone' }), added).defaultEventFormat).toBe('endurance');
    });
  });

  describe('withDefaultFormat', () => {
    it('moves the rounds naming no format onto the new default, dropping what it does not run', () => {
      const championship = series([
        { ...round('a'), sessionLengths: [{ session: 'grand-prix', laps: 50 }] },
        { ...round('b'), eventFormat: 'event', sessionLengths: [{ session: 'grand-prix', laps: 60 }] },
      ], {
        eventFormats: [
          { id: 'event', name: 'Event', sessions: [{ id: 'grand-prix', type: 'race' }] },
          { id: 'sprint', name: 'Sprint', sessions: [{ id: 'sprint', type: 'race' }] },
        ],
        defaultEventFormat: 'event',
      });
      const next = withDefaultFormat(championship, 'sprint');

      expect(next.defaultEventFormat).toBe('sprint');
      expect(next.rounds.map((one) => one.sessionLengths)).toEqual([
        undefined, [{ session: 'grand-prix', laps: 60 }],
      ]);
    });
  });

  describe('withoutFormat', () => {
    const two = (): Championship => series([
      { ...round('a'), eventFormat: 'endurance' },
      { ...round('b'), eventFormat: 'sprint' },
    ], {
      eventFormats: [
        { id: 'sprint', name: 'Sprint', sessions: [{ type: 'race' }] },
        { id: 'endurance', name: 'Endurance', sessions: [{ type: 'race' }] },
      ],
      defaultEventFormat: 'endurance',
    });

    it('puts a round that ran it back on the championship default', () => {
      const next = withoutFormat(two(), 'endurance');

      expect(next.rounds.map((one) => one.eventFormat)).toEqual([undefined, 'sprint']);
    });

    it('moves the default to what is left when the default goes', () => {
      expect(withoutFormat(two(), 'endurance').defaultEventFormat).toBe('sprint');
    });

    it('leaves the default alone when another format goes', () => {
      expect(withoutFormat(two(), 'sprint').defaultEventFormat).toBe('endurance');
    });

    it('drops a round\'s lengths for the format that went', () => {
      const championship = two();
      const rounds = [{ ...championship.rounds[0], sessionLengths: [{ session: 'long', minutes: 90 }] }];
      const next = withoutFormat({ ...championship, rounds }, 'endurance');

      expect(next.rounds[0].sessionLengths).toBeUndefined();
    });
  });

  describe('withRoundLengthsPruned', () => {
    const championship = series([], {
      eventFormats: [{ id: 'sprint', name: 'Sprint', sessions: [{ id: 'race-1', type: 'race' }] }],
    });

    it('keeps the lengths for sessions the round\'s format runs', () => {
      const kept = { ...round('a'), sessionLengths: [{ session: 'race-1', laps: 3 }] };

      expect(withRoundLengthsPruned(championship, kept)).toBe(kept);
    });

    it('drops the rest, and the list once nothing is left', () => {
      const lengths = [{ session: 'race-1', laps: 3 }, { session: 'feature', laps: 9 }];

      expect(withRoundLengthsPruned(championship, { ...round('a'), sessionLengths: lengths }).sessionLengths)
        .toEqual([{ session: 'race-1', laps: 3 }]);
      expect(withRoundLengthsPruned(championship, {
        ...round('a'), sessionLengths: [{ session: 'feature', laps: 9 }],
      }).sessionLengths).toBeUndefined();
    });
  });

  describe('withRaceIds', () => {
    it('numbers the races that have no id, by their place among the races', () => {
      expect(withRaceIds([{ type: 'qualify' }, { type: 'race' }, { type: 'race', name: 'Feature' }])).toEqual([
        { type: 'qualify' },
        { id: 'race-1', type: 'race' },
        { id: 'race-2', type: 'race', name: 'Feature' },
      ]);
    });

    // A round's override names its race by id, so one once given must hold.
    it('keeps an id a race already carries, and steps past it', () => {
      expect(withRaceIds([{ id: 'race-2', type: 'race' }, { type: 'race' }]).map((one) => one.id))
        .toEqual(['race-2', 'race-2-2']);
    });
  });

  describe('nextPoints', () => {
    it('numbers the system after the ones already there, paying the default table', () => {
      expect(nextPoints(series([]))).toEqual({ id: 'points-2', name: 'Points 2', positions: DEFAULT_POINTS });
    });
  });

  describe('withAddedPoints', () => {
    const added = { id: 'sprint', name: 'Sprint', positions: [5] };

    it('appends the system and leaves a default that resolves alone', () => {
      const next = withAddedPoints(series([]), added);

      expect(next.pointsSystems.map((one) => one.id)).toEqual(['race', 'sprint']);
      expect(next.defaultPointsSystem).toBe('race');
    });

    it('makes the first system of a new championship its default', () => {
      const next = withAddedPoints(series([], { pointsSystems: [], defaultPointsSystem: '' }), added);

      expect(next.defaultPointsSystem).toBe('sprint');
    });
  });

  describe('withPoints', () => {
    it('replaces only the points system named', () => {
      const next = withPoints(series([]), 'race', { id: 'race', name: 'Race', positions: [3, 2, 1] });

      expect(next.pointsSystems).toEqual([{ id: 'race', name: 'Race', positions: [3, 2, 1] }]);
    });
  });

  describe('withoutPoints', () => {
    const two = (): Championship => series([], {
      pointsSystems: [
        { id: 'race', name: 'Race', positions: [10] },
        { id: 'sprint', name: 'Sprint', positions: [5] },
      ],
      defaultPointsSystem: 'sprint',
      eventFormats: [{
        id: 'double',
        name: 'Double',
        sessions: [{ type: 'race', pointsSystem: 'sprint' }, { type: 'race', pointsSystem: 'race' }],
      }],
      defaultEventFormat: 'double',
    });

    it('puts a race that paid it back on the championship default', () => {
      const next = withoutPoints(two(), 'sprint');

      expect(next.eventFormats[0].sessions.map((one) => one.pointsSystem)).toEqual([undefined, 'race']);
    });

    it('moves the default to what is left when the default goes', () => {
      expect(withoutPoints(two(), 'sprint').defaultPointsSystem).toBe('race');
    });

    it('leaves the default alone when another system goes', () => {
      expect(withoutPoints(two(), 'race').defaultPointsSystem).toBe('sprint');
    });
  });

  describe('sessionSources', () => {
    it('offers a qualifying session only a qualifying that runs earlier', () => {
      const sessions: SeriesSession[] = [
        { type: 'practice' }, { type: 'qualify' }, { type: 'race' }, { type: 'qualify' }, { type: 'race' },
      ];

      expect(sessionSources(sessions, 2, 'qualify')).toEqual([1]);
      expect(sessionSources(sessions, 4, 'qualify')).toEqual([1, 3]);
    });

    it('offers a race an earlier race too, which is how a reverse grid follows one', () => {
      const sessions: SeriesSession[] = [{ type: 'qualify' }, { type: 'race' }, { type: 'practice' }, { type: 'race' }];

      expect(sessionSources(sessions, 3, 'race')).toEqual([0, 1]);
    });

    it('never offers a session itself', () => {
      expect(sessionSources([{ type: 'qualify' }], 0, 'race')).toEqual([]);
    });
  });

  describe('diagramField', () => {
    it('draws three cars of each class, placed as the whole field qualified', () => {
      const field = diagramField(3);

      expect(field).toHaveLength(9);
      expect(field.map((car) => car.place)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('lets a class\'s quickest beat the slowest of the class ahead', () => {
      const field = diagramField(2);

      expect(field.map((car) => [car.slot, car.classPlace])).toEqual([
        [0, 1], [0, 2], [1, 1], [0, 3], [1, 2], [1, 3],
      ]);
    });

    it('leaves the second class\'s last car without a time, behind everyone', () => {
      const field = diagramField(3);

      expect(field.filter((car) => !car.timed)).toEqual([{
        slot: 1, classPlace: 3, place: 9, timed: false,
      }]);
    });

    it('leaves a field of one class\'s last car without a time', () => {
      expect(diagramField(1).map((car) => car.timed)).toEqual([true, true, false]);
    });
  });

  describe('sessionSource', () => {
    const sessions: SeriesSession[] = [
      { id: 'q1', type: 'qualify' },
      { type: 'race', inherit: { from: 'q1' } },
      { type: 'race', inherit: { from: 'gone' } },
    ];

    it('reads a link back as the position it points at', () => {
      expect(sessionSource(sessions, sessions[1])).toBe(0);
    });

    it('reads a session that follows nothing as null', () => {
      expect(sessionSource(sessions, sessions[0])).toBeNull();
    });

    it('reads a link to a session that is not there as following nothing', () => {
      expect(sessionSource(sessions, sessions[2])).toBeNull();
    });
  });

  describe('withSession', () => {
    it('replaces the session at a position', () => {
      const next = withSession(format([{ type: 'race', laps: 5 }]), 0, {
        session: { type: 'race', laps: 8 }, from: null,
      });

      expect(next.sessions).toEqual([{ id: 'race-1', type: 'race', laps: 8 }]);
    });

    it('appends when handed the length, which is what an add row confirms with', () => {
      const next = withSession(format([{ type: 'qualify' }]), 1, { session: { type: 'race' }, from: null });

      expect(next.sessions).toEqual([{ type: 'qualify' }, { id: 'race-1', type: 'race' }]);
    });

    it('gives an unnamed source an id so the link has something to name', () => {
      const next = withSession(format([{ type: 'qualify' }, { type: 'race' }]), 1, {
        session: { type: 'race' }, from: 0, top: 10,
      });

      expect(next.sessions).toEqual([
        { type: 'qualify', id: 'session-1' },
        { id: 'race-1', type: 'race', inherit: { from: 'session-1', top: 10 } },
      ]);
    });

    it('carries how much of the grid a race reverses onto its link', () => {
      const next = withSession(format([{ id: 'race-1', type: 'race' }, { type: 'race' }]), 1, {
        session: { type: 'race' }, from: 0, reverse: 8,
      });

      expect(next.sessions[1].inherit).toEqual({ from: 'race-1', top: undefined, reverse: 8 });
    });

    it('keeps the id a source already carries', () => {
      const next = withSession(format([{ id: 'q1', type: 'qualify' }, { type: 'race' }]), 1, {
        session: { type: 'race' }, from: 0,
      });

      expect(next.sessions[1].inherit).toEqual({ from: 'q1', top: undefined });
    });

    it('steps past an id another session already holds', () => {
      const next = withSession(format([{ type: 'qualify' }, { id: 'session-1', type: 'race' }]), 1, {
        session: { id: 'session-1', type: 'race' }, from: 0,
      });

      expect(next.sessions[0].id).toBe('session-1-2');
    });
  });

  describe('withoutSession', () => {
    it('drops the session and unlinks whatever followed it', () => {
      const next = withoutSession(format([
        { id: 'q1', type: 'qualify' },
        { type: 'race', inherit: { from: 'q1' } },
      ]), 0);

      expect(next.sessions).toEqual([{ type: 'race', inherit: undefined }]);
    });

    it('leaves links to other sessions alone', () => {
      const next = withoutSession(format([
        { id: 'q1', type: 'qualify' },
        { type: 'practice' },
        { type: 'race', inherit: { from: 'q1' } },
      ]), 1);

      expect(next.sessions[1].inherit).toEqual({ from: 'q1' });
    });

    // An unnamed session cannot be followed, so nothing that lacks an id may be
    // mistaken for a link to it.
    it('unlinks nothing when the dropped session had no id', () => {
      const next = withoutSession(format([{ type: 'practice' }, { type: 'race', inherit: { from: 'q1' } }]), 0);

      expect(next.sessions).toEqual([{ type: 'race', inherit: { from: 'q1' } }]);
    });
  });

  describe('roundsRunning', () => {
    const championship = series([
      round('a'),
      { ...round('b'), eventFormat: 'endurance' },
      { ...round('c'), eventFormat: 'sprint' },
    ]);

    it('counts the rounds that name nothing as running the default', () => {
      expect(roundsRunning(championship, 'sprint')).toBe(2);
    });

    it('counts the rounds that name a format themselves', () => {
      expect(roundsRunning(championship, 'endurance')).toBe(1);
    });

    it('counts nothing for a format no round runs', () => {
      expect(roundsRunning(championship, 'unused')).toBe(0);
    });
  });

  describe('lengthUnit', () => {
    it('reads a distance first, whatever else is written', () => {
      expect(lengthUnit({ type: 'race', laps: 10, distance: 50 })).toBe('distance');
    });

    // A race is never the clock's: AC reads RACE_LAPS offline and times a race
    // on a server alone, so one written in minutes still reads as laps and
    // validateSeries reports it.
    it('reads a race as laps, whatever it carries', () => {
      expect(lengthUnit({ type: 'race', laps: 10, minutes: 30 })).toBe('laps');
      expect(lengthUnit({ type: 'race' })).toBe('laps');
      expect(lengthUnit({ type: 'race', minutes: 30 })).toBe('laps');
    });

    it('reads anything but a race as the clock', () => {
      expect(lengthUnit({ type: 'qualify', laps: 3 })).toBe('minutes');
    });
  });

  describe('withLengthUnit', () => {
    it('keeps the unit\'s own value and clears the other two', () => {
      expect(withLengthUnit({ laps: 10, minutes: 30, distance: 50 }, 'minutes'))
        .toEqual({ laps: undefined, minutes: 30, distance: undefined });
    });

    it('starts a unit the session had no value in at its default', () => {
      expect(withLengthUnit({ laps: 10 }, 'distance'))
        .toEqual({ laps: undefined, minutes: undefined, distance: DEFAULT_LENGTH.distance });
    });
  });

  describe('shownLength', () => {
    const miles = { shown: (quantity: string, metric: number) => Math.round(metric * 0.621371 * 10) / 10 };

    it('shows a distance in the units the player reads', () => {
      expect(shownLength(100, 'distance', miles)).toBe(62.1);
    });

    it('shows laps and minutes as they are', () => {
      expect(shownLength(20, 'laps', miles)).toBe(20);
      expect(shownLength(30, 'minutes', miles)).toBe(30);
    });

    it('is undefined for no length', () => {
      expect(shownLength(undefined, 'distance', miles)).toBeUndefined();
    });
  });

  describe('storedLength', () => {
    const miles = { stored: (quantity: string, typed: number) => typed * 1.609344 };

    it('keeps a distance typed in miles as kilometres, to the metre', () => {
      expect(storedLength(500, 'distance', miles)).toBe(804.672);
      expect(storedLength(1, 'distance', { stored: () => 1.2345678 })).toBe(1.235);
    });

    it('keeps laps and minutes as typed', () => {
      expect(storedLength(20, 'laps', miles)).toBe(20);
      expect(storedLength(30, 'minutes', miles)).toBe(30);
    });

    it('is undefined for no length', () => {
      expect(storedLength(undefined, 'distance', miles)).toBeUndefined();
    });
  });

  describe('withRoundLength', () => {
    const shortened = { ...round('monaco'), sessionLengths: [{ session: 'grand-prix', laps: 78 }] };

    it('replaces a session\'s length, leaving the others alone', () => {
      const next = withRoundLength(
        { ...shortened, sessionLengths: [...shortened.sessionLengths, { session: 'sprint', laps: 20 }] },
        'grand-prix',
        { distance: 260 },
      );

      expect(next.sessionLengths).toEqual([{ session: 'sprint', laps: 20 }, { session: 'grand-prix', distance: 260 }]);
    });

    it('drops the list once the last length goes back to the format\'s', () => {
      expect(withRoundLength(shortened, 'grand-prix', null).sessionLengths).toBeUndefined();
    });
  });

  describe('withEntryPrizes', () => {
    const main = series([]).entries[0];

    it('writes the tables the class pays of its own', () => {
      expect(withEntryPrizes(main, { positions: [100], standings: [] }).prizes)
        .toEqual({ positions: [100], standings: undefined });
    });

    it('puts the class back on the championship\'s purse when both are emptied', () => {
      expect(withEntryPrizes({ ...main, prizes: { positions: [1] } }, { positions: [], standings: [] }).prizes)
        .toBeUndefined();
    });
  });

  describe('withPrizes', () => {
    it('writes both tables when both pay something', () => {
      expect(withPrizes(series([]), { positions: [100], standings: [500] }).prizes)
        .toEqual({ positions: [100], standings: [500] });
    });

    it('leaves an emptied table out rather than writing it as empty', () => {
      expect(withPrizes(series([]), { positions: [100], standings: [] }).prizes)
        .toEqual({ positions: [100], standings: undefined });
    });

    it('drops the prize block when neither table pays anything', () => {
      expect(withPrizes(series([], { prizes: { positions: [1] } }), { positions: [], standings: [] }).prizes)
        .toBeUndefined();
    });
  });

  describe('changedTabs', () => {
    it('marks nothing on a championship that has never been written', () => {
      expect(changedTabs(series([]), undefined)).toEqual(new Set());
    });

    it('marks the tabs whose fields differ from what is written, and no others', () => {
      const saved = series([]);
      const draft = { ...saved, name: 'Monday Cup', rounds: [round('a')] };

      expect(changedTabs(draft, saved)).toEqual(new Set(['overview', 'calendar']));
    });

    it('marks nothing when the draft matches what is written', () => {
      expect(changedTabs(series([round('a')]), series([round('a')]))).toEqual(new Set());
    });

    it('marks only the tabs it is handed, so a historic event marks its own', () => {
      const saved = series([round('a')]);
      const draft = { ...saved, rounds: [{ ...round('a'), track: { id: 'spa' } }], prizes: { positions: [100] } };

      expect(changedTabs(draft, saved, HISTORIC_EDITOR_TABS)).toEqual(new Set(['event', 'prizes']));
    });
  });

  describe('problemTab', () => {
    it('sends a problem to the tab its subject is edited on', () => {
      expect(problemTab('series.round.notFound')).toBe('calendar');
      expect(problemTab('series.seat.teamUnknown')).toBe('classes');
      expect(problemTab('series.points.unknown')).toBe('scoring');
      expect(problemTab('series.formats.empty')).toBe('formats');
    });

    it('sends anything it does not list to the overview', () => {
      expect(problemTab('series.version.unsupported')).toBe('overview');
      expect(problemTab('nonsense')).toBe('overview');
    });
  });

  describe('pitboxShort', () => {
    /**
     * A check of rounds each on a track of the given pit boxes.
     * @param tracks Each round's track, by key, with its boxes
     * @returns The availability
     */
    const racing = (tracks: [string, number | null][]): SeriesAvailability => checked({
      rounds: tracks.map(([key, pitboxes], at) => ({
        round: `r${at}`,
        track: null,
        pitboxes: null,
        racedOn: { key, name: key.toUpperCase(), pitboxes },
        entries: [],
        races: [],
      })),
    });

    it('counts the rounds a field is too big for, naming each track once in calendar order', () => {
      const short = pitboxShort(racing([['b', 20], ['a', 30], ['b', 20], ['c', 18]]), 24);

      expect(short.rounds).toBe(3);
      expect(short.tracks.map((track) => track.key)).toEqual(['b', 'c']);
    });

    // The check answers after the draft changes, so the seat being added is
    // judged against the boxes rather than the last answer's verdict.
    it('judges a field the last check has not seen yet', () => {
      expect(pitboxShort(racing([['a', 24]]), 24).rounds).toBe(0);
      expect(pitboxShort(racing([['a', 24]]), 25).rounds).toBe(1);
    });

    it('passes over tracks that do not say how many boxes they have, and those not installed', () => {
      const unknown = racing([['a', null], ['b', 0]]);

      expect(pitboxShort(unknown, 60)).toEqual({ rounds: 0, tracks: [] });
      expect(pitboxShort(checked({
        rounds: [{
          round: 'r', track: null, pitboxes: null, racedOn: null, entries: [], races: [],
        }],
      }), 60)).toEqual({ rounds: 0, tracks: [] });
    });

    it('finds nothing before the first check comes back', () => {
      expect(pitboxShort(null, 60)).toEqual({ rounds: 0, tracks: [] });
    });
  });

  describe('problemTabs', () => {
    it('marks nothing before the draft has been checked', () => {
      expect(problemTabs(null)).toEqual(new Set());
    });

    it('marks the tab of every problem', () => {
      const result = checked({
        problems: [
          { code: 'series.round.notFound', params: {}, message: '' },
          { code: 'series.points.unknown', params: {}, message: '' },
        ],
      });

      expect(problemTabs(result)).toEqual(new Set(['calendar', 'scoring']));
    });

    it('marks what the install cannot race as well as what the document gets wrong', () => {
      const result = checked({
        rounds: [{
          round: 'a',
          track: null,
          pitboxes: {
            needed: 20, available: 12, key: 'a', track: 'A',
          },
          racedOn: null,
          entries: [],
          races: [],
        }],
        entries: [{
          entry: 'main', eligible: [], missing: [], enough: false,
        }],
      });

      expect(problemTabs(result)).toEqual(new Set(['calendar', 'classes']));
    });

    it('marks the tab the editor in use holds each subject on', () => {
      const result = checked({
        problems: [
          { code: 'series.points.unknown', params: {}, message: '' },
          { code: 'series.seat.teamUnknown', params: {}, message: '' },
        ],
        rounds: [{
          round: 'a', track: {
            key: 'spa', id: 'spa', layout: '', provenance: {
              source: ContentSource.BASE, pack: null, maker: null, distributor: null,
            },
          }, pitboxes: null, racedOn: null, entries: [], races: [],
        }],
      });

      expect(problemTabs(result, historicTab)).toEqual(new Set(['prizes', 'classes', 'event']));
    });
  });

  describe('historicTab', () => {
    it('moves the calendar and the formats to Event, and scoring to Prizes', () => {
      expect(historicTab('calendar')).toBe('event');
      expect(historicTab('formats')).toBe('event');
      expect(historicTab('scoring')).toBe('prizes');
    });

    it('keeps the tabs a historic event shares with a championship', () => {
      expect(historicTab('overview')).toBe('overview');
      expect(historicTab('teams')).toBe('teams');
      expect(historicTab('classes')).toBe('classes');
    });
  });

  describe('emptyHistoric', () => {
    it('writes one round, one empty format and a points table paying nothing, all named for the event', () => {
      const event = emptyHistoric('Grand Prix', 'No points');

      expect(event.rounds).toEqual([{ id: HISTORIC_IDS.round, name: 'Grand Prix', track: { id: '' } }]);
      expect(event.eventFormats).toEqual([{ id: HISTORIC_IDS.format, name: 'Grand Prix', sessions: [] }]);
      expect(event.defaultEventFormat).toBe(HISTORIC_IDS.format);
      expect(event.pointsSystems).toEqual([{ id: HISTORIC_IDS.points, name: 'No points', positions: [] }]);
      expect(event.defaultPointsSystem).toBe(HISTORIC_IDS.points);
    });

    it('leaves the id blank and the classes empty, for main and the editor to fill', () => {
      const event = emptyHistoric('Grand Prix', 'No points');

      expect(event.id).toBe('');
      expect(event.entries).toEqual([]);
      expect(event.version).toBe(SERIES_FORMAT_VERSION);
      expect(event.seasonLength).toBeUndefined();
      expect(event.raceWeekday).toBeUndefined();
    });
  });

  describe('withHistoricNames', () => {
    it('renames the round and every format after the event', () => {
      const event = series([round('a')], {
        name: 'Italian Grand Prix 1967',
        eventFormats: [format([]), { id: 'other', name: 'Other', sessions: [] }],
      });
      const named = withHistoricNames(event);

      expect(named.rounds.map((one) => one.name)).toEqual(['Italian Grand Prix 1967']);
      expect(named.eventFormats.map((one) => one.name)).toEqual(['Italian Grand Prix 1967', 'Italian Grand Prix 1967']);
    });

    it('leaves everything else of the round as it was', () => {
      const named = withHistoricNames(series([round('a')], { name: 'Event' }));

      expect(named.rounds[0]).toEqual({ id: 'a', name: 'Event', track: { id: 'magione' } });
    });
  });

  describe('namesItsType', () => {
    it("reads a name that is its kind's label as naming the kind", () => {
      expect(namesItsType('Qualifying', 'qualify', ['Qualifying'])).toBe(true);
    });

    // Fixed: only the app's own language was checked, so with the app in
    // Ukrainian a shipped session named "Qualifying" kept its name as a race.
    it("reads a name in any of the languages handed as naming the kind", () => {
      expect(namesItsType('Qualifying', 'qualify', ['Кваліфікація', 'Qualifying'])).toBe(true);
    });

    it("reads the kind's own word, in any case, as naming the kind", () => {
      expect(namesItsType('race', 'race', ['Race'])).toBe(true);
      expect(namesItsType('RACE', 'race', ['Гонка'])).toBe(true);
    });

    it("keeps a name of the player's own", () => {
      expect(namesItsType('Feature race', 'race', ['Race'])).toBe(false);
    });

    it('has nothing to drop when the session has no name', () => {
      expect(namesItsType(undefined, 'race', ['Race'])).toBe(false);
    });
  });

  describe('seatRuns', () => {
    it('splits the seats into runs of one team, keeping the grid order', () => {
      const runs = seatRuns([
        { id: 'a', team: 'red' }, { id: 'b', team: 'red' }, { id: 'c', team: 'blue' },
        { id: 'd', team: 'red' }, { id: 'e' },
      ]);

      expect(runs.map((run) => [run.team, run.seats.map(({ seat, index }) => `${seat.id}${index}`)])).toEqual([
        ['red', ['a0', 'b1']],
        ['blue', ['c2']],
        ['red', ['d3']],
        [undefined, ['e4']],
      ]);
    });

    it('has no runs for a class with no seats', () => {
      expect(seatRuns([])).toEqual([]);
    });
  });

  describe('withPlace', () => {
    it('changes the one place and leaves the rest of the table alone', () => {
      expect(withPlace([25, 18, 15], 1, 20)).toEqual([25, 20, 15]);
    });
  });

  describe('paysInAll', () => {
    it('adds up every place', () => {
      expect(paysInAll([25, 18, 15])).toBe(58);
    });

    it('pays nothing for no table at all', () => {
      expect(paysInAll(undefined)).toBe(0);
      expect(paysInAll([])).toBe(0);
    });
  });

  describe('withBop', () => {
    it('adds a row for a car not balanced yet, at the end', () => {
      expect(withBop([{ car: 'a', ballast: 10 }], 'b', { restrictor: 5 }))
        .toEqual([{ car: 'a', ballast: 10 }, { car: 'b', restrictor: 5 }]);
    });

    it('changes a balanced car where it stands', () => {
      expect(withBop([{ car: 'a', ballast: 10 }, { car: 'b', ballast: 5 }], 'a', { restrictor: 3 }))
        .toEqual([{ car: 'a', ballast: 10, restrictor: 3 }, { car: 'b', ballast: 5 }]);
    });

    it('takes a car off once nothing balances it', () => {
      expect(withBop([{ car: 'a', ballast: 10 }, { car: 'b', ballast: 5 }], 'a', { ballast: 0 }))
        .toEqual([{ car: 'b', ballast: 5 }]);
    });

    it('writes no row for a car given nothing', () => {
      expect(withBop([], 'a', { ballast: undefined })).toEqual([]);
    });
  });

  describe('generatePurse', () => {
    it('pays nothing from an empty pot or across no places', () => {
      expect(generatePurse({ pot: 0, places: 10, shape: 'steep', round: 100 })).toEqual([]);
      expect(generatePurse({ pot: 10000, places: 0, shape: 'steep', round: 100 })).toEqual([]);
    });

    it('rounds every place to the step and gives what is left short of one to the winner', () => {
      expect(generatePurse({ pot: 1050, places: 2, shape: 'linear', round: 100 })).toEqual([750, 300]);
    });

    // Fixed bug: the rounding residue all went to the winner, so rounding the
    // places below up could leave first paid less than second - this recipe
    // came out as [1100, 1200, 1100, ...].
    it('never pays a place more than the one above it', () => {
      expect(generatePurse({ pot: 10000, places: 15, shape: 'linear', round: 100 }))
        .toEqual([1300, 1200, 1100, 1000, 900, 800, 700, 700, 600, 500, 400, 300, 200, 200, 100]);
    });

    it('adds up to the pot and falls away, whatever the shape, length and rounding', () => {
      PURSE_SHAPES.forEach((shape) => {
        [1, 50, 100, 500, 1000].forEach((step) => {
          [1, 3, 10, 15, 40].forEach((places) => {
            [100, 2500, 10000, 123456].forEach((pot) => {
              const purse = generatePurse({
                pot, places, shape, round: step,
              });

              expect(paysInAll(purse)).toBe(pot);
              expect(nonIncreasing(purse)).toBe(true);
              expect(purse.every((value) => value >= 0)).toBe(true);
            });
          });
        });
      });
    });
  });

  describe('recipeOf', () => {
    it('reads the total, the length and the coarsest step every place fits', () => {
      expect(recipeOf([5000, 3000, 2000])).toEqual({
        pot: 10000, places: 3, shape: 'steep', round: 1000,
      });
      expect(recipeOf([1050, 500]).round).toBe(50);
      expect(recipeOf([1001, 500]).round).toBe(1);
    });

    it('starts an empty purse at the default length', () => {
      expect(recipeOf([])).toMatchObject({ pot: 0, places: DEFAULT_PURSE_PLACES });
    });
  });

  describe('startingSeats', () => {
    it('numbers the seats after the class, each fielded by the team at its place', () => {
      expect(startingSeats(series([]), 'gt', 3, ['red', undefined]))
        .toEqual([{ id: 'gt-1', team: 'red' }, { id: 'gt-2' }, { id: 'gt-3' }]);
    });

    it('steps round a seat id another class already spends', () => {
      expect(startingSeats(series([]), 'main', 2, []).map((seat) => seat.id)).toEqual(['main-1-2', 'main-2']);
    });
  });

  describe('groupSet', () => {
    it('reads a group as set once any of its fields is', () => {
      expect(groupSet({ windMax: 10 }, 'wind')).toBe(true);
      expect(groupSet({ timeOfDay: '14:00' }, 'wind')).toBe(false);
      expect(groupSet({ ambient: undefined }, 'temperature')).toBe(false);
    });
  });

  describe('groupsSet', () => {
    it('lists the groups that are set, in the order an editor lists them', () => {
      expect(groupsSet({ windMin: 0, timeOfDay: '14:00', weatherType: WeatherType.RAIN }))
        .toEqual(['weather', 'time', 'wind']);
    });

    it('lists nothing for conditions that set nothing', () => {
      expect(groupsSet({})).toEqual([]);
    });
  });

  describe('withoutGroup', () => {
    it('drops every field of the group and nothing else', () => {
      expect(withoutGroup({ ambient: 20, road: 30, timeOfDay: '14:00' }, 'temperature'))
        .toEqual({ timeOfDay: '14:00' });
    });
  });

  describe('minutesOf', () => {
    it('reads a clock and decimal hours alike', () => {
      expect(minutesOf('14:30')).toBe(870);
      expect(minutesOf(13.5)).toBe(810);
    });

    it('reads nothing out of a missing or unreadable time', () => {
      expect(minutesOf(undefined)).toBeUndefined();
      expect(minutesOf('2pm')).toBeUndefined();
    });
  });

  describe('daysOf', () => {
    it('spans as many days as its latest session', () => {
      expect(daysOf(format([{ type: 'practice', minutes: 30 }, { type: 'race', laps: 5, day: 2 }]))).toBe(3);
    });

    it('spans one day when nothing names one, sessions or none', () => {
      expect(daysOf(format([{ type: 'race', laps: 5 }]))).toBe(1);
      expect(daysOf(format([]))).toBe(1);
    });
  });

  describe('withSessionMoved', () => {
    const event = format([
      { type: 'practice', minutes: 30, name: 'P' },
      { type: 'qualify', minutes: 15, name: 'Q' },
      { type: 'race', laps: 5, name: 'R', day: 1 },
    ]);

    /**
     * Reads a format back as its sessions' names and days.
     * @param moved The format
     * @returns Each session as its name and its day
     */
    const order = (moved: EventFormat): string[] => moved.sessions.map((one) => `${one.name}${one.day ?? 0}`);

    it('moves a session in front of another, onto the day that one is on', () => {
      expect(order(withSessionMoved(event, 2, 0, 0))).toEqual(['R0', 'P0', 'Q0']);
    });

    it('moves a session to the end of another day', () => {
      expect(order(withSessionMoved(event, 0, null, 1))).toEqual(['Q0', 'R1', 'P1']);
    });

    it('drops a session onto a day the event did not reach yet', () => {
      expect(order(withSessionMoved(event, 0, null, 2))).toEqual(['Q0', 'R1', 'P2']);
    });

    // Fixed bug: a session dropped in front of itself was moved to the end of
    // its day, because it was looked for among the sessions it had left.
    it('leaves a session dropped in front of itself where it was', () => {
      expect(order(withSessionMoved(event, 0, 0, 0))).toEqual(['P0', 'Q0', 'R1']);
      expect(order(withSessionMoved(event, 1, 1, 0))).toEqual(['P0', 'Q0', 'R1']);
    });

    it('writes the first day as no day at all', () => {
      expect(withSessionMoved(event, 2, 0, 0).sessions[0].day).toBeUndefined();
    });
  });

  describe('withoutDay', () => {
    const event = format([
      { type: 'practice', minutes: 30, name: 'A' },
      { type: 'qualify', minutes: 15, name: 'B', day: 1 },
      { type: 'race', laps: 5, name: 'C', day: 2 },
    ]);

    it('moves the sessions of a day onto the day before, and every later day one earlier', () => {
      expect(withoutDay(event, 1).sessions.map((one) => one.day)).toEqual([undefined, undefined, 1]);
    });

    it('moves the sessions of the first day onto the day after', () => {
      expect(withoutDay(event, 0).sessions.map((one) => one.day)).toEqual([undefined, undefined, 1]);
    });
  });

  describe('withSessionConditionsOf', () => {
    const event = format([{ type: 'race', laps: 5 }, { type: 'race', laps: 10 }]);

    it('puts the conditions on the one session', () => {
      const next = withSessionConditionsOf(event, 1, { ambient: 25 });

      expect(next.sessions[1].conditions).toEqual({ ambient: 25 });
      expect(next.sessions[0].conditions).toBeUndefined();
    });

    it('leaves conditions that set nothing off the document', () => {
      expect(withSessionConditionsOf(event, 0, { ambient: undefined }).sessions[0].conditions).toBeUndefined();
    });
  });

  describe('namesIn', () => {
    it('gathers every driver named in every class, and only those', () => {
      const championship = series([], {
        entries: [
          entry('pro', ['a_car'], { seats: [{ id: 'pro-1', driver: { name: 'Ann' } }, { id: 'pro-2' }] }),
          entry('am', ['a_car'], { seats: [{ id: 'am-1', driver: { name: 'Bob' } }] }),
        ],
      });

      expect(namesIn(championship)).toEqual(new Set(['Ann', 'Bob']));
    });
  });

  describe('nationsIn', () => {
    it('counts the nations of teams and drivers, most used first and ties by code', () => {
      const championship = series([], {
        teams: [{ id: 'red', name: 'Red', nationCode: 'ITA' }, { id: 'blue', name: 'Blue', nationCode: 'GBR' }],
        entries: [entry('pro', ['a_car'], {
          seats: [
            { id: 'pro-1', driver: { name: 'Ann', nationCode: 'ITA' } },
            { id: 'pro-2', driver: { name: 'Bob', nationCode: 'FRA' } },
            { id: 'pro-3', driver: { name: 'Cy' } },
          ],
        })],
      });

      expect(nationsIn(championship)).toEqual([['ITA', 2], ['FRA', 1], ['GBR', 1]]);
    });
  });

  describe('offsetBounds', () => {
    it('reaches the full step either way in the middle of the range', () => {
      expect(offsetBounds(50)).toEqual({ min: -MAX_GRID_OFFSET, max: MAX_GRID_OFFSET });
    });

    it('stops where the sum would leave the range', () => {
      expect(offsetBounds(AI_RANGE.max - 5)).toEqual({ min: -MAX_GRID_OFFSET, max: 5 });
      expect(offsetBounds(AI_RANGE.min + 10)).toEqual({ min: -10, max: MAX_GRID_OFFSET });
    });

    it('only steps back down from layers already stacked past the top', () => {
      expect(offsetBounds(AI_RANGE.max + 20)).toEqual({ min: -MAX_GRID_OFFSET, max: -20 });
    });

    it('never offers a range that runs backwards', () => {
      const bounds = offsetBounds(AI_RANGE.min - 2 * MAX_GRID_OFFSET);

      expect(bounds.max).toBeGreaterThanOrEqual(bounds.min);
    });
  });

  describe('startKindOf', () => {
    it('reads a slot as a position and nothing as last', () => {
      expect(startKindOf(3)).toBe('position');
      expect(startKindOf(undefined)).toBe('last');
    });

    it('reads the named starts as themselves', () => {
      expect(startKindOf('pole')).toBe('pole');
      expect(startKindOf('random')).toBe('random');
      expect(startKindOf('last')).toBe('last');
    });
  });

  describe('coeffOf', () => {
    const presets = [preset('sunny', WeatherType.CLEAR, 0.5), preset('wet', WeatherType.RAIN, 1.2)];

    it('takes the preset the conditions name over one declaring their type', () => {
      expect(coeffOf({ weather: 'sunny', weatherType: WeatherType.RAIN }, presets)).toBe(0.5);
    });

    it('finds the preset declaring the type where none is named', () => {
      expect(coeffOf({ weatherType: WeatherType.RAIN }, presets)).toBe(1.2);
    });

    it('has nothing to say where the conditions name no weather', () => {
      expect(coeffOf({}, presets)).toBeUndefined();
    });
  });

  describe('racesPaying', () => {
    const championship = series([], {
      eventFormats: [
        {
          id: 'sprint',
          name: 'Sprint',
          sessions: [
            { type: 'qualify', minutes: 10, pointsSystem: 'race' },
            { type: 'race', laps: 5 },
            { type: 'race', laps: 5, pointsSystem: 'feature' },
          ],
        },
        { id: 'long', name: 'Long', sessions: [{ type: 'race', laps: 50 }] },
      ],
    });

    it('counts every race of every format, the default paying those that name nothing', () => {
      expect(racesPaying(championship, 'race')).toBe(2);
      expect(racesPaying(championship, 'feature')).toBe(1);
    });

    it('counts nothing for a system no race pays', () => {
      expect(racesPaying(championship, 'unused')).toBe(0);
    });
  });
});
