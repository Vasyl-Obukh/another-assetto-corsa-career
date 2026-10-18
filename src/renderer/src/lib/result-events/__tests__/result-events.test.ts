import { describe, expect, it } from '@jest/globals';

import type {
  Career, QuickRaceArchives, ResultRecord, SeasonEntry, SessionSummary,
} from '../../../../../shared/types';
import {
  makeSeries, place, race, roundScore,
} from '../../season-results/__tests__/fixtures.ts';
import {
  archiveOrigins, quickOrigins, raceTitle, resultEvents, sessionTypeOf,
} from '../result-events.ts';
import type { ArchiveOrigin } from '../types.ts';

/**
 * One session of an archive.
 * @param type Assetto Corsa's numeric type for it
 * @param name What AC named it
 * @returns The session
 */
const session = (type: number, name: string): SessionSummary => ({
  name,
  type,
  lapCount: 5,
  durationMinutes: 0,
  standings: [{
    position: 1, driver: 'Me', car: 'test_car', skin: 'red', laps: 5, cuts: 0, bestLap: 90_000, totalTime: 0, player: true,
  }],
  order: 'inferred',
});

/**
 * One archived launch.
 * @param file Its file name
 * @param recordedAt When it was written
 * @param overrides What else to change
 * @returns The archive
 */
const archive = (file: string, recordedAt: string, overrides: Partial<ResultRecord> = {}): ResultRecord => ({
  file,
  recordedAt,
  raceId: 'quick-1',
  raceName: 'Evening sprint - Race',
  summary: { track: 'magione', sessions: [session(3, 'Race')] },
  ...overrides,
});

/**
 * The player's season in the test championship, its first round raced over a
 * qualifying launch and a race launch.
 * @returns The season entry
 */
const seasonEntry = (): SeasonEntry => ({
  series: 'test-cup',
  edition: 0,
  championship: makeSeries(),
  entry: 'main',
  playerSeat: 'main-1',
  car: { model: 'test_car' },
  field: [],
  events: [{
    round: 'r1',
    raceId: 'test-cup/r1',
    date: '2026-05-03',
    status: 'raced',
    sessions: [
      {
        index: 0, completedAt: '', archive: 'quali.json', gridOrder: [], classification: null,
      },
      {
        index: 1, completedAt: '', archive: 'race.json', gridOrder: [], classification: null,
      },
    ],
    score: roundScore('r1', [race(1, [place('main-1', 1)])]),
  }],
  standings: { classes: [], updatedAt: '' },
});

/**
 * A career of one season or more, each holding the same entry.
 * @param seasons How many seasons
 * @returns The career
 */
const career = (seasons = 1): Career => ({
  version: 1,
  id: 'career',
  kind: 'career',
  createdAt: '',
  playedAt: '',
  driver: { name: 'Driver', nation: null },
  settings: {
    opponents: null, drivingAids: null, allowSameDayEvents: false, historicFrequency: 'off',
  },
  money: 0,
  rating: {} as Career['rating'],
  startDate: '2026-01-01',
  date: '2026-06-01',
  level: {} as Career['level'],
  seasons: Array.from({ length: seasons }, (unused, index) => ({
    index, startDate: '', endDate: '', entries: [seasonEntry()],
  })),
});

/**
 * A race event of the player's own of three sessions, as the Results page
 * reads it: the archive each launch run so far wrote, each launch writing the
 * grid's cars in their own order.
 * @param archives Each launch's archive, in the order they ran
 * @param carClasses The class each car raced in, where the grid held several
 * @returns The race's archives
 */
const quickRace = (archives: readonly string[], carClasses?: string[]): QuickRaceArchives => ({
  id: 'quick-1',
  title: 'Evening sprint',
  sessions: 3,
  run: archives.length,
  classes: [{ id: 'pro', name: 'Pro' }, { id: 'am', name: 'Am' }],
  launches: archives.map((file, index) => ({
    index,
    completedAt: '',
    archive: file,
    gridOrder: [0, 1, 2],
    classification: null,
    ...(carClasses ? { carClasses } : {}),
    name: ['Warm-up', 'Qualifying', 'Race'][index] ?? null,
  })),
});

/**
 * A session of two classes the player finished second in overall and first
 * in their own: a Pro car ahead, an Am car behind.
 * @param file Its file name
 * @param type Assetto Corsa's numeric type for it
 * @returns The archive
 */
const twoClassSession = (file: string, type = 3): ResultRecord => archive(file, '2026-05-03T10:00:00Z', {
  summary: {
    track: 'magione',
    sessions: [{
      ...session(type, 'Two classes'),
      standings: [1, 0, 2].map((slot, at) => ({
        position: at + 1,
        driver: `Driver ${slot}`,
        car: 'test_car',
        skin: 'red',
        laps: 5,
        cuts: 0,
        bestLap: 90_000 + at,
        totalTime: 0,
        slot,
        ...(slot === 0 ? { player: true } : {}),
      })),
    }],
  },
});

describe('renderer/lib/result-events/result-events', () => {
  describe('sessionTypeOf', () => {
    it('names Assetto Corsa\'s numeric session types', () => {
      expect([1, 2, 3, 4, 5, 6, 7].map(sessionTypeOf))
        .toEqual(['practice', 'qualify', 'race', 'hotlap', 'timeAttack', 'drift', 'drag']);
    });

    it('reads a code AC never writes as practice', () => {
      expect(sessionTypeOf(0)).toBe('practice');
    });
  });

  describe('archiveOrigins', () => {
    it('finds the season, round and launch behind every archive the career filed', () => {
      const origins = archiveOrigins(career());

      expect(origins.get('race.json')).toMatchObject({ season: 0, round: 'r1', launch: 1 });
      expect(origins.get('quali.json')?.launch).toBe(0);
    });

    it('finds nothing before the career has loaded', () => {
      expect(archiveOrigins(null).size).toBe(0);
    });
  });

  describe('raceTitle', () => {
    it('takes the session\'s name off an event launch', () => {
      expect(raceTitle(archive('a.json', '2026-05-03T10:00:00Z'))).toBe('Evening sprint');
    });

    it('takes a session type off as well as the session\'s own name', () => {
      const record = archive('a.json', '2026-05-03T10:00:00Z', {
        raceName: 'Evening sprint - Qualifying',
        summary: { track: 'magione', sessions: [session(2, 'Q')] },
      });

      expect(raceTitle(record)).toBe('Evening sprint');
    });

    it('keeps a race whose own name holds the separator whole', () => {
      expect(raceTitle(archive('a.json', '', { raceName: 'Spa - Francorchamps' }))).toBe('Spa - Francorchamps');
    });

    it('reads an archive with no race name as an empty title', () => {
      expect(raceTitle(archive('a.json', '', { raceName: undefined }))).toBe('');
    });
  });

  describe('quickOrigins', () => {
    it('finds every archive a race still lists, with the launch that wrote it', () => {
      const listed = quickRace(['warm-up.json', 'quali.json']);
      const origins = quickOrigins([listed]);

      expect([...origins.keys()]).toEqual(['warm-up.json', 'quali.json']);
      expect(origins.get('quali.json')).toEqual({ race: listed, launch: listed.launches[1] });
    });

    it('finds nothing before the races have been read', () => {
      expect(quickOrigins(null).size).toBe(0);
    });
  });

  describe('resultEvents', () => {
    it('gathers a race event\'s launches into one event, however many days they took', () => {
      const [event, ...rest] = resultEvents([
        archive('quali.json', '2026-05-04T10:00:00Z'),
        archive('warm-up.json', '2026-05-03T10:00:00Z'),
      ], new Map(), quickOrigins([quickRace(['warm-up.json', 'quali.json'])]));

      expect(rest).toEqual([]);
      expect(event).toMatchObject({
        key: 'quick/quick-1', title: 'Evening sprint', from: '2026-05-03T10:00:00Z', to: '2026-05-04T10:00:00Z',
      });
      expect(event.quick?.race.id).toBe('quick-1');
    });

    it('names a race event\'s session by its own name', () => {
      const [event] = resultEvents(
        [archive('warm-up.json', '2026-05-03T10:00:00Z')],
        new Map(),
        quickOrigins([quickRace(['warm-up.json'])]),
      );

      expect(event.sessions[0].name).toBe('Warm-up');
    });

    // A fixed bug: a race event of several classes showed the player's place
    // overall, where a round's card shows it in their class.
    it('places the player in their own class in a race event of several', () => {
      const [event] = resultEvents(
        [twoClassSession('race.json')],
        new Map(),
        quickOrigins([quickRace(['race.json'], ['am', 'pro', 'am'])]),
      );

      expect(event.sessions[0].player?.position).toBe(2);
      expect(event.sessions[0].position).toBe(1);
    });

    it('places the player overall where the launch raced one class', () => {
      const [event] = resultEvents(
        [twoClassSession('race.json')],
        new Map(),
        quickOrigins([quickRace(['race.json'])]),
      );

      expect(event.sessions[0].position).toBe(2);
    });

    // A race deleted or started over no longer holds those results, so linking
    // them to it would open a race showing others.
    it('leaves an archive no race lists any more on its own, unlinked', () => {
      const events = resultEvents([
        archive('new.json', '2026-05-04T10:00:00Z'),
        archive('old.json', '2026-05-03T10:00:00Z'),
      ], new Map(), quickOrigins([quickRace(['new.json'])]));

      expect(events.map((one) => one.quick === null)).toEqual([false, true]);
      expect(events[1].key).toBe('quick-1@2026-05-03');
    });

    it('files an archive the career claims under its round, whatever a race lists', () => {
      const [event] = resultEvents(
        [archive('race.json', '2026-05-03T11:00:00Z')],
        archiveOrigins(career()),
        quickOrigins([quickRace(['race.json'])]),
      );

      expect(event.origin?.round).toBe('r1');
      expect(event.quick).toBeNull();
    });

    it('gathers a race\'s launches on one day into one event, in the order they ran', () => {
      const events = resultEvents([
        archive('race.json', '2026-05-03T11:00:00Z'),
        archive('quali.json', '2026-05-03T10:00:00Z', {
          raceName: 'Evening sprint - Qualifying',
          summary: { track: 'magione', sessions: [session(2, 'Qualifying')] },
        }),
      ], new Map());

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        title: 'Evening sprint', from: '2026-05-03T10:00:00Z', to: '2026-05-03T11:00:00Z', origin: null,
      });
      expect(events[0].sessions.map((one) => one.type)).toEqual(['qualify', 'race']);
    });

    it('splits the same race run on two days', () => {
      const events = resultEvents([
        archive('b.json', '2026-05-04T10:00:00Z'),
        archive('a.json', '2026-05-03T10:00:00Z'),
      ], new Map());

      expect(events).toHaveLength(2);
    });

    // A fixed bug: events were merged only when their archives sat side by
    // side, so a quick race run between two launches of a round split the
    // round across two cards.
    it('keeps an event whole when another race ran between its launches', () => {
      const origins = archiveOrigins(career());
      const events = resultEvents([
        archive('race.json', '2026-05-03T12:00:00Z', { raceId: 'test-cup/r1' }),
        archive('quick.json', '2026-05-03T11:00:00Z'),
        archive('quali.json', '2026-05-03T10:00:00Z', {
          raceId: 'test-cup/r1',
          summary: { track: 'magione', sessions: [session(2, 'Qualifying')] },
        }),
      ], origins);

      expect(events.map((one) => one.sessions.length)).toEqual([2, 1]);
      expect(events[0].sessions.map((one) => one.record.file)).toEqual(['quali.json', 'race.json']);
    });

    it('keeps the same round of two seasons apart', () => {
      const origins = new Map<string, ArchiveOrigin>([
        ['new.json', { season: 1, entry: seasonEntry(), round: 'r1', launch: 1 }],
        ['old.json', { season: 0, entry: seasonEntry(), round: 'r1', launch: 1 }],
      ]);
      const events = resultEvents([
        archive('new.json', '2027-05-03T10:00:00Z'),
        archive('old.json', '2026-05-03T10:00:00Z'),
      ], origins);

      expect(events).toHaveLength(2);
    });

    it('keeps the same round of two editions of one season apart', () => {
      const origins = new Map<string, ArchiveOrigin>([
        ['spring.json', { season: 0, entry: seasonEntry(), round: 'r1', launch: 1 }],
        ['autumn.json', { season: 0, entry: { ...seasonEntry(), edition: 2 }, round: 'r1', launch: 1 }],
      ]);
      const events = resultEvents([
        archive('autumn.json', '2026-10-04T10:00:00Z'),
        archive('spring.json', '2026-04-05T10:00:00Z'),
      ], origins);

      expect(events).toHaveLength(2);
    });

    it('names a championship\'s session by its format and reads what the player took', () => {
      const [event] = resultEvents(
        [archive('race.json', '2026-05-03T11:00:00Z'), archive('quali.json', '2026-05-03T10:00:00Z')],
        archiveOrigins(career()),
      );
      const [qualified, raced] = event.sessions;

      expect(qualified.name).toBe('Qualifying');
      expect(raced.name).toBeNull();
      expect(raced.place?.position).toBe(1);
      expect(qualified.place).toBeNull();
    });

    it('places the player in a round\'s race by its score, and elsewhere by the archive', () => {
      // Fourth overall in both archives, and first in class by the race's score.
      const fourth = { ...session(3, 'Race').standings[0], position: 4 };
      const [event] = resultEvents([
        archive('race.json', '2026-05-03T11:00:00Z', {
          summary: { track: 'magione', sessions: [{ ...session(3, 'Race'), standings: [fourth] }] },
        }),
        archive('quali.json', '2026-05-03T10:00:00Z', {
          summary: { track: 'magione', sessions: [{ ...session(2, 'Qualifying'), standings: [fourth] }] },
        }),
      ], archiveOrigins(career()));

      expect(event.sessions.map((one) => one.position)).toEqual([4, 1]);
    });

    // A fixed bug: only a round's races were placed in class, off its score,
    // so its qualifying and practice read overall.
    it('places the player in their own class in a round\'s qualifying', () => {
      const base = seasonEntry();
      const [round] = base.events;
      const [qualifying, ...rest] = round.sessions;
      const entry: SeasonEntry = {
        ...base,
        events: [{
          ...round,
          sessions: [{ ...qualifying, gridOrder: [0, 1, 2], carClasses: ['am', 'pro', 'am'] }, ...rest],
        }],
      };
      const origins = new Map<string, ArchiveOrigin>([['quali.json', { season: 0, entry, round: 'r1', launch: 0 }]]);
      const [event] = resultEvents([twoClassSession('quali.json', 2)], origins);

      expect(event.sessions[0].place).toBeNull();
      expect(event.sessions[0].position).toBe(1);
    });

    it('names anything outside a championship by its kind alone', () => {
      const [event] = resultEvents([archive('a.json', '2026-05-03T10:00:00Z')], new Map());

      expect(event.sessions[0]).toMatchObject({ name: null, type: 'race', position: 1 });
      expect(event.sessions[0].player?.driver).toBe('Me');
    });

    it('skips an archive with no session in it', () => {
      const empty = archive('a.json', '2026-05-03T10:00:00Z', { summary: { track: 'magione', sessions: [] } });

      expect(resultEvents([empty], new Map())).toEqual([]);
    });
  });
});
