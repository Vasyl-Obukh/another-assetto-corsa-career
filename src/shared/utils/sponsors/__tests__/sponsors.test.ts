import { describe, expect, it } from '@jest/globals';

import {
  makeCareer, makeDeal, makeEntry, makeEvent, makePlace, makeRace, makeSeason, makeStanding, racedCareer,
} from './fixtures.ts';
import { Discipline } from '../../../types/index.ts';
import type {
  Contract, DriverStanding, LedgerLine, SeasonEntry, SeasonStandings, SponsorDeal,
} from '../../../types/index.ts';
import { NO_SEAT_LIFT } from '../constants.ts';
import {
  afterShares,
  backingOf,
  bestRung,
  carBackingDeal,
  climbNewsId,
  costShares,
  coveringDeal,
  coversEntry,
  dealCovers,
  dealEnd,
  dealLines,
  dealPaid,
  dealRung,
  dealScale,
  dealUntil,
  entryDiscipline,
  formOf,
  goalNewsId,
  goalSettled,
  goalStanding,
  invitationLift,
  judgedRaces,
  liveDeals,
  partnerSlots,
  percentOf,
  perkOf,
  placeIs,
  repaintDeal,
  rewardWorth,
  seatBackedIn,
  seatBacker,
  seatBackingDeal,
  seatLift,
  signingRepay,
  slotFree,
  sponsorFigure,
  sponsorMailId,
  sponsorNewsId,
  sponsorRenewalId,
  topOf,
} from '../sponsors.ts';

/**
 * Every discipline on one rung.
 * @param rung The rung, 1 being the top
 * @returns The levels
 */
const levels = (rung: number): Record<Discipline, number> => ({
  [Discipline.SINGLE_SEATER]: rung,
  [Discipline.SPORTSCAR]: rung,
  [Discipline.TOURING]: rung,
  [Discipline.ROAD]: rung,
});

/**
 * A sponsor's ledger line.
 * @param deal The deal, by id
 * @param amount What it moved
 * @returns The line
 */
const sponsorLedgerLine = (deal: string, amount: number): LedgerLine => ({
  key: `sponsor:${deal}:${amount}`,
  kind: 'sponsor',
  date: '2027-03-01',
  season: 0,
  amount,
  sponsor: { deal, name: 'Halden Lubricants', perk: 'racePay' },
});

/**
 * The cup's table.
 * @param drivers Its rows
 * @returns The standings
 */
const tableOf = (drivers: readonly DriverStanding[]): SeasonStandings => ({
  classes: [{
    entry: 'main', name: 'Main', drivers, teams: [],
  }],
  updatedAt: '2027-03-02T00:00:00.000Z',
});

/**
 * A season holding one entry.
 * @param entry The entry
 * @returns The season
 */
const makeSeasonOf = (entry: SeasonEntry) => makeSeason([entry]);

/**
 * A deal holding seat backing, signed for the career's year.
 * @param over Whatever the test wants said differently
 * @returns The deal
 */
const seatDeal = (over: Partial<SponsorDeal> = {}): SponsorDeal => makeDeal({
  id: 'seat-deal', slot: 'main', perks: [{ kind: 'seatBacking', share: 50 }], ...over,
});

/**
 * A season's entry raced in a seat a deal paid half of.
 * @param deal The deal, by id
 * @param over Whatever the test wants said differently
 * @returns The entry
 */
const backedEntry = (deal: string, over: Partial<SeasonEntry> = {}): SeasonEntry => makeEntry({
  contract: { teamName: 'Works Racing', backed: { deal, amount: 1000 } } as Contract,
  events: [makeEvent('one', '2027-09-01')],
  ...over,
});

describe('shared/utils/sponsors', () => {
  describe('sponsorMailId', () => {
    it('names the offer after the round that drew it', () => {
      expect(sponsorMailId('test-cup/one@0.0')).toBe('sponsor:test-cup/one@0.0');
    });
  });

  describe('sponsorNewsId', () => {
    it('names the news after the deal it is about', () => {
      expect(sponsorNewsId('sponsor:test-cup/one@0.0')).toBe('sponsorNews:sponsor:test-cup/one@0.0');
    });
  });

  describe('bestRung', () => {
    it('is the highest rung any discipline holds', () => {
      expect(bestRung({ ...levels(5), [Discipline.TOURING]: 2 })).toBe(2);
    });
  });

  describe('partnerSlots', () => {
    it('holds one at Rookie and one more each rung up', () => {
      expect(partnerSlots(levels(5))).toBe(1);
      expect(partnerSlots(levels(4))).toBe(2);
      expect(partnerSlots(levels(1))).toBe(5);
    });

    it('counts on the best discipline alone', () => {
      expect(partnerSlots({ ...levels(5), [Discipline.ROAD]: 3 })).toBe(3);
    });

    it('holds Rookie\'s on any rung below the ladder\'s lowest', () => {
      expect(partnerSlots(levels(9))).toBe(1);
    });
  });

  describe('dealUntil', () => {
    it('runs out on the same date a year on', () => {
      expect(dealUntil('2027-03-14')).toBe('2028-03-14');
    });

    it('runs out on the last day of February for a deal signed on the 29th', () => {
      expect(dealUntil('2028-02-29')).toBe('2029-02-28');
    });
  });

  describe('dealEnd', () => {
    it('is the year\'s end for a deal still running', () => {
      expect(dealEnd(makeDeal())).toBe('2028-01-01');
    });

    it('is the day a deal ended early', () => {
      expect(dealEnd(makeDeal({ ended: { on: '2027-06-01', why: 'mine' } }))).toBe('2027-06-01');
    });

    it('is still the year\'s end for a deal ended on its anniversary or later', () => {
      expect(dealEnd(makeDeal({ ended: { on: '2028-01-05', why: 'goalMet' } }))).toBe('2028-01-01');
    });
  });

  describe('dealCovers', () => {
    // Guards a fix: an offer arrives on the day of the round that drew it, so
    // a deal signed that day was paying for that round after the fact.
    it('does not cover the day it was signed', () => {
      expect(dealCovers(makeDeal(), '2027-01-01')).toBe(false);
    });

    it('covers every day after signing until its end, which it does not', () => {
      const deal = makeDeal();

      expect(dealCovers(deal, '2027-01-02')).toBe(true);
      expect(dealCovers(deal, '2027-12-31')).toBe(true);
      expect(dealCovers(deal, '2028-01-01')).toBe(false);
    });

    it('stops on the day a deal ended early', () => {
      const deal = makeDeal({ ended: { on: '2027-06-01', why: 'replaced' } });

      expect(dealCovers(deal, '2027-05-31')).toBe(true);
      expect(dealCovers(deal, '2027-06-01')).toBe(false);
    });
  });

  describe('liveDeals', () => {
    it('lists the deals still running, a main sponsor first', () => {
      const partner = makeDeal({ id: 'a' });
      const ended = makeDeal({ id: 'b', ended: { on: '2027-03-01', why: 'mine' } });
      const main = makeDeal({ id: 'c', slot: 'main' });

      expect(liveDeals({ sponsors: [partner, ended, main] }).map((deal) => deal.id)).toEqual(['c', 'a']);
    });
  });

  describe('entryDiscipline', () => {
    it('is the discipline the entry\'s class races in', () => {
      expect(entryDiscipline(makeEntry())).toBe(Discipline.ROAD);
    });

    it('is null for a class the championship no longer holds', () => {
      expect(entryDiscipline(makeEntry({ entry: 'gone' }))).toBeNull();
    });
  });

  describe('coversEntry', () => {
    it('covers every entry for a deal on any racing', () => {
      expect(coversEntry({ covers: null }, makeEntry())).toBe(true);
    });

    it('covers only its own discipline otherwise', () => {
      expect(coversEntry({ covers: Discipline.ROAD }, makeEntry())).toBe(true);
      expect(coversEntry({ covers: Discipline.TOURING }, makeEntry())).toBe(false);
    });
  });

  describe('topOf', () => {
    it('is the lowest place inside a share of the class', () => {
      expect(topOf(18, 1 / 2)).toBe(9);
      expect(topOf(10, 1 / 3)).toBe(3);
    });

    it('is never less than first', () => {
      expect(topOf(2, 1 / 4)).toBe(1);
    });
  });

  describe('placeIs', () => {
    it('counts first alone as a win', () => {
      expect(placeIs('win', 1)).toBe(true);
      expect(placeIs('win', 2)).toBe(false);
    });

    it('counts the top three as a podium', () => {
      expect(placeIs('podium', 3)).toBe(true);
      expect(placeIs('podium', 4)).toBe(false);
    });
  });

  describe('judgedRaces', () => {
    it('judges each race the player drove inside the deal, oldest first', () => {
      const career = racedCareer([
        makeEvent('two', '2027-04-01', [makeRace(0, makePlace(3))]),
        makeEvent('one', '2027-03-01', [makeRace(0, makePlace(1))]),
      ]);

      const races = judgedRaces(career, makeDeal());

      expect(races.map((one) => one.event.round)).toEqual(['one', 'two']);
      expect(races.map((one) => one.onTarget)).toEqual([true, false]);
      expect(races.map((one) => one.size)).toEqual([4, 4]);
      expect(races.every((one) => one.paid)).toBe(true);
    });

    it('leaves out a race simulated, raced by a stand-in or only scoring qualifying', () => {
      const career = racedCareer([makeEvent('one', '2027-03-01', [
        makeRace(0, makePlace(1), { simulated: true }),
        makeRace(1, makePlace(1, { substitute: true })),
        makeRace(2, makePlace(1, { bonusOnly: true })),
      ])]);

      expect(judgedRaces(career, makeDeal())).toEqual([]);
    });

    it('leaves out rounds outside the deal and entries it does not cover', () => {
      const events = [
        makeEvent('one', '2027-01-01', [makeRace(0, makePlace(1))]),
        makeEvent('two', '2028-02-01', [makeRace(0, makePlace(1))]),
      ];

      expect(judgedRaces(racedCareer(events), makeDeal())).toEqual([]);
      expect(judgedRaces(
        racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(1))])]),
        makeDeal({ covers: Discipline.TOURING }),
      )).toEqual([]);
    });

    it('marks the round\'s first race the player drove', () => {
      const career = racedCareer([makeEvent('one', '2027-03-01', [
        makeRace(0, makePlace(1), { simulated: true }),
        makeRace(1, makePlace(2)),
        makeRace(2, makePlace(2)),
      ])]);

      expect(judgedRaces(career, makeDeal()).map((one) => one.first)).toEqual([true, false]);
    });

    it('judges a qualifying target on the round\'s first race alone', () => {
      const career = racedCareer([makeEvent('one', '2027-03-01', [
        makeRace(0, makePlace(4, { qualifyingPosition: 1 })),
        makeRace(1, makePlace(4, { qualifyingPosition: 1 })),
      ])]);

      const races = judgedRaces(career, makeDeal({ target: { kind: 'qualifying', share: 1 / 2 } }));

      expect(races.map((one) => one.onTarget)).toEqual([true, false]);
      expect(races.map((one) => one.paid)).toEqual([true, false]);
    });

    it('reads a qualifying place outside the share as short, and no grid set as on target', () => {
      const deal = makeDeal({ target: { kind: 'qualifying', share: 1 / 2 } });
      const short = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(1, { qualifyingPosition: 3 }))])]);
      const none = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(4))])]);

      expect(judgedRaces(short, deal)[0].onTarget).toBe(false);
      expect(judgedRaces(none, deal)[0].onTarget).toBe(true);
    });

    it('asks a teammate target to finish ahead of the teammate', () => {
      const deal = makeDeal({ target: { kind: 'teammate' } });
      // The player third, their teammate seat-1 taking first.
      const behind = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(3))])]);
      // The player first, seat-1 second.
      const ahead = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(1))])]);

      expect(judgedRaces(behind, deal)[0].onTarget).toBe(false);
      expect(judgedRaces(ahead, deal)[0].onTarget).toBe(true);
    });

    it('meets a teammate target in a seat with no teammate', () => {
      const career = racedCareer(
        [makeEvent('one', '2027-03-01', [makeRace(0, makePlace(4, { seat: 'seat-4' }))])],
        {},
        { playerSeat: 'seat-4' },
      );

      expect(judgedRaces(career, makeDeal({ target: { kind: 'teammate' } }))[0].onTarget).toBe(true);
    });

    it('judges a clean target off the cut laps the race counted', () => {
      const deal = makeDeal({ target: { kind: 'clean', cuts: 2 } });
      const career = racedCareer([makeEvent('one', '2027-03-01', [
        makeRace(0, makePlace(4, { cuts: 2 })),
        makeRace(1, makePlace(4, { cuts: 3 })),
        makeRace(2, makePlace(4)),
      ])]);

      expect(judgedRaces(career, deal).map((one) => one.onTarget)).toEqual([true, false, true]);
    });

    it('meets a just-racing target in any race', () => {
      const career = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(4))])]);

      expect(judgedRaces(career, makeDeal({ target: { kind: 'start' } }))[0].onTarget).toBe(true);
    });
  });

  describe('goalStanding', () => {
    it('has nothing to judge before any race', () => {
      expect(goalStanding(makeCareer(), makeDeal({ goal: { kind: 'onTarget', share: 1 / 2 } }))).toEqual({
        reached: 0, needed: 1 / 2, met: false, onCourse: null,
      });
      expect(goalStanding(makeCareer(), makeDeal({ goal: { kind: 'championshipPlace', count: 3 } }))).toEqual({
        reached: 0, needed: 3, met: false, onCourse: null,
      });
    });

    it('reads a championship place off the class table', () => {
      const standings = {
        classes: [{
          entry: 'main',
          name: 'Main',
          drivers: [makeStanding('seat-1', 1), makeStanding('seat-2', 2), makeStanding('seat-3', 3)],
          teams: [],
        }],
        updatedAt: '2027-03-02T00:00:00.000Z',
      };
      const career = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(2))])], {}, { standings });

      expect(goalStanding(career, makeDeal({ goal: { kind: 'championshipPlace', count: 3 } }))).toEqual({
        reached: 2, needed: 3, met: true, onCourse: true,
      });
      expect(goalStanding(career, makeDeal({ goal: { kind: 'championshipPlace', count: 1 } }))).toEqual({
        reached: 2, needed: 1, met: false, onCourse: false,
      });
    });

    it('reads a championship place by share off the class\'s size, the substitute left out', () => {
      const standings = {
        classes: [{
          entry: 'main',
          name: 'Main',
          drivers: [
            makeStanding('seat-1', 1),
            makeStanding('seat-2', 2),
            makeStanding('seat-2', 3, { substitute: true }),
            makeStanding('seat-3', 4),
            makeStanding('seat-4', 5),
          ],
          teams: [],
        }],
        updatedAt: '2027-03-02T00:00:00.000Z',
      };
      const career = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(2))])], {}, { standings });

      expect(goalStanding(career, makeDeal({ goal: { kind: 'championshipPlace', share: 1 / 2 } }))).toEqual({
        reached: 2, needed: 2, met: true, onCourse: true,
      });
    });

    it('counts podiums, wins and poles, poles on the round\'s first race alone', () => {
      const career = racedCareer([
        makeEvent('one', '2027-03-01', [
          makeRace(0, makePlace(1, { qualifyingPosition: 1 })),
          makeRace(1, makePlace(3, { qualifyingPosition: 1 })),
        ]),
        makeEvent('two', '2027-04-01', [makeRace(0, makePlace(4))]),
      ]);
      const reached = (result: 'podium' | 'win' | 'pole'): number => goalStanding(
        career,
        makeDeal({ goal: { kind: 'resultCount', result, count: 5 } }),
      ).reached;

      expect(reached('podium')).toBe(2);
      expect(reached('win')).toBe(1);
      expect(reached('pole')).toBe(1);
    });

    it('is on course while a count keeps pace with the year', () => {
      const events = [makeEvent('one', '2027-03-01', [makeRace(0, makePlace(1)), makeRace(1, makePlace(1))])];
      const deal = makeDeal({ goal: { kind: 'resultCount', result: 'win', count: 4 } });

      // Half the year gone, two of four.
      expect(goalStanding(racedCareer(events, { date: '2027-07-02' }), deal)).toEqual({
        reached: 2, needed: 4, met: false, onCourse: true,
      });
      // Ten months gone, two of four is short.
      expect(goalStanding(racedCareer(events, { date: '2027-11-01' }), deal).onCourse).toBe(false);
    });

    it('is met once a count is reached', () => {
      const events = [makeEvent('one', '2027-03-01', [makeRace(0, makePlace(4)), makeRace(1, makePlace(4))])];

      expect(goalStanding(racedCareer(events), makeDeal({ goal: { kind: 'racesStarted', count: 2 } }))).toEqual({
        reached: 2, needed: 2, met: true, onCourse: true,
      });
    });

    it('reads an on-target goal as the share of races on target', () => {
      const events = [makeEvent('one', '2027-03-01', [
        makeRace(0, makePlace(1)),
        makeRace(1, makePlace(1)),
        makeRace(2, makePlace(1)),
        makeRace(3, makePlace(4)),
      ])];
      const standing = (share: number) => goalStanding(racedCareer(events), makeDeal({ goal: { kind: 'onTarget', share } }));

      expect(standing(3 / 4)).toEqual({
        reached: 3 / 4, needed: 3 / 4, met: true, onCourse: true,
      });
      expect(standing(1)).toMatchObject({ met: false, onCourse: false });
    });

    it('counts only the races a qualifying target is paid on towards an on-target share', () => {
      const events = [makeEvent('one', '2027-03-01', [
        makeRace(0, makePlace(4, { qualifyingPosition: 1 })),
        makeRace(1, makePlace(4, { qualifyingPosition: 1 })),
      ])];
      const deal = makeDeal({ target: { kind: 'qualifying', share: 1 / 2 }, goal: { kind: 'onTarget', share: 1 } });

      expect(goalStanding(racedCareer(events), deal)).toMatchObject({ reached: 1, met: true });
    });
  });

  describe('formOf', () => {
    it('is nothing before a round is raced', () => {
      expect(formOf(makeCareer())).toBeNull();
    });

    it('bands the average class finish by quarter', () => {
      const form = (place: number) => formOf(racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(place))])]));

      expect(form(1)).toBe('top');
      expect(form(2)).toBe('upper');
      expect(form(3)).toBe('lower');
      expect(form(4)).toBe('bottom');
    });

    it('averages over the rounds it reads', () => {
      const career = racedCareer([
        makeEvent('one', '2027-03-01', [makeRace(0, makePlace(2))]),
        makeEvent('two', '2027-04-01', [makeRace(0, makePlace(3))]),
      ]);

      expect(formOf(career)).toBe('lower');
    });

    it('reads each round on its best race', () => {
      const career = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(4)), makeRace(1, makePlace(1))])]);

      expect(formOf(career)).toBe('top');
    });

    it('reads the latest three rounds alone', () => {
      const career = racedCareer([
        makeEvent('one', '2027-02-01', [makeRace(0, makePlace(4))]),
        makeEvent('two', '2027-03-01', [makeRace(0, makePlace(1))]),
        makeEvent('three', '2027-04-01', [makeRace(0, makePlace(1))]),
        makeEvent('four', '2027-05-01', [makeRace(0, makePlace(1))]),
      ]);

      expect(formOf(career)).toBe('top');
    });

    it('ignores a round the player did not drive', () => {
      const career = racedCareer([makeEvent('one', '2027-03-01', [makeRace(0, makePlace(1), { simulated: true })])]);

      expect(formOf(career)).toBeNull();
    });
  });

  describe('dealLines', () => {
    it('lists the ledger lines one deal paid', () => {
      const ledger = [sponsorLedgerLine('a', 100), sponsorLedgerLine('b', 200), sponsorLedgerLine('a', 300)];

      expect(dealLines({ ledger }, 'a').map((line) => line.amount)).toEqual([100, 300]);
    });
  });

  describe('dealPaid', () => {
    it('sums what a deal paid, a repayment taken off', () => {
      const ledger = [sponsorLedgerLine('a', 1000), sponsorLedgerLine('a', -400), sponsorLedgerLine('b', 200)];

      expect(dealPaid({ ledger }, 'a')).toBe(600);
      expect(dealPaid({ ledger }, 'c')).toBe(0);
    });
  });

  describe('dealScale', () => {
    const climbing = makeDeal({ perks: [{ kind: 'climbs' }, { kind: 'racePay', amount: 500 }], rung: 4 });

    it('rises with the player to a new rung for a deal that climbs', () => {
      expect(dealScale(climbing, levels(3))).toBe(5000 / 3000);
    });

    it('never falls below the rung the deal was drawn at', () => {
      expect(dealScale(climbing, levels(5))).toBe(1);
    });

    it('is one for a deal that does not climb', () => {
      expect(dealScale(makeDeal(), levels(1))).toBe(1);
    });

    // Guards a fix: it read the career's best, so a deal covering a discipline
    // rung below it paid a climb's figures from the day it was signed.
    it('reads a deal covering a discipline on that discipline alone', () => {
      const road = { ...climbing, covers: Discipline.ROAD };
      const elsewhere = { ...levels(4), [Discipline.TOURING]: 1 };

      expect(dealScale(road, elsewhere)).toBe(1);
      expect(dealScale(road, { ...elsewhere, [Discipline.ROAD]: 3 })).toBe(5000 / 3000);
    });
  });

  describe('sponsorFigure', () => {
    it('scales a figure and rounds it to ten', () => {
      expect(sponsorFigure(500, 5000 / 3000)).toBe(830);
      expect(sponsorFigure(1234, 1)).toBe(1230);
    });
  });

  describe('signingRepay', () => {
    const signed = makeDeal({ perks: [{ kind: 'signing', amount: 7300 }] });

    it('repays the share of the signing bonus its year has left, to ten', () => {
      // 100 of 365 days left.
      expect(signingRepay(signed, '2027-09-23')).toBe(2000);
    });

    it('repays nothing once the year has run out', () => {
      expect(signingRepay(signed, '2028-02-01')).toBe(0);
    });

    it('repays nothing for a deal with no signing bonus', () => {
      expect(signingRepay(makeDeal(), '2027-03-01')).toBe(0);
    });
  });

  describe('sponsorRenewalId', () => {
    it('names a renewal after the deal it renews', () => {
      expect(sponsorRenewalId('deal')).toBe('sponsor:renew:deal');
    });
  });

  describe('goalNewsId', () => {
    it("names a goal's news after its deal", () => {
      expect(goalNewsId('deal')).toBe('sponsorNews:goal:deal');
    });
  });

  describe('climbNewsId', () => {
    it('names a climb after its deal and the rung, so each rung is said once', () => {
      expect(climbNewsId('deal', 3)).toBe('sponsorNews:climb:3:deal');
      expect(climbNewsId('deal', 2)).not.toBe(climbNewsId('deal', 3));
    });
  });

  describe('dealRung', () => {
    const level = { ...levels(4), [Discipline.ROAD]: 3, [Discipline.TOURING]: 2 };

    it("reads the rung of the discipline a deal covers, and the career's best for any racing", () => {
      expect(dealRung({ covers: Discipline.ROAD }, level)).toBe(3);
      expect(dealRung({ covers: null }, level)).toBe(2);
    });
  });

  describe('slotFree', () => {
    it("frees the main sponsor's slot once no live deal holds it", () => {
      const main = makeDeal({ slot: 'main' });
      const ended = makeDeal({ slot: 'main', ended: { on: '2027-06-01', why: 'mine' } });

      expect(slotFree(makeCareer({ sponsors: [] }), 'main')).toBe(true);
      expect(slotFree(makeCareer({ sponsors: [main] }), 'main')).toBe(false);
      expect(slotFree(makeCareer({ sponsors: [ended] }), 'main')).toBe(true);
    });

    it("leaves a partner's slot free while fewer hold one than the rung gives", () => {
      const one = makeDeal({ id: 'one' });
      const two = makeDeal({ id: 'two' });

      expect(slotFree(makeCareer({ sponsors: [one] }), 'partner')).toBe(true);
      expect(slotFree(makeCareer({ sponsors: [one, two] }), 'partner')).toBe(false);
    });

    it('closes a slot held at a higher rung once the career has dropped', () => {
      const sponsors = [makeDeal({ id: 'one' })];

      expect(slotFree(makeCareer({ sponsors, level: levels(5) }), 'partner')).toBe(false);
    });
  });

  describe('perkOf', () => {
    it('finds a perk of a deal, and nothing for one it does not hold', () => {
      expect(perkOf(makeDeal(), 'racePay')).toEqual({ kind: 'racePay', amount: 500 });
      expect(perkOf(makeDeal(), 'signing')).toBeUndefined();
    });
  });

  describe('coveringDeal', () => {
    const covering = makeDeal({ perks: [{ kind: 'championship', series: 'test-cup', seriesName: 'Test Cup' }] });

    it('finds the deal paying a championship on a day it runs', () => {
      expect(coveringDeal(makeCareer({ sponsors: [makeDeal(), covering] }), 'test-cup', '2027-03-07')).toBe(covering);
    });

    it('finds none for another championship, or outside its year', () => {
      const career = makeCareer({ sponsors: [covering] });

      expect(coveringDeal(career, 'other-cup', '2027-03-07')).toBeNull();
      expect(coveringDeal(career, 'test-cup', '2027-01-01')).toBeNull();
      expect(coveringDeal(career, 'test-cup', '2028-01-01')).toBeNull();
    });
  });

  describe('carBackingDeal', () => {
    const deal = makeDeal({ slot: 'main', perks: [{ kind: 'carBacking', share: 50 }] });

    it('finds the deal whose backing is still to use', () => {
      expect(carBackingDeal(makeCareer({ sponsors: [makeDeal(), deal] }))).toBe(deal);
    });

    it('finds nothing once it has paid for a car, or the deal has ended', () => {
      const spent = { ...sponsorLedgerLine(deal.id, 1000), key: `sponsor:${deal.id}:car` };
      const ended = { ...deal, ended: { on: '2027-06-01', why: 'mine' as const } };

      expect(carBackingDeal(makeCareer({ sponsors: [deal], ledger: [spent] }))).toBeNull();
      expect(carBackingDeal(makeCareer({ sponsors: [ended] }))).toBeNull();
    });
  });

  describe('seatBackedIn', () => {
    it('finds the seat a deal paid half of until that season has finished', () => {
      const entry = backedEntry('seat-deal');
      const career = makeCareer({ seasons: [makeSeasonOf(entry)] });

      expect(seatBackedIn(career, 'seat-deal')).toBe(entry);
      expect(seatBackedIn(career, 'another')).toBeNull();
    });

    it('frees it once every round has run and the last is behind the clock', () => {
      const raced = backedEntry('seat-deal', {
        events: [makeEvent('one', '2027-06-01', [makeRace(0, makePlace(1))])],
      });

      expect(seatBackedIn(makeCareer({ seasons: [makeSeasonOf(raced)] }), 'seat-deal')).toBeNull();
    });

    it('holds it on a contract terminated part-way, until the season it was for finishes', () => {
      const entry = backedEntry('seat-deal', {
        contract: { backed: { deal: 'seat-deal', amount: 1000 }, ended: '2027-06-01' } as Contract,
      });

      expect(seatBackedIn(makeCareer({ seasons: [makeSeasonOf(entry)] }), 'seat-deal')).toBe(entry);
    });
  });

  describe('seatBackingDeal', () => {
    it("finds a deal free to back a class on the career's rung or below", () => {
      const deal = seatDeal();
      const career = makeCareer({ sponsors: [deal] });

      expect(seatBackingDeal(career, Discipline.ROAD, 4)).toBe(deal);
      expect(seatBackingDeal(career, Discipline.ROAD, 5)).toBe(deal);
      expect(seatBackingDeal(career, Discipline.ROAD, 3)).toBeNull();
    });

    it('judges a deal covering a discipline on that rung, and no other discipline at all', () => {
      const sponsors = [seatDeal({ covers: Discipline.ROAD })];
      const level = { ...levels(4), [Discipline.ROAD]: 5, [Discipline.TOURING]: 2 };

      expect(seatBackingDeal(makeCareer({ sponsors, level }), Discipline.ROAD, 4)).toBeNull();
      expect(seatBackingDeal(makeCareer({ sponsors, level }), Discipline.ROAD, 5)).not.toBeNull();
      expect(seatBackingDeal(makeCareer({ sponsors, level }), Discipline.TOURING, 5)).toBeNull();
    });

    it('backs one seat at a time', () => {
      const career = makeCareer({ sponsors: [seatDeal()], seasons: [makeSeasonOf(backedEntry('seat-deal'))] });

      expect(seatBackingDeal(career, Discipline.ROAD, 4)).toBeNull();
    });
  });

  describe('seatBacker', () => {
    it('says who can pay part of a seat, and how much of it', () => {
      expect(seatBacker(makeCareer({ sponsors: [seatDeal()] }), Discipline.ROAD, 4)).toEqual({
        sponsor: 'Halden Lubricants', share: 50,
      });
    });

    it('says nothing where none can', () => {
      expect(seatBacker(makeCareer(), Discipline.ROAD, 4)).toBeNull();
    });
  });

  describe('percentOf', () => {
    it('takes a percentage of an amount, to a whole amount', () => {
      expect(percentOf(1000, 25)).toBe(250);
      expect(percentOf(333, 50)).toBe(167);
    });
  });

  describe('backingOf', () => {
    it("pays the deal's share of the price, and nothing for backing it does not hold", () => {
      expect(backingOf(seatDeal(), 'seatBacking', 60_000)).toBe(30_000);
      expect(backingOf(seatDeal(), 'carBacking', 60_000)).toBe(0);
    });
  });

  describe('costShares', () => {
    const share = (id: string, amount: number, over: Partial<SponsorDeal> = {}): SponsorDeal => makeDeal({
      id, sponsor: { name: id, trade: 'parts', nation: 'GBR' }, perks: [{ kind: 'feeShare', share: amount }], ...over,
    });
    const shares = (sponsors: readonly SponsorDeal[], date = '2027-03-07') => (
      costShares(makeCareer({ sponsors }), Discipline.ROAD, date, 'feeShare', 1000)
    );

    it('says what a deal takes off a cost', () => {
      expect(shares([share('a', 25)])).toEqual([{ sponsor: 'a', amount: 250, share: 25 }]);
    });

    it('adds every deal holding one, each off the whole cost', () => {
      expect(shares([share('a', 25), share('b', 30)])).toEqual([
        { sponsor: 'a', amount: 250, share: 25 }, { sponsor: 'b', amount: 300, share: 30 },
      ]);
    });

    it('stops at what is left to pay', () => {
      expect(shares([share('a', 70), share('b', 60), share('c', 10)])).toEqual([
        { sponsor: 'a', amount: 700, share: 70 }, { sponsor: 'b', amount: 300, share: 60 },
      ]);
    });

    it('leaves out a deal not reaching the round: another discipline, or outside its year', () => {
      expect(shares([share('a', 25, { covers: Discipline.TOURING })])).toEqual([]);
      expect(shares([share('a', 25)], '2027-01-01')).toEqual([]);
      expect(shares([share('a', 25)], '2028-01-01')).toEqual([]);
    });

    it('reads a share only of the cost it is for', () => {
      expect(costShares(makeCareer({ sponsors: [share('a', 25)] }), Discipline.ROAD, '2027-03-07', 'rentShare', 1000))
        .toEqual([]);
    });
  });

  describe('afterShares', () => {
    it('takes every share off the cost', () => {
      expect(afterShares(1000, [{ sponsor: 'a', amount: 250, share: 25 }, { sponsor: 'b', amount: 300, share: 30 }])).toBe(450);
      expect(afterShares(1000, [])).toBe(1000);
    });
  });

  describe('repaintDeal', () => {
    const deal = makeDeal({ perks: [{ kind: 'repaints' }] });

    it('finds the deal paying for repaints', () => {
      expect(repaintDeal(makeCareer({ sponsors: [makeDeal(), deal] }))).toBe(deal);
    });

    it('finds nothing once it has ended', () => {
      expect(repaintDeal(makeCareer({ sponsors: [{ ...deal, ended: { on: '2027-06-01', why: 'mine' } }] }))).toBeNull();
    });
  });

  describe('seatLift', () => {
    const deal = (kind: 'teamInterest' | 'worksInterest' | 'betterTerms', slot: 'main' | 'partner' = 'main') => (
      makeDeal({ id: `${kind}-${slot}`, slot, perks: [{ kind }] })
    );
    const lift = (...sponsors: SponsorDeal[]) => seatLift(makeCareer({ sponsors }), Discipline.ROAD);

    it('adds nothing without a deal that helps', () => {
      expect(lift(makeDeal())).toEqual(NO_SEAT_LIFT);
    });

    it("gives a partner half of a main sponsor's interest, and every deal adds", () => {
      expect(lift(deal('teamInterest')).interest).toBeCloseTo(0.2);
      expect(lift(deal('teamInterest', 'partner')).interest).toBeCloseTo(0.1);
      expect(lift(deal('teamInterest'), deal('teamInterest', 'partner')).interest).toBeCloseTo(0.3);
    });

    it('lifts works teams by a share and the bar before the player is ready by points', () => {
      expect(lift(deal('worksInterest'))).toMatchObject({ works: 1 / 3, bar: 5 });
      expect(lift(deal('worksInterest', 'partner'))).toMatchObject({ works: 1 / 6, bar: 2.5 });
    });

    it('betters terms by slot, only a main sponsor lifting a fee cover', () => {
      expect(lift(deal('betterTerms'))).toMatchObject({ salary: 0.2, seatPrice: 0.2, cover: true });
      expect(lift(deal('betterTerms', 'partner'))).toMatchObject({ salary: 0.1, seatPrice: 0.1, cover: false });
    });

    it('never takes more than the whole of a seat off its price', () => {
      const six = Array.from({ length: 6 }, (unused, at) => makeDeal({ id: `${at}`, slot: 'main', perks: [{ kind: 'betterTerms' }] }));

      expect(lift(...six).seatPrice).toBe(1);
    });

    it('reaches only the discipline a deal covers', () => {
      expect(lift({ ...deal('teamInterest'), covers: Discipline.TOURING })).toEqual(NO_SEAT_LIFT);
    });
  });

  describe('invitationLift', () => {
    const deal = (slot: 'main' | 'partner', over: Partial<SponsorDeal> = {}) => makeDeal({
      id: slot, slot, perks: [{ kind: 'invitations' }], ...over,
    });
    const lift = (...sponsors: SponsorDeal[]) => invitationLift(makeCareer({ sponsors }), Discipline.ROAD);

    it('adds a fifth for a main sponsor and a tenth for a partner, every deal adding', () => {
      expect(lift(deal('main'))).toBeCloseTo(0.2);
      expect(lift(deal('partner'))).toBeCloseTo(0.1);
      expect(lift(deal('main'), deal('partner'))).toBeCloseTo(0.3);
    });

    it('adds nothing without one, or for one covering another discipline', () => {
      expect(lift(makeDeal())).toBe(0);
      expect(lift(deal('main', { covers: Discipline.TOURING }))).toBe(0);
    });
  });

  describe('rewardWorth', () => {
    const deal = makeDeal({ perks: [{ kind: 'goalBonus', amount: 5000 }] });

    it('is three goal bonuses', () => {
      expect(rewardWorth(deal, 100_000)).toBe(15_000);
    });

    it('is never more than the car', () => {
      expect(rewardWorth(deal, 10_000)).toBe(10_000);
    });
  });

  describe('goalSettled', () => {
    const raced = (round: string, date: string, place = 2) => makeEvent(round, date, [makeRace(0, makePlace(place))]);
    const standings = tableOf([makeStanding('seat-1', 1), makeStanding('seat-2', 2), makeStanding('seat-3', 3)]);
    const place = makeDeal({ goal: { kind: 'championshipPlace', count: 3 } });

    it('settles a count the day it is reached', () => {
      const deal = makeDeal({ goal: { kind: 'racesStarted', count: 2 } });

      expect(goalSettled(racedCareer([raced('one', '2027-03-01')]), deal)).toBe(false);
      expect(goalSettled(racedCareer([raced('one', '2027-03-01'), raced('two', '2027-04-01')]), deal)).toBe(true);
    });

    it('settles a championship place the day a season of it finishes there', () => {
      const under = racedCareer([raced('one', '2027-03-01'), makeEvent('two', '2027-09-01')], {}, { standings });
      const finished = racedCareer([raced('one', '2027-03-01'), raced('two', '2027-04-01')], {}, { standings });

      expect(goalSettled(under, place)).toBe(false);
      expect(goalSettled(finished, place)).toBe(true);
    });

    it('settles nothing for a season finished outside the place asked', () => {
      const career = racedCareer([raced('one', '2027-03-01')], {}, { standings });

      expect(goalSettled(career, makeDeal({ goal: { kind: 'championshipPlace', count: 1 } }))).toBe(false);
    });

    it('leaves a share of races open until the year runs out, as it moves until the last', () => {
      const deal = makeDeal({ goal: { kind: 'onTarget', share: 1 / 2 } });
      const events = [raced('one', '2027-03-01', 1)];

      expect(goalSettled(racedCareer(events), deal)).toBe(false);
      expect(goalSettled(racedCareer(events, { date: '2028-01-01' }), deal)).toBe(true);
    });

    it('reads everything as it stands once the year has run out', () => {
      const events = [raced('one', '2027-03-01'), makeEvent('two', '2028-03-01')];

      expect(goalSettled(racedCareer(events, { date: '2028-01-01' }, { standings }), place)).toBe(true);
    });
  });
});
