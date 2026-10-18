import { describe, expect, it } from '@jest/globals';

import type {
  Career, DriverStanding, EventStatus, SeasonEntry,
} from '../../../types/index.ts';
import { standaloneEntry, standaloneStanding } from '../standalone.ts';

/**
 * A row of a class's table.
 * @param seat Whose seat it is
 * @param position Where it stands
 * @param points The points it holds
 * @param substitute Whether it is the stand-in who raced the seat without the
 * player
 * @returns The row
 */
const row = (seat: string, position: number, points: number, substitute?: true): DriverStanding => (
  {
    seat, position, points, ...(substitute ? { substitute } : {}),
  } as DriverStanding
);

/**
 * The one edition a standalone championship races: three rounds a week apart
 * from 1 March, the player in the class's last seat.
 * @param statuses Each round's state
 * @param drivers The class's table
 * @returns The entry
 */
const edition = (statuses: readonly EventStatus[], drivers: readonly DriverStanding[] = []): SeasonEntry => ({
  series: 'cup',
  edition: 0,
  entry: 'main',
  playerSeat: 'main-3',
  events: statuses.map((status, at) => ({
    round: `r${at}`,
    status,
    date: ['2026-03-01', '2026-03-08', '2026-03-15'][at],
    ...(status === 'raced' ? { score: {} } : {}),
  })),
  standings: { classes: [{ entry: 'main', drivers }], updatedAt: '' },
} as unknown as SeasonEntry);

/**
 * A career of a kind holding the entry given as its one season's.
 * @param kind Which kind of career
 * @param entry Its one entry, or none
 * @param date The day its clock stands at
 * @returns The career
 */
const careerOf = (kind: Career['kind'], entry?: SeasonEntry, date = '2026-03-01'): Career => ({
  kind,
  date,
  seasons: [{ entries: entry ? [entry] : [] }],
} as unknown as Career);

describe('shared/utils/standalone', () => {
  describe('standaloneEntry', () => {
    it('reads the one edition a standalone championship races', () => {
      const entry = edition(['scheduled']);

      expect(standaloneEntry(careerOf('championship', entry))).toBe(entry);
    });

    it('is null for a career, whatever it has entered', () => {
      expect(standaloneEntry(careerOf('career', edition(['scheduled'])))).toBeNull();
    });

    it('is null for a standalone championship with nothing entered', () => {
      expect(standaloneEntry(careerOf('championship'))).toBeNull();
    });
  });

  describe('standaloneStanding', () => {
    it('is null for a career', () => {
      expect(standaloneStanding(careerOf('career', edition(['raced'])))).toBeNull();
    });

    it('places nobody before a round has scored', () => {
      const standing = standaloneStanding(careerOf('championship', edition(
        ['scheduled', 'scheduled', 'scheduled'],
        [row('main-1', 1, 0), row('main-3', 2, 0)],
      )));

      expect(standing).toEqual({
        rounds: 3, done: 0, position: null, points: 0, over: false,
      });
    });

    it('counts raced and missed rounds as behind it and reads the player\'s own row', () => {
      const standing = standaloneStanding(careerOf('championship', edition(
        ['raced', 'missed', 'scheduled'],
        [row('main-1', 1, 40), row('main-3', 2, 25)],
      ), '2026-03-08'));

      expect(standing).toEqual({
        rounds: 3, done: 2, position: 2, points: 25, over: false,
      });
    });

    // The stand-in who raced a missed round holds a row of the seat's own,
    // which is not where the player stands.
    it('passes over the stand-in in the player\'s seat', () => {
      const standing = standaloneStanding(careerOf('championship', edition(
        ['raced', 'scheduled', 'scheduled'],
        [row('main-3', 1, 25, true), row('main-1', 2, 18), row('main-3', 3, 10)],
      )));

      expect(standing?.position).toBe(3);
      expect(standing?.points).toBe(10);
    });

    it('is over once every round has run and the last is behind the clock', () => {
      const entry = edition(['raced', 'raced', 'missed'], [row('main-3', 1, 50)]);

      expect(standaloneStanding(careerOf('championship', entry, '2026-03-14'))?.over).toBe(false);
      expect(standaloneStanding(careerOf('championship', entry, '2026-03-15'))?.over).toBe(true);
    });
  });
});
