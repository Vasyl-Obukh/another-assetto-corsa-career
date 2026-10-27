import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import { Discipline, TeamBudget } from '../../../../../shared/types';
import type {
  Career, Championship, Mail, SeatOffer,
} from '../../../../../shared/types';
import {
  carModels,
  eventLink,
  feePerRound,
  folderOf,
  offerEdition,
  offerLink,
  offerSenders,
  pageNumber,
  seasonBeforePrizes,
} from '../utils.ts';
import type { InboxItem } from '@/lib/inbox';
import { path } from '@/lib/routes';

/**
 * A translator that spells out the key and its parameters, so a test can see
 * which wording was asked for and with what.
 */
const t = ((key: string, params?: object) => (
  params ? `${key} ${JSON.stringify(params)}` : key
)) as unknown as TFunction;

/**
 * A career that has run to the season given.
 * @param seasons How many seasons it holds
 * @returns The career
 */
const career = (seasons: number): Career => ({
  seasons: Array.from({ length: seasons }, (_, index) => ({ index, entries: [] })),
} as unknown as Career);

/**
 * A mail of a season about the Monaco event's one round, or about nothing.
 * @param season Which season it arrived in
 * @param about Whether the season still holds the event
 * @returns The item
 */
const item = (season: number, about = true): InboxItem => ({
  mail: { id: 'invite:monaco', season } as Mail,
  status: 'awaiting',
  event: about ? { id: 'monaco 1967' } as Championship : null,
  draw: null,
  round: about ? { id: 'r1', name: 'Monaco', track: { id: 'monaco' } } : null,
  entry: null,
  seat: null,
  team: null,
  entered: null,
  offers: [],
});

/**
 * A team's seat in the cup's main class, as an offer's mail carries it.
 * @param overrides What to change about it
 * @returns The offer
 */
const seatOffer = (overrides: Partial<SeatOffer> = {}): SeatOffer => ({
  team: 'alpha',
  teamName: 'Alpha Racing',
  budget: TeamBudget.WORKS,
  entry: 'main',
  seat: 'main-2',
  car: { model: 'alpha_car' },
  pay: 'salary',
  amount: 20_000,
  feeCover: 1,
  prizeShare: 25,
  series: 'sunday cup',
  seriesName: 'Sunday Cup',
  season: 1,
  edition: 0,
  opener: '2027-06-06',
  rounds: 4,
  editions: 1,
  entryName: 'Main',
  ladder: { discipline: Discipline.TOURING, tier: 4 },
  fees: 8000,
  rent: 500,
  ...overrides,
});

/**
 * A seat offer's mail as the inbox reads it.
 * @param offers The offers it holds
 * @returns The item
 */
const offering = (offers: SeatOffer[]): InboxItem => ({
  ...item(1, false),
  mail: { id: 'offer:sunday cup:1.0', season: 1 } as Mail,
  offers,
});

/**
 * A career of two seasons, 2026 and 2027.
 */
const TWO_SEASONS = {
  seasons: [
    { index: 0, startDate: '2026-01-01', entries: [] },
    { index: 1, startDate: '2027-01-01', entries: [] },
  ],
} as unknown as Career;

describe('renderer/screens/inbox/utils', () => {
  describe('folderOf', () => {
    it('reads the folder a URL names', () => {
      expect(folderOf('all')).toBe('all');
      expect(folderOf('unread')).toBe('unread');
      expect(folderOf('awaiting')).toBe('awaiting');
      expect(folderOf('invitation')).toBe('invitation');
    });

    // A hand-edited URL opens on All mail rather than on a folder listing nothing.
    it('opens on All mail for a URL naming no folder, or one there is not', () => {
      expect(folderOf(null)).toBe('all');
      expect(folderOf('')).toBe('all');
      expect(folderOf('spam')).toBe('all');
    });
  });

  describe('pageNumber', () => {
    it('reads the page a URL names', () => {
      expect(pageNumber('1')).toBe(1);
      expect(pageNumber('4')).toBe(4);
    });

    it('reads the first page for anything that is not a page', () => {
      expect(pageNumber(null)).toBe(1);
      expect(pageNumber('')).toBe(1);
      expect(pageNumber('0')).toBe(1);
      expect(pageNumber('-2')).toBe(1);
      expect(pageNumber('1.5')).toBe(1);
      expect(pageNumber('two')).toBe(1);
    });
  });

  describe('eventLink', () => {
    it("links the event's round in the season under way without naming it", () => {
      expect(eventLink(career(2), item(1))).toBe(path.event({ series: 'monaco 1967', round: 'r1' }));
      expect(eventLink(career(2), item(1))).toBe('/calendar/monaco%201967/r1');
    });

    it('names the season of a mail from a season gone by', () => {
      expect(eventLink(career(2), item(0))).toBe('/calendar/monaco%201967/r1?season=0');
    });

    it('links nothing when the season no longer holds the event', () => {
      expect(eventLink(career(1), item(0, false))).toBeNull();
    });
  });

  describe('carModels', () => {
    it("is an invitation's one car", () => {
      const invitation = {
        ...item(1),
        mail: {
          id: 'invite:monaco',
          season: 1,
          invitation: {
            series: 'monaco 1967', raceId: 'r1', entry: 'main', seat: 's', car: { model: 'lotus_49' },
          },
        } as Mail,
      };

      expect(carModels(invitation)).toEqual(['lotus_49']);
    });

    it("is every offer's car of a seat offer, in the order the mail holds them", () => {
      const offers = [seatOffer(), seatOffer({ team: 'beta', car: { model: 'beta_car', skin: 'blue' } })];

      expect(carModels(offering(offers))).toEqual(['alpha_car', 'beta_car']);
    });
  });

  describe('offerSenders', () => {
    it('names one or two teams in full', () => {
      expect(offerSenders([seatOffer()], t)).toBe('Alpha Racing');
      expect(offerSenders([seatOffer(), seatOffer({ team: 'beta', teamName: 'Beta Motorsport' })], t))
        .toBe('Alpha Racing, Beta Motorsport');
    });

    it('names the first two of more and says how many more there are', () => {
      const offers = ['Alpha Racing', 'Beta Motorsport', 'Gamma Garage', 'Delta Speed']
        .map((teamName) => seatOffer({ teamName }));

      expect(offerSenders(offers, t))
        .toBe(t('inbox.offers.more', { teams: 'Alpha Racing, Beta Motorsport', count: 2 }));
    });

    it('names a team offering in two classes once', () => {
      const offers = [seatOffer(), seatOffer({ entry: 'pro' }), seatOffer({ teamName: 'Beta Motorsport' })];

      expect(offerSenders(offers, t)).toBe('Alpha Racing, Beta Motorsport');
    });
  });

  describe('offerEdition', () => {
    it("names a once-a-year championship's edition by the year of its season", () => {
      expect(offerEdition(TWO_SEASONS, seatOffer(), t)).toBe(t('edition.year', { year: 2027 }));
    });

    it('names the half or quarter of a championship that runs more than once a year', () => {
      expect(offerEdition(TWO_SEASONS, seatOffer({ season: 0, edition: 1, editions: 2 }), t))
        .toBe(t('edition.half', { number: 2, year: 2026 }));
      expect(offerEdition(TWO_SEASONS, seatOffer({ edition: 3, editions: 4 }), t))
        .toBe(t('edition.quarter', { number: 4, year: 2027 }));
    });

    it('names nothing for a season the career does not hold', () => {
      expect(offerEdition(TWO_SEASONS, seatOffer({ season: 5 }), t)).toBe('');
    });
  });

  describe('offerLink', () => {
    it("links the championship's page without naming the season under way", () => {
      expect(offerLink(TWO_SEASONS, seatOffer())).toBe(path.championship({ id: 'sunday cup' }));
      expect(offerLink(TWO_SEASONS, seatOffer())).toBe('/championships/sunday%20cup');
    });

    it('names a season gone by, and the edition of a championship that runs more than once', () => {
      expect(offerLink(TWO_SEASONS, seatOffer({ season: 0 })))
        .toBe(path.championship({ id: 'sunday cup' }, { season: 0 }));
      expect(offerLink(TWO_SEASONS, seatOffer({ edition: 1, editions: 2 })))
        .toBe(path.championship({ id: 'sunday cup' }, { edition: 1 }));
    });
  });

  describe('feePerRound', () => {
    it("averages the edition's fees over its rounds, to the whole unit", () => {
      expect(feePerRound(seatOffer())).toBe(2000);
      expect(feePerRound(seatOffer({ fees: 1000, rounds: 3 }))).toBe(333);
    });

    it('comes to nothing for an edition with no rounds', () => {
      expect(feePerRound(seatOffer({ rounds: 0 }))).toBe(0);
    });
  });

  describe('seasonBeforePrizes', () => {
    it('is the salary a works seat pays', () => {
      expect(seasonBeforePrizes(seatOffer())).toBe(20_000);
    });

    it('is what a paid seat costs, as money going out', () => {
      expect(seasonBeforePrizes(seatOffer({ pay: 'seat', amount: 9000 }))).toBe(-9000);
    });

    it('is the share of the fees a free seat leaves the player', () => {
      expect(seasonBeforePrizes(seatOffer({ pay: 'free', amount: 0, feeCover: 0.5 }))).toBe(-4000);
    });

    // Fixed in review: a free seat with every fee covered read "-$0" under
    // Before prizes, being a negative zero.
    it('is exactly nothing for a free seat with every fee covered, never a negative zero', () => {
      expect(Object.is(seasonBeforePrizes(seatOffer({ pay: 'free', amount: 0, feeCover: 1 })), 0)).toBe(true);
    });
  });
});
