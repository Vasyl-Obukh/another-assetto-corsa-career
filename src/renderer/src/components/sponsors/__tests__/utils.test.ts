import { describe, expect, it } from '@jest/globals';
import type { TFunction } from 'i18next';

import type {
  SponsorGoal, SponsorNews, SponsorOffer, SponsorPerk, SponsorTarget,
} from '../../../../../shared/types';
import type { GoalStanding } from '../../../../../shared/utils/sponsors';
import {
  goalProgress, goalText, perkPair, shareKey, sponsorNewsSubject, sponsorOfferSubject,
} from '../utils.ts';

/**
 * A translator that spells out the key and its parameters, so a test can see
 * which wording was asked for and with what.
 * @param key The key asked for
 * @param params The parameters it was given
 * @returns The key with its parameters
 */
const translate = ((key: string, params?: Record<string, unknown>): string => {
  const given = Object.entries(params ?? {}).map(([name, value]) => `${name}=${String(value)}`);

  return given.length > 0 ? `${key}(${given.join(',')})` : key;
}) as unknown as TFunction;

/**
 * Writes an amount back the way a test can read it.
 * @param amount The amount
 * @returns It, with a dollar sign
 */
const money = (amount: number): string => `$${amount}`;

/**
 * A deal's terms asking a top-half class place of every race.
 */
const TERMS = { target: { kind: 'classPlace', share: 1 / 2 } as SponsorTarget };

/**
 * One perk paired, at no scale unless one is given.
 * @param perk The perk
 * @param scale What its figures are multiplied by
 * @param target The deal's target
 * @returns The price, condition and whether it is a signature
 */
const pair = (perk: SponsorPerk, scale = 1, target: SponsorTarget = TERMS.target) => (
  perkPair({ target }, perk, scale, translate, money)
);

/**
 * Where a goal stands.
 * @param over What to change about it
 * @returns The standing
 */
const standing = (over: Partial<GoalStanding> = {}): GoalStanding => ({
  reached: 2, needed: 5, met: false, onCourse: true, ...over,
});

describe('renderer/components/sponsors/utils', () => {
  describe('shareKey', () => {
    it('names a half, a third, a quarter and three quarters', () => {
      expect(shareKey(1 / 2)).toBe('half');
      expect(shareKey(1 / 3)).toBe('third');
      expect(shareKey(1 / 4)).toBe('quarter');
      expect(shareKey(3 / 4)).toBe('threeQuarters');
    });

    it('reads a share between the names as the nearest one', () => {
      expect(shareKey(0.45)).toBe('half');
      expect(shareKey(0.32)).toBe('third');
      expect(shareKey(0.1)).toBe('quarter');
    });
  });

  describe('sponsorOfferSubject', () => {
    const offer = { slot: 'partner', sponsor: { name: 'Halden' } } as SponsorOffer;

    it('calls an offer by its slot', () => {
      expect(sponsorOfferSubject(offer, translate)).toBe('inbox.sponsor.title.partner(sponsor=Halden)');
    });

    it('calls a renewal a renewal, whatever its slot', () => {
      expect(sponsorOfferSubject({ ...offer, renews: 'deal' }, translate)).toBe('inbox.sponsor.title.renewal(sponsor=Halden)');
    });
  });

  describe('sponsorNewsSubject', () => {
    const news = { sponsor: { name: 'Halden' } } as SponsorNews;
    const car = {
      model: 'a', name: 'A', price: 1,
    };

    it('calls a goal missed by the sponsor', () => {
      expect(sponsorNewsSubject(news, translate)).toBe('inbox.subject.sponsorNews(sponsor=Halden)');
    });

    it('says a deal climbed', () => {
      expect(sponsorNewsSubject({ ...news, kind: 'climbed' }, translate)).toBe('inbox.sponsorNews.climbed.title(sponsor=Halden)');
    });

    it('leads with the car a goal met brought', () => {
      expect(sponsorNewsSubject({ ...news, kind: 'goalMet', car }, translate)).toBe('inbox.sponsorNews.goalMet.titleCar');
    });

    it('calls a goal met by the sponsor where no car came', () => {
      const title = 'inbox.sponsorNews.goalMet.title(sponsor=Halden)';

      expect(sponsorNewsSubject({ ...news, kind: 'goalMet' }, translate)).toBe(title);
      expect(sponsorNewsSubject({
        ...news, kind: 'goalMet', car, carPaid: 5000,
      }, translate)).toBe(title);
    });
  });

  describe('perkPair', () => {
    it('makes seat backing a signature', () => {
      expect(pair({ kind: 'seatBacking', share: 50 })).toEqual({
        price: '', condition: 'sponsors.perk.seatBacking', signature: true,
      });
    });

    it("names a reward's car, its price on a line of its own", () => {
      expect(pair({
        kind: 'carReward',
        car: {
          model: 'a', name: 'Car A', price: 50_000,
        },
      })).toEqual({
        price: '',
        condition: 'sponsors.perk.carReward(car=Car A)',
        signature: true,
        sub: 'sponsors.perk.carPrice(price=$50000)',
      });
    });

    it('prices a cost share as a percentage', () => {
      expect(pair({ kind: 'feeShare', share: 25 })).toEqual({
        price: '25%', condition: 'sponsors.perk.feeShare', signature: false,
      });
      expect(pair({ kind: 'rentShare', share: 30 }).price).toBe('30%');
    });

    it('gives a perk that helps no price', () => {
      expect(pair({ kind: 'teamInterest' })).toEqual({
        price: '', condition: 'sponsors.perk.teamInterest', signature: false, helps: true,
      });
    });

    it('prices race pay at its condition, the target the deal asks', () => {
      expect(pair({ kind: 'racePay', amount: 400 })).toEqual({
        price: '$400',
        condition: 'sponsors.perk.race.classPlace(share=sponsors.share.half,count=0)',
        signature: false,
      });
    });

    it('says how many cut laps clean racing allows', () => {
      expect(pair({ kind: 'racePay', amount: 400 }, 1, { kind: 'clean', cuts: 3 }).condition)
        .toBe('sponsors.perk.race.clean(share=sponsors.share.threeQuarters,count=3)');
    });

    it('prices a figure at its scale, to the round figure it is paid at', () => {
      expect(pair({ kind: 'win', amount: 1234 }, 2)).toEqual({
        price: '$2470', condition: 'sponsors.perk.win', signature: false,
      });
      expect(pair({ kind: 'signing', amount: 5000 }, 1.5).price).toBe('$7500');
    });

    it('prices a perk drawn with no figure at nothing', () => {
      expect(pair({ kind: 'podium' }).price).toBe('$0');
    });

    it('prices a prize match as its share, whatever the scale', () => {
      expect(pair({ kind: 'prizeMatch', share: 20 }, 3)).toEqual({
        price: '20%', condition: 'sponsors.perk.prizeMatch', signature: false,
      });
    });

    it('gives a signature no price, and names the championship one covers', () => {
      expect(pair({
        kind: 'championship', series: 'cup', seriesName: 'Sunday Cup',
      })).toEqual({ price: '', condition: 'sponsors.perk.championship(series=Sunday Cup)', signature: true });
      expect(pair({ kind: 'climbs' })).toEqual({ price: '', condition: 'sponsors.perk.climbs', signature: true });
      expect(pair({ kind: 'carBacking', share: 50 }))
        .toEqual({ price: '', condition: 'sponsors.perk.carBacking', signature: true });
    });
  });

  describe('goalText', () => {
    it('words a championship place as a place or a share of the class', () => {
      expect(goalText({ kind: 'championshipPlace', count: 3 }, translate)).toBe('sponsors.goal.place(count=3)');
      expect(goalText({ kind: 'championshipPlace', share: 1 / 2 }, translate))
        .toBe('sponsors.goal.placeShare(share=sponsors.share.half)');
    });

    it('words a count of results by the result it counts', () => {
      expect(goalText({ kind: 'resultCount', result: 'win', count: 2 }, translate)).toBe('sponsors.goal.win(count=2)');
      expect(goalText({ kind: 'resultCount', result: 'pole', count: 3 }, translate)).toBe('sponsors.goal.pole(count=3)');
    });

    it('words a share of races on target, and a count of races started', () => {
      expect(goalText({ kind: 'onTarget', share: 3 / 4 }, translate))
        .toBe('sponsors.goal.onTarget(share=sponsors.share.threeQuarters)');
      expect(goalText({ kind: 'racesStarted', count: 30 }, translate)).toBe('sponsors.goal.races(count=30)');
    });
  });

  describe('goalProgress', () => {
    const count: SponsorGoal = { kind: 'resultCount', result: 'podium', count: 5 };

    it('says nothing is judged yet before anything has been raced', () => {
      expect(goalProgress(count, standing({ onCourse: null }), translate)).toBe('sponsors.progress.none');
    });

    it('says the championship place reached', () => {
      expect(goalProgress({ kind: 'championshipPlace', count: 3 }, standing({ reached: 4, needed: 3 }), translate))
        .toBe('sponsors.progress.place(place=4)');
    });

    it('says the share of races on target as a whole percentage', () => {
      expect(goalProgress({ kind: 'onTarget', share: 1 / 2 }, standing({ reached: 2 / 3, needed: 1 / 2 }), translate))
        .toBe('sponsors.progress.share(percent=67)');
    });

    it('says a count as how far it has got of what it needs', () => {
      expect(goalProgress(count, standing(), translate)).toBe('sponsors.progress.count(reached=2,needed=5)');
      expect(goalProgress({ kind: 'racesStarted', count: 20 }, standing({ reached: 8, needed: 20 }), translate))
        .toBe('sponsors.progress.count(reached=8,needed=20)');
    });
  });
});
