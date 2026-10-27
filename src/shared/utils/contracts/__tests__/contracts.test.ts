import { describe, expect, it } from '@jest/globals';

import { Discipline, TeamBudget } from '../../../types/index.ts';
import type {
  Contract, Mail, SeasonEvent, SeatOffer,
} from '../../../types/index.ts';
import {
  activeContract,
  bonusFor,
  coveredFee,
  offerDay,
  offerDeadline,
  offerId,
  pickedOffer,
  roundFine,
  roundSalary,
  termination,
} from '../index.ts';

/**
 * A contract signed for a season, paying a salary.
 * @param overrides What to change about it
 * @returns The contract
 */
const contract = (overrides: Partial<Contract> = {}): Contract => ({
  team: 'alpha',
  teamName: 'Alpha Racing',
  budget: TeamBudget.WORKS,
  entry: 'gt3',
  seat: 'gt3-2',
  car: { model: 'gt3_car' },
  pay: 'salary',
  amount: 12_000,
  feeCover: 1,
  prizeShare: 25,
  offer: 'offer:test-gt:0.0',
  signed: '2027-02-01',
  ...overrides,
});

/**
 * A round of a season's entry.
 * @param overrides What to change about it
 * @returns The round
 */
const event = (overrides: Partial<SeasonEvent> = {}): SeasonEvent => ({
  round: 'r1',
  raceId: 'test-gt/r1@0.0',
  date: '2027-03-07',
  entryFee: 1_000,
  status: 'scheduled',
  sessions: [],
  ...overrides,
});

/**
 * One team's seat offer in a class.
 * @param entry The class
 * @param team The team
 * @returns The offer
 */
const offer = (entry: string, team: string): SeatOffer => ({
  team,
  teamName: team,
  budget: TeamBudget.INDEPENDENT,
  entry,
  seat: `${entry}-1`,
  car: { model: 'gt3_car' },
  pay: 'free',
  amount: 0,
  feeCover: 1,
  prizeShare: 50,
  series: 'test-gt',
  seriesName: 'Test GT',
  season: 0,
  edition: 0,
  opener: '2027-03-07',
  rounds: 4,
  editions: 1,
  entryName: entry,
  ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
  fees: 4_000,
  rent: 300,
});

/**
 * A mail holding seat offers.
 * @param offers The offers
 * @returns The mail's offers, as pickedOffer reads them
 */
const mail = (offers: SeatOffer[]): Pick<Mail, 'offers'> => ({ offers });

describe('shared/utils/contracts', () => {
  describe('offerId', () => {
    it('names one mail per edition of a championship', () => {
      expect(offerId('test-gt', 1, 2)).toBe('offer:test-gt:1.2');
    });

    it('tells two editions of one season apart', () => {
      expect(offerId('test-gt', 0, 0)).not.toBe(offerId('test-gt', 0, 1));
    });
  });

  describe('pickedOffer', () => {
    const offers = [offer('gt3', 'alpha'), offer('gt3', 'beta'), offer('gt4', 'alpha')];

    it('finds the offer the class and team name', () => {
      expect(pickedOffer(mail(offers), { entry: 'gt4', team: 'alpha' })).toBe(offers[2]);
    });

    it('takes the only offer when none is picked', () => {
      expect(pickedOffer(mail([offers[1]]), undefined)).toBe(offers[1]);
    });

    it('takes none of several when none is picked', () => {
      expect(pickedOffer(mail(offers), undefined)).toBeNull();
    });

    it('takes none when the pick names an offer the mail does not hold', () => {
      expect(pickedOffer(mail(offers), { entry: 'gt4', team: 'beta' })).toBeNull();
    });

    it('takes none from a mail holding no offers', () => {
      expect(pickedOffer({}, undefined)).toBeNull();
    });
  });

  describe('offerDay', () => {
    it('sends offers eight weeks before the opener', () => {
      expect(offerDay('2027-03-07')).toBe('2027-01-10');
    });
  });

  describe('offerDeadline', () => {
    it('stands a fortnight after the offer arrived', () => {
      expect(offerDeadline('2027-01-10', '2027-03-07')).toBe('2027-01-24');
    });

    it('never runs past the eve of the opener', () => {
      expect(offerDeadline('2027-03-01', '2027-03-07')).toBe('2027-03-06');
    });
  });

  describe('activeContract', () => {
    it('is the contract while it runs', () => {
      const signed = contract();

      expect(activeContract({ contract: signed })).toBe(signed);
    });

    it('is none once the contract was terminated', () => {
      expect(activeContract({ contract: contract({ ended: '2027-05-01' }) })).toBeNull();
    });

    it('is none for an entry raced on the player\'s own', () => {
      expect(activeContract({})).toBeNull();
    });
  });

  describe('coveredFee', () => {
    it('covers the whole fee at full cover', () => {
      expect(coveredFee({ feeCover: 1 }, 1_000)).toBe(1_000);
    });

    it('covers half the fee at half cover, rounded', () => {
      expect(coveredFee({ feeCover: 0.5 }, 1_001)).toBe(501);
    });
  });

  describe('roundSalary', () => {
    it('splits the salary evenly over the edition', () => {
      expect(roundSalary({ pay: 'salary', amount: 10_000 }, 3)).toBe(3_333);
    });

    it('pays nothing under a contract without a salary', () => {
      expect(roundSalary({ pay: 'free', amount: 0 }, 4)).toBeNull();
      expect(roundSalary({ pay: 'seat', amount: 5_000 }, 4)).toBeNull();
    });

    it('pays nothing for an edition of no rounds', () => {
      expect(roundSalary({ pay: 'salary', amount: 10_000 }, 0)).toBeNull();
    });
  });

  describe('roundFine', () => {
    it('fines a round not raced its entry fee', () => {
      expect(roundFine({ contract: contract() }, event())).toBe(1_000);
    });

    it('never fines a paid seat', () => {
      expect(roundFine({ contract: contract({ pay: 'seat', amount: 5_000 }) }, event())).toBeNull();
    });

    it('never fines a round the install could not race', () => {
      expect(roundFine({ contract: contract() }, event({ unraceable: true }))).toBeNull();
    });

    it('never fines a round on or after the contract ended', () => {
      const ended = { contract: contract({ ended: '2027-03-07' }) };

      expect(roundFine(ended, event({ date: '2027-03-07' }))).toBeNull();
      expect(roundFine(ended, event({ date: '2027-03-06' }))).toBe(1_000);
    });

    it('fines nothing for a round free to enter', () => {
      expect(roundFine({ contract: contract() }, event({ entryFee: 0 }))).toBeNull();
      expect(roundFine({ contract: contract() }, event({ entryFee: undefined }))).toBeNull();
    });

    it('fines nothing without a contract', () => {
      expect(roundFine({}, event())).toBeNull();
    });
  });

  describe('bonusFor', () => {
    const terms = { bonus: [{ upTo: 1, amount: 4_000 }, { upTo: 3, amount: 1_500 }] };

    it('pays the first tier a place falls within', () => {
      expect(bonusFor(terms, 1)).toBe(4_000);
      expect(bonusFor(terms, 2)).toBe(1_500);
      expect(bonusFor(terms, 3)).toBe(1_500);
    });

    it('pays nothing below every tier', () => {
      expect(bonusFor(terms, 4)).toBe(0);
    });

    it('pays nothing under a contract without a bonus', () => {
      expect(bonusFor({}, 1)).toBe(0);
    });
  });

  describe('termination', () => {
    /**
     * Four rounds, the first raced.
     * @param fees Each round's entry fee
     * @returns The rounds
     */
    const rounds = (fees: number[]): SeasonEvent[] => fees.map((entryFee, at) => event({
      round: `r${at + 1}`,
      raceId: `test-gt/r${at + 1}@0.0`,
      entryFee,
      status: at === 0 ? 'raced' : 'scheduled',
    }));

    it('costs a quarter of each fine left once that passes one whole fine', () => {
      const events = rounds([1_000, 2_000, 2_000, 2_000, 2_000, 2_000]);

      expect(termination({ contract: contract(), events })).toMatchObject({ left: 5, release: 2_500, refund: 0 });
    });

    it('never costs less than one whole fine', () => {
      const events = rounds([1_000, 1_000, 3_000]);

      expect(termination({ contract: contract(), events }).release).toBe(3_000);
    });

    it('gives back half of what a paid seat\'s rounds left were worth, and costs no release', () => {
      const events = rounds([1_000, 1_000, 1_000, 1_000]);
      const paid = contract({ pay: 'seat', amount: 8_000 });

      expect(termination({ contract: paid, events })).toMatchObject({ release: 0, refund: 3_000, salaryLeft: 0 });
    });

    it('counts the salary the rounds left would have paid', () => {
      const events = rounds([1_000, 1_000, 1_000, 1_000]);

      expect(termination({ contract: contract(), events }).salaryLeft).toBe(9_000);
    });

    it('comes to nothing without a contract still running', () => {
      const events = rounds([1_000, 1_000]);
      const nothing = { release: 0, refund: 0, salaryLeft: 0 };

      expect(termination({ events })).toEqual({ left: 1, ...nothing });
      expect(termination({ contract: contract({ ended: '2027-04-01' }), events })).toEqual({ left: 1, ...nothing });
    });

    it('comes to nothing with no round left to race', () => {
      const events = rounds([1_000]);

      expect(termination({ contract: contract(), events })).toEqual({
        left: 0, release: 0, refund: 0, salaryLeft: 0,
      });
    });
  });
});
