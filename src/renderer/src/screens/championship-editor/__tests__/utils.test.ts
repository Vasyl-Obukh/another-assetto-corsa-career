import { describe, expect, it } from '@jest/globals';

import { SERIES_FORMAT_VERSION } from '../../../../../shared/constants';
import { Discipline } from '../../../../../shared/types';
import type {
  Championship, ClassEntry, Round, SeriesSession, WeekendFormat,
} from '../../../../../shared/types';
import { SHIPPED_CATALOGUE } from '../../../../../shared/utils/car-classes';
import { DEFAULT_LENGTH, DEFAULT_POINTS, DEFAULT_TIER } from '../constants.ts';
import {
  bopScope,
  emptySeries,
  freeId,
  lengthUnit,
  namedCars,
  nextEntry,
  nextFormat,
  nextPoints,
  nextRound,
  nextSeat,
  nextTeam,
  optionalText,
  roundsRunning,
  seatScope,
  sessionScope,
  sessionSource,
  sessionSources,
  withDefaultFormat,
  withEntry,
  withEntryEligibility,
  withEntryPrizes,
  withFormat,
  withLengthUnit,
  withoutEntry,
  withoutFormat,
  withoutPoints,
  withoutRound,
  withoutSession,
  withoutTeam,
  withPoints,
  withPrizes,
  withRaceIds,
  withRound,
  withRoundEligibility,
  withRoundLength,
  withRoundLengthsPruned,
  withSession,
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
  weekendFormats: [{ id: 'sprint', name: 'Sprint', sessions: [{ type: 'race', laps: 5 }] }],
  defaultWeekendFormat: 'sprint',
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
const format = (sessions: SeriesSession[]): WeekendFormat => ({ id: 'standard', name: 'Standard', sessions });

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
        weekendFormats: [],
        defaultWeekendFormat: '',
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

  describe('optionalText', () => {
    it('reads an emptied box as nothing said, so it is left out of the file', () => {
      expect(optionalText('')).toBeUndefined();
    });

    it('keeps whatever the box holds otherwise, whitespace included', () => {
      expect(optionalText('Round one')).toBe('Round one');
      expect(optionalText(' ')).toBe(' ');
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

  describe('seatScope', () => {
    it('scopes seats by their class entry', () => {
      expect(seatScope('pro')).toBe('seats-pro');
    });
  });

  describe('bopScope', () => {
    // Separate from seatScope so a seat and a BoP row of one class can never
    // share a key, whatever their ids.
    it('scopes balance of performance apart from seats of the same class', () => {
      expect(bopScope('pro')).toBe('bop-pro');
      expect(bopScope('pro')).not.toBe(seatScope('pro'));
    });
  });

  describe('sessionScope', () => {
    it('scopes sessions by their format', () => {
      expect(sessionScope('sprint')).toBe('sessions-sprint');
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
        weekendFormats: [{ id: 'format-2', name: 'Two', sessions: [{ type: 'race' }] }],
      });

      expect(nextFormat(taken, []).id).toBe('format-2-2');
    });
  });

  describe('withFormat', () => {
    it('replaces only the format named', () => {
      const next = withFormat(series([]), 'sprint', { id: 'sprint', name: 'Short', sessions: [] });

      expect(next.weekendFormats).toEqual([{ id: 'sprint', name: 'Short', sessions: [] }]);
    });

    it('drops a round\'s length for a session the format no longer runs', () => {
      const lengths = [{ session: 'race-1', laps: 3 }, { session: 'race-2', laps: 4 }];
      const championship = series([{ ...round('a'), sessionLengths: lengths }], {
        weekendFormats: [{
          id: 'sprint', name: 'Sprint', sessions: [{ id: 'race-1', type: 'race' }, { id: 'race-2', type: 'race' }],
        }],
      });
      const next = withFormat(championship, 'sprint', {
        id: 'sprint', name: 'Sprint', sessions: [{ id: 'race-1', type: 'race' }],
      });

      expect(next.rounds[0].sessionLengths).toEqual([{ session: 'race-1', laps: 3 }]);
    });
  });

  describe('withDefaultFormat', () => {
    it('moves the rounds naming no format onto the new default, dropping what it does not run', () => {
      const championship = series([
        { ...round('a'), sessionLengths: [{ session: 'grand-prix', laps: 50 }] },
        { ...round('b'), weekendFormat: 'weekend', sessionLengths: [{ session: 'grand-prix', laps: 60 }] },
      ], {
        weekendFormats: [
          { id: 'weekend', name: 'Weekend', sessions: [{ id: 'grand-prix', type: 'race' }] },
          { id: 'sprint', name: 'Sprint', sessions: [{ id: 'sprint', type: 'race' }] },
        ],
        defaultWeekendFormat: 'weekend',
      });
      const next = withDefaultFormat(championship, 'sprint');

      expect(next.defaultWeekendFormat).toBe('sprint');
      expect(next.rounds.map((one) => one.sessionLengths)).toEqual([
        undefined, [{ session: 'grand-prix', laps: 60 }],
      ]);
    });
  });

  describe('withoutFormat', () => {
    const two = (): Championship => series([
      { ...round('a'), weekendFormat: 'endurance' },
      { ...round('b'), weekendFormat: 'sprint' },
    ], {
      weekendFormats: [
        { id: 'sprint', name: 'Sprint', sessions: [{ type: 'race' }] },
        { id: 'endurance', name: 'Endurance', sessions: [{ type: 'race' }] },
      ],
      defaultWeekendFormat: 'endurance',
    });

    it('puts a round that ran it back on the championship default', () => {
      const next = withoutFormat(two(), 'endurance');

      expect(next.rounds.map((one) => one.weekendFormat)).toEqual([undefined, 'sprint']);
    });

    it('moves the default to what is left when the default goes', () => {
      expect(withoutFormat(two(), 'endurance').defaultWeekendFormat).toBe('sprint');
    });

    it('leaves the default alone when another format goes', () => {
      expect(withoutFormat(two(), 'sprint').defaultWeekendFormat).toBe('endurance');
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
      weekendFormats: [{ id: 'sprint', name: 'Sprint', sessions: [{ id: 'race-1', type: 'race' }] }],
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
      weekendFormats: [{
        id: 'double',
        name: 'Double',
        sessions: [{ type: 'race', pointsSystem: 'sprint' }, { type: 'race', pointsSystem: 'race' }],
      }],
      defaultWeekendFormat: 'double',
    });

    it('puts a race that paid it back on the championship default', () => {
      const next = withoutPoints(two(), 'sprint');

      expect(next.weekendFormats[0].sessions.map((one) => one.pointsSystem)).toEqual([undefined, 'race']);
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
      { ...round('b'), weekendFormat: 'endurance' },
      { ...round('c'), weekendFormat: 'sprint' },
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
});
