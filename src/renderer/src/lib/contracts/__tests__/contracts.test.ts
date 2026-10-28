import { describe, expect, it } from '@jest/globals';

import { Discipline, TeamBudget } from '../../../../../shared/types';
import type {
  Career, CareerSeason, Contract, LedgerLine, Mail, SeasonEntry, SeasonEvent,
} from '../../../../../shared/types';
import {
  contractEnd, contractFigures, contractOrigin, contractRows, keepMark,
} from '../contracts.ts';

/**
 * A contract with the cup's independent team.
 * @param overrides What to change about it
 * @returns The contract
 */
const contract = (overrides: Partial<Contract> = {}): Contract => ({
  team: 'indie',
  teamName: 'Indie Racing',
  budget: TeamBudget.INDEPENDENT,
  entry: 'main',
  seat: 'main-2',
  car: { model: 'test_car' },
  pay: 'free',
  amount: 0,
  feeCover: 1,
  prizeShare: 50,
  keep: 3,
  offer: 'offer:cup:0.0',
  signed: '2026-01-10',
  ...overrides,
});

/**
 * A round of the cup.
 * @param date Its day
 * @param status Whether it has been raced
 * @returns The round
 */
const round = (date: string, status: SeasonEvent['status'] = 'raced'): SeasonEvent => ({
  round: date, raceId: `cup/${date}@0.0`, date, status, sessions: [],
});

/**
 * A season of the cup raced under a contract, the player P2 and their teammate
 * P5 in a class of four.
 * @param overrides What to change about it
 * @returns The entry
 */
const entry = (overrides: Partial<SeasonEntry> = {}): SeasonEntry => ({
  series: 'cup',
  edition: 0,
  championship: {
    id: 'cup',
    name: 'Sunday Cup',
    entries: [{
      id: 'main',
      name: 'Main',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      seats: [{ id: 'main-1', team: 'indie' }, { id: 'main-2', team: 'indie' }, { id: 'main-3' }, { id: 'main-4' }],
    }],
  } as unknown as SeasonEntry['championship'],
  entry: 'main',
  playerSeat: 'main-2',
  car: { model: 'test_car' },
  field: [],
  events: [round('2026-03-01'), round('2026-04-01')],
  standings: {
    classes: [{
      entry: 'main',
      name: 'Main',
      drivers: [
        {
          seat: 'main-2', driver: 'Player', team: 'indie', position: 2, points: 30, wins: 0, podiums: 2, bestFinish: 2, races: 2,
        },
        {
          seat: 'main-1', driver: 'Mate', team: 'indie', position: 5, points: 5, wins: 0, podiums: 0, bestFinish: 5, races: 2,
        },
      ],
      teams: [],
    }],
    updatedAt: '',
  },
  contract: contract(),
  ...overrides,
});

/**
 * A ledger line of the cup's first season.
 * @param key What it settles
 * @param kind What kind of line
 * @param amount How much
 * @param series Which championship
 * @returns The line
 */
const line = (key: string, kind: LedgerLine['kind'], amount: number, series = 'cup'): LedgerLine => ({
  key, kind, date: '2026-03-01', season: 0, amount, series, edition: 0,
});

/**
 * A career whose seasons, ledger and inbox are the ones given.
 * @param seasons Its seasons' entries, a season each
 * @param ledger Its ledger
 * @param inbox Its mail
 * @param date The ISO date its clock stands at
 * @returns The career
 */
const career = (
  seasons: SeasonEntry[][],
  ledger: LedgerLine[] = [],
  inbox: Mail[] = [],
  date = '2026-12-01',
): Career => ({
  date,
  ledger,
  inbox,
  seasons: seasons.map((entries, index): CareerSeason => ({
    index, startDate: `${2026 + index}-01-01`, endDate: `${2026 + index}-12-31`, entries,
  })),
} as unknown as Career);

describe('renderer/lib/contracts/contracts', () => {
  describe('contractOrigin', () => {
    it('says how a contract came to be signed', () => {
      expect(contractOrigin(contract())).toBe('offered');
      expect(contractOrigin(contract({
        renews: {
          season: 0, edition: 0, place: 2, amount: 0, feeCover: 1, prizeShare: 50,
        },
      }))).toBe('renewal');
      expect(contractOrigin(contract({ bought: true }))).toBe('bought');
      expect(contractOrigin(contract({ lifeline: true }))).toBe('lifeline');
    });
  });

  describe('contractEnd', () => {
    it('is terminated once ended, whatever its team decided', () => {
      expect(contractEnd(entry(), contract({ ended: '2026-03-15', kept: 'renewed' }), '2026-12-01')).toBe('terminated');
    });

    // Guards a fix: a contract whose team had decided while the run was still
    // being raced dropped out of what the player holds now.
    it('is running while the run has rounds to race, even once its team has decided', () => {
      const racing = entry({ events: [round('2026-03-01'), round('2026-09-01', 'scheduled')] });

      expect(contractEnd(racing, contract({ kept: 'released' }), '2026-04-01')).toBe('running');
      expect(contractEnd(racing, contract({ kept: 'renewed' }), '2026-04-01')).toBe('running');
    });

    it('says what came of the team deciding once the run is over', () => {
      expect(contractEnd(entry(), contract({ kept: 'renewed' }), '2026-12-01')).toBe('renewed');
      expect(contractEnd(entry(), contract({ kept: 'released' }), '2026-12-01')).toBe('released');
      expect(contractEnd(entry(), contract({ kept: 'offered' }), '2026-12-01')).toBe('completed');
      expect(contractEnd(entry(), contract(), '2026-12-01')).toBe('completed');
    });
  });

  describe('keepMark', () => {
    it('is on course or short of it once the player has a place', () => {
      expect(keepMark(contract(), { place: 2, kept: true })).toBe('kept');
      expect(keepMark(contract(), { place: 8, kept: false })).toBe('short');
    });

    it('says nothing before the player has raced, unless the team asks nothing', () => {
      expect(keepMark(contract(), { place: null, kept: false })).toBeNull();
      expect(keepMark({}, { place: null, kept: true })).toBe('kept');
    });
  });

  describe('contractRows', () => {
    it('lists every contract the career signed, the newest first, skipping seasons raced on the player\'s own', () => {
      const own = entry({ series: 'own-cup', contract: undefined });
      const rows = contractRows(career([[entry()], [own, entry({ series: 'next-cup' })]]));

      expect(rows.map((row) => [row.season.index, row.entry.series])).toEqual([[1, 'next-cup'], [0, 'cup']]);
    });

    it('reads where the player stands and how many rounds they raced', () => {
      const [row] = contractRows(career([[entry()]]));

      expect(row).toMatchObject({
        end: 'completed', origin: 'offered', raced: 2, standing: { place: 2, mate: 5, kept: true },
      });
    });

    it('sums what the run paid and cost off its own ledger lines, never another\'s', () => {
      const ledger = [
        line('race:cup/2026-03-01@0.0:2', 'race', 4_000),
        line('standings:0:cup:0', 'standings', 6_000),
        line('fine:cup/2026-04-01@0.0', 'fine', -1_000),
        line('fee:cup/2026-03-01@0.0', 'fee', -500),
        line('rent:cup/2026-03-01@0.0', 'rent', -300),
        line('race:other/x', 'race', 9_000, 'other'),
      ];
      const [row] = contractRows(career([[entry()]], ledger));

      expect(row.earned).toBe(10_000);
      expect(row.paid).toBe(-1_500);
    });

    it('says a renewal offered is still to answer, or was turned down once it no longer waits', () => {
      const renewing = (deadline: string): Mail => ({
        id: 'offer:cup:1.0',
        kind: 'offer',
        season: 1,
        arrived: '2027-01-01',
        opened: true,
        deadline,
        offers: [{
          renews: {
            season: 0, edition: 0, place: 2, amount: 0, feeCover: 1, prizeShare: 50,
          },
          series: 'cup',
        } as unknown as NonNullable<Mail['offers']>[number]],
      });
      const offered = [[entry({ contract: contract({ kept: 'offered' }) })]];

      expect(contractRows(career(offered, [], [renewing('2027-01-15')], '2027-01-05'))[0].renewal).toBe('awaiting');
      expect(contractRows(career(offered, [], [renewing('2027-01-15')], '2027-02-01'))[0].renewal).toBe('declined');
      expect(contractRows(career([[entry()]], [], [renewing('2027-01-15')], '2027-01-05'))[0].renewal).toBeNull();
    });
  });

  describe('contractFigures', () => {
    it('counts the contracts, how they came and the teams, and sums what they came to', () => {
      const rows = contractRows(career([
        [entry()],
        [entry({ contract: contract({ bought: true }) }), entry({ series: 'next-cup', contract: contract({ team: 'other' }) })],
      ], [line('race:a', 'race', 2_000), line('seat:b', 'seat', -800)]));

      expect(contractFigures(rows)).toEqual({
        signed: 3,
        origins: {
          offered: 2, renewal: 0, bought: 1, lifeline: 0,
        },
        teams: 2,
        earned: 2_000,
        paid: -800,
      });
    });
  });
});
