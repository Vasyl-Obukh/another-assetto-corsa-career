import { describe, expect, it } from '@jest/globals';

import {
  makeCareer, makeDeal, makeEntry, makeEvent, makePlace, makeRace, makeStanding, racedCareer,
} from './fixtures.ts';
import { Discipline } from '../../../types/index.ts';
import type { LedgerLine } from '../../../types/index.ts';
import {
  bestRung,
  coversEntry,
  dealCovers,
  dealEnd,
  dealLines,
  dealPaid,
  dealScale,
  dealUntil,
  entryDiscipline,
  formOf,
  goalStanding,
  judgedRaces,
  liveDeals,
  partnerSlots,
  placeIs,
  rungFee,
  signingRepay,
  sponsorFigure,
  sponsorMailId,
  sponsorNewsId,
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

  describe('rungFee', () => {
    it('is each rung\'s typical entry fee', () => {
      expect(rungFee(1)).toBe(25_000);
      expect(rungFee(4)).toBe(3000);
      expect(rungFee(5)).toBe(700);
    });

    it('clamps a rung off either end of the ladder', () => {
      expect(rungFee(0)).toBe(25_000);
      expect(rungFee(8)).toBe(700);
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
});
