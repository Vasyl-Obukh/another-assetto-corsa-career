import { describe, expect, it } from '@jest/globals';

import type {
  Career, LedgerLine, SeasonEvent, SponsorDeal,
} from '../../../../../shared/types';
import { ratingFloor } from '../../../../../shared/utils/career-eligibility';
import { dealRows, lockedSlots, paidIn } from '../utils.ts';

/**
 * A round of the cup the player drove, finishing where it says.
 * @param date The ISO date it ran
 * @param place The player's class place
 * @returns The round
 */
const round = (date: string, place: number): SeasonEvent => ({
  raceId: `cup/${date}@0.0`,
  date,
  score: {
    races: [{
      launch: 1,
      name: 'Race',
      places: [
        {
          entry: 'main', seat: 'player', classPosition: place, qualifyingPosition: null, finishPoints: 10,
        },
        {
          entry: 'main', seat: 'rival', classPosition: place === 1 ? 2 : 1, qualifyingPosition: null, finishPoints: 8,
        },
      ],
    }],
  },
} as unknown as SeasonEvent);

/**
 * A deal backing any racing, asking only that the player start.
 * @param id Its id
 * @param signed The day it was signed
 * @param over What to change about it
 * @returns The deal
 */
const deal = (id: string, signed: string, over: Partial<SponsorDeal> = {}): SponsorDeal => ({
  id,
  sponsor: { name: id, trade: 'oil', nation: 'GBR' },
  slot: 'partner',
  covers: null,
  perks: [{ kind: 'racePay', amount: 200 }],
  target: { kind: 'start' },
  goal: { kind: 'racesStarted', count: 20 },
  rung: 5,
  signed,
  until: `${Number(signed.slice(0, 4)) + 1}${signed.slice(4)}`,
  ...over,
});

/**
 * A sponsor's line in the ledger.
 * @param of The deal it is for
 * @param amount What it moved
 * @param season The season it fell in
 * @returns The line
 */
const sponsorLine = (of: string, amount: number, season = 0): LedgerLine => ({
  key: `sponsor:${of}:${amount}:${season}`,
  kind: 'sponsor',
  date: '2026-06-01',
  season,
  amount,
  sponsor: { deal: of, name: of, perk: 'racePay' },
});

/**
 * A career at the rungs given, its first season racing the cup.
 * @param over What to change about it
 * @returns The career
 */
const career = (over: Partial<Career> = {}): Career => ({
  level: {
    road: 5, touring: 5, sportscar: 5, 'single-seater': 5,
  },
  sponsors: [],
  ledger: [],
  seasons: [{
    index: 0,
    entries: [{
      series: 'cup',
      edition: 0,
      entry: 'main',
      playerSeat: 'player',
      championship: { entries: [{ id: 'main', ladder: { discipline: 'road', tier: 5 } }] },
      events: [round('2026-03-01', 1), round('2026-05-01', 3), round('2026-07-01', 2)],
    }],
  }],
  ...over,
} as unknown as Career);

describe('renderer/screens/sponsors/utils', () => {
  describe('dealRows', () => {
    it('lists every deal newest first, with what it paid, the races it covered and how it ended', () => {
      const old = deal('old', '2026-01-01', { ended: { on: '2026-04-01', why: 'mine' } });
      const live = deal('live', '2026-04-01');
      const rows = dealRows(career({
        sponsors: [old, live],
        ledger: [sponsorLine('old', 200), sponsorLine('live', 200), sponsorLine('live', 300), sponsorLine('other', 900)],
      }));

      expect(rows).toEqual([
        {
          deal: live, paid: 500, races: 2, end: 'running',
        },
        {
          deal: old, paid: 200, races: 1, end: 'mine',
        },
      ]);
    });

    it('says a deal was renewed once another year of it was signed', () => {
      const old = deal('old', '2026-01-01', { ended: { on: '2027-01-01', why: 'goalMet' } });
      const next = deal('next', '2027-01-10', { renews: 'old' });
      const rows = dealRows(career({ sponsors: [old, next] }));

      expect(rows.map((row) => row.end)).toEqual(['running', 'renewed']);
    });

    it('lists nothing for a career no sponsor ever backed', () => {
      expect(dealRows(career())).toEqual([]);
    });
  });

  describe('lockedSlots', () => {
    it('lists every rung above the best held, nearest first, at the rating that reaches it', () => {
      const rows = lockedSlots(career({
        level: {
          road: 3, touring: 5, sportscar: 4, 'single-seater': 5,
        },
      }));

      expect(rows).toEqual([{ rung: 2, rating: ratingFloor(2) }, { rung: 1, rating: ratingFloor(1) }]);
    });

    it('lists nothing at the top rung', () => {
      expect(lockedSlots(career({
        level: {
          road: 1, touring: 4, sportscar: 5, 'single-seater': 5,
        },
      }))).toEqual([]);
    });

    it('reads every rung below Rookie as Rookie', () => {
      const below = career({
        level: {
          road: 7, touring: 7, sportscar: 7, 'single-seater': 7,
        },
      });

      expect(lockedSlots(below)).toEqual(lockedSlots(career()));
      expect(lockedSlots(below).map((one) => one.rung)).toEqual([4, 3, 2, 1]);
    });
  });

  describe('paidIn', () => {
    it("sums one season's sponsor lines, a repayment taken off", () => {
      const paid = career({
        ledger: [
          sponsorLine('a', 5000),
          sponsorLine('a', -2000),
          sponsorLine('b', 400),
          sponsorLine('b', 700, 1),
          {
            key: 'race:x', kind: 'race', date: '2026-06-01', season: 0, amount: 9000,
          },
        ],
      });

      expect(paidIn(paid, 0)).toBe(3400);
      expect(paidIn(paid, 1)).toBe(700);
      expect(paidIn(paid, 2)).toBe(0);
    });
  });
});
