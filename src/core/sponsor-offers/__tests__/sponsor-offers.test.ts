import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../shared/types/index.ts';
import type {
  SponsorDeal, SponsorOffer, SponsorPerk, SponsorPerkKind, SponsorTrade,
} from '../../../shared/types/index.ts';
import { ratingFloor, rungWidth } from '../../../shared/utils/career-eligibility/index.ts';
import { randomFrom, seedFrom } from '../../seeded-random/index.ts';
import {
  COST_SHARE_RANGE, FORM_CHANCE, PARTNER_ONLY, REPLACE_FACTOR, STANDOUT_CHANCE, TRADE_LEAN, TRADES,
} from '../constants.ts';
import { SPONSOR_BOOK } from '../sponsor-book.ts';
import {
  drawRenewal, drawSponsorOffer, openSponsors, sponsorChance, sponsorDrawn,
} from '../sponsor-offers.ts';
import type { RewardCar, SponsorDrawRequest, SponsorRenewalRequest } from '../types.ts';

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
 * A request for a main sponsor's offer at Bronze, overridden as a test needs.
 * @param over Whatever the test wants said differently
 * @returns The request
 */
const request = (over: Partial<SponsorDrawRequest> = {}): SponsorDrawRequest => ({
  salt: 'career\u0000round',
  slot: 'main',
  level: levels(4),
  rating: {
    [Discipline.SINGLE_SEATER]: 2000,
    [Discipline.SPORTSCAR]: 2000,
    [Discipline.TOURING]: 2000,
    [Discipline.ROAD]: 2000,
  },
  globalRating: 2000,
  raced: [],
  held: [],
  names: [],
  championships: [],
  prizeSpeed: 1,
  ...over,
});

/**
 * Every trade but one, as the trades a career already holds.
 * @param trade The one left to draw
 * @returns The trades held
 */
const allBut = (trade: SponsorTrade): SponsorTrade[] => TRADES.filter((one) => one !== trade);

/**
 * Many salts, so a rule can be checked across draws rather than on one.
 */
const SALTS = Array.from({ length: 60 }, (unused, at) => `salt-${at}`);

/**
 * The roll a draw makes for a salt, out of a hundred.
 * @param salt The salt
 * @returns The roll
 */
const rollOf = (salt: string): number => randomFrom(seedFrom(`${salt}\u0000sponsor`))() * 100;

/**
 * The signature perks a main sponsor may lead with.
 */
const SIGNATURES: readonly SponsorPerkKind[] = ['championship', 'climbs', 'carBacking', 'seatBacking', 'carReward'];

/**
 * The cars a reward may name: one on each of two rungs.
 */
const REWARDS: readonly RewardCar[] = [
  {
    model: 'road_car', name: 'Road Car', price: 40_000, skin: 'red', discipline: Discipline.ROAD, tier: 4,
  },
  {
    model: 'gt_car', name: 'GT Car', price: 100_000, discipline: Discipline.SPORTSCAR, tier: 3,
  },
];

/**
 * A rating well up every rung's width, so an offer draws from its trade's perks.
 */
const HIGH_RATING = ratingFloor(4) + rungWidth(4) * 0.9;

/**
 * Every offer a salt draws of one trade, in a career rated well up its rung.
 * @param trade The trade
 * @param over What the request says differently
 * @returns The offers
 */
const offersOf = (trade: SponsorTrade, over: Partial<SponsorDrawRequest> = {}): SponsorOffer[] => (
  SALTS.flatMap((salt) => {
    const offer = drawSponsorOffer(request({
      salt,
      held: allBut(trade),
      globalRating: HIGH_RATING,
      rating: {
        [Discipline.SINGLE_SEATER]: HIGH_RATING,
        [Discipline.SPORTSCAR]: HIGH_RATING,
        [Discipline.TOURING]: HIGH_RATING,
        [Discipline.ROAD]: HIGH_RATING,
      },
      ...over,
    }));

    return offer ? [offer] : [];
  })
);

/**
 * A main sponsor's deal of a year, any racing, renewed by the tests below.
 * @param perks Its perks
 * @param over Whatever the test wants said differently
 * @returns The deal
 */
const makeDeal = (perks: readonly SponsorPerk[], over: Partial<SponsorDeal> = {}): SponsorDeal => ({
  id: 'deal',
  sponsor: { name: 'Halden Lubricants', trade: 'oil', nation: 'GBR' },
  slot: 'main',
  covers: null,
  perks,
  target: { kind: 'start' },
  goal: { kind: 'racesStarted', count: 5 },
  rung: 4,
  signed: '2027-01-01',
  until: '2028-01-01',
  ...over,
});

/**
 * A request for a deal's renewal at Bronze.
 * @param deal The deal
 * @param over Whatever the test wants said differently
 * @returns The request
 */
const renewal = (deal: SponsorDeal, over: Partial<SponsorRenewalRequest> = {}): SponsorRenewalRequest => ({
  salt: 'career\u0000deal',
  deal,
  level: levels(4),
  rating: request().rating,
  globalRating: 2000,
  prizeSpeed: 1,
  ...over,
});

/**
 * The race pay an offer draws.
 * @param over What the request says differently
 * @returns The amount
 */
const racePay = (over: Partial<SponsorDrawRequest>): number => (
  drawSponsorOffer(request(over))?.perks.find((perk) => perk.kind === 'racePay')?.amount ?? 0
);

describe('core/sponsor-offers', () => {
  describe('sponsorChance', () => {
    it("starts from the career's form", () => {
      const none = { win: false, title: false, rung: false };

      expect(sponsorChance('top', none)).toBe(FORM_CHANCE.top);
      expect(sponsorChance('bottom', none)).toBe(FORM_CHANCE.bottom);
    });

    it('adds each standout result on top', () => {
      expect(sponsorChance('lower', { win: true, title: false, rung: false })).toBe(FORM_CHANCE.lower + STANDOUT_CHANCE.win);
      expect(sponsorChance('lower', { win: true, title: true, rung: true }))
        .toBe(FORM_CHANCE.lower + STANDOUT_CHANCE.win + STANDOUT_CHANCE.title + STANDOUT_CHANCE.rung);
    });
  });

  describe('sponsorDrawn', () => {
    const both = { main: true, partner: true };
    const none = { main: false, partner: false };

    it('draws the same answer for the same salt', () => {
      for (const salt of SALTS) {
        expect(sponsorDrawn(salt, 40, 'upper', both)).toEqual(sponsorDrawn(salt, 40, 'upper', both));
      }
    });

    it('offers nothing at no chance at all', () => {
      for (const salt of SALTS) {
        expect(sponsorDrawn(salt, 0, 'top', both)).toBeNull();
        expect(sponsorDrawn(salt, 0, 'top', none)).toBeNull();
      }
    });

    it('fills a free main slot only for a career in the upper half of its form', () => {
      expect(sponsorDrawn('a', 100, 'top', both)).toEqual({ slot: 'main', replace: false });
      expect(sponsorDrawn('a', 100, 'upper', both)).toEqual({ slot: 'main', replace: false });
      expect(sponsorDrawn('a', 100, 'lower', both)).toEqual({ slot: 'partner', replace: false });
      expect(sponsorDrawn('a', 100, 'bottom', { main: true, partner: true })).toEqual({ slot: 'partner', replace: false });
    });

    it('fills a free partner slot', () => {
      expect(sponsorDrawn('a', 100, 'top', { main: false, partner: true })).toEqual({ slot: 'partner', replace: false });
    });

    it('offers to replace a deal at a fraction of the chance once no slot is free', () => {
      const chance = 100;
      const inside = SALTS.find((salt) => rollOf(salt) < chance * REPLACE_FACTOR) ?? '';
      const outside = SALTS.find((salt) => rollOf(salt) >= chance * REPLACE_FACTOR) ?? '';

      expect(sponsorDrawn(inside, chance, 'lower', none)).toEqual({ slot: 'partner', replace: true });
      expect(sponsorDrawn(outside, chance, 'lower', none)).toBeNull();
      // The same roll fills a free slot.
      expect(sponsorDrawn(outside, chance, 'lower', both)).toEqual({ slot: 'partner', replace: false });
    });

    it('offers to replace a main sponsor only for a career in form', () => {
      const replacing = SALTS.filter((salt) => rollOf(salt) < 50).map((salt) => sponsorDrawn(salt, 100, 'lower', none));

      expect(replacing.every((one) => one?.slot === 'partner')).toBe(true);
    });
  });

  describe('openSponsors', () => {
    it('opens Rookie, at every rung under the fifth, to specialists alone', () => {
      for (const trade of TRADES) {
        for (const rung of [5, 6, 9]) {
          expect(openSponsors(trade, rung).every(({ stature }) => stature === 'specialist')).toBe(true);
        }
      }
    });

    it('keeps specialists off Gold and Platinum and household names off every rung under Gold', () => {
      for (const trade of TRADES) {
        for (const rung of [1, 2]) expect(openSponsors(trade, rung).map(({ stature }) => stature)).not.toContain('specialist');
        for (const rung of [3, 4, 5]) expect(openSponsors(trade, rung).map(({ stature }) => stature)).not.toContain('global');
      }
    });

    it('leaves every trade a choice of sponsors on every rung', () => {
      for (const trade of TRADES) {
        for (const rung of [1, 2, 3, 4, 5]) expect(openSponsors(trade, rung).length).toBeGreaterThanOrEqual(6);
      }
    });
  });

  describe('drawSponsorOffer', () => {
    it('draws nothing once every trade is held', () => {
      expect(drawSponsorOffer(request({ held: [...TRADES] }))).toBeNull();
    });

    it('draws the same offer for the same request', () => {
      expect(drawSponsorOffer(request())).toEqual(drawSponsorOffer(request()));
    });

    it('never draws a trade the career holds', () => {
      for (const salt of SALTS) {
        expect(drawSponsorOffer(request({ salt, held: allBut('finance') }))?.sponsor.trade).toBe('finance');
      }
    });

    it('never takes a name a deal holds while the book has another', () => {
      // The request draws at Bronze, so only the oil sponsors open there count.
      const [left, ...taken] = openSponsors('oil', 4).map((one) => one.name);
      for (const salt of SALTS) {
        expect(drawSponsorOffer(request({ salt, held: allBut('oil'), names: taken }))?.sponsor.name).toBe(left);
      }
    });

    it("falls back on the rung's own sponsors once every name is taken", () => {
      const names = SPONSOR_BOOK.oil.map((one) => one.name);
      const open = openSponsors('oil', 4).map((one) => one.name);

      for (const salt of SALTS) {
        expect(open).toContain(drawSponsorOffer(request({ salt, held: allBut('oil'), names }))?.sponsor.name);
      }
    });

    it('draws a sponsor sized to the rung', () => {
      for (const rung of [1, 3, 5, 7]) {
        for (const trade of TRADES) {
          const open = openSponsors(trade, rung).map((one) => one.name);

          for (const offer of offersOf(trade, { level: levels(rung) })) expect(open).toContain(offer.sponsor.name);
        }
      }
    });

    it("names its sponsor as the book lists it, logo and all, without its stature", () => {
      const drawn = TRADES.flatMap((trade) => offersOf(trade)).map((offer) => offer.sponsor);

      expect(drawn.some((sponsor) => sponsor.logo)).toBe(true);
      for (const sponsor of drawn) {
        const { stature, ...listed } = SPONSOR_BOOK[sponsor.trade].find((one) => one.name === sponsor.name)!;

        expect(stature).toBeDefined();
        expect(sponsor).toEqual({ ...listed, trade: sponsor.trade });
      }
    });

    it('draws its target and goal from those its trade leans to', () => {
      for (const trade of TRADES) {
        for (const offer of offersOf(trade)) {
          expect(TRADE_LEAN[trade].targets).toContain(offer.target.kind);
          expect(TRADE_LEAN[trade].goals).toContain(offer.goal.kind);
        }
      }
    });

    it('leads a main offer with a signature and ends it with a goal bonus', () => {
      for (const salt of SALTS) {
        const perks = drawSponsorOffer(request({ salt }))?.perks ?? [];

        expect(SIGNATURES).toContain(perks[0]?.kind);
        expect(perks[1]?.kind).toBe('racePay');
        expect(perks.at(-1)?.kind).toBe('goalBonus');
      }
    });

    it('gives a partner neither a signature, a goal bonus nor a signing bonus', () => {
      for (const salt of SALTS) {
        const kinds = (drawSponsorOffer(request({ salt, slot: 'partner' }))?.perks ?? []).map((perk) => perk.kind);

        expect(kinds[0]).toBe('racePay');
        expect(kinds.some((kind) => [...SIGNATURES, 'goalBonus', 'signing'].includes(kind))).toBe(false);
      }
    });

    it('never offers to climb from the top rung', () => {
      for (const trade of TRADES.filter((one) => TRADE_LEAN[one].signatures[0] === 'climbs')) {
        for (const salt of SALTS) {
          const offer = drawSponsorOffer(request({ salt, held: allBut(trade), level: levels(1) }));

          expect(offer?.perks[0]?.kind).not.toBe('climbs');
        }
      }
    });

    it('covers a championship only one of the discipline it covers, and names it', () => {
      const road = { series: 'road-cup', name: 'Road Cup', discipline: Discipline.ROAD };
      const sports = { series: 'gt-cup', name: 'GT Cup', discipline: Discipline.SPORTSCAR };
      const drawn = SALTS.map((salt) => drawSponsorOffer(request({
        salt, held: allBut('tyres'), raced: [Discipline.ROAD], championships: [road, sports],
      })));
      const named = drawn.find((offer) => offer?.perks[0]?.kind === 'championship');
      const elsewhere = SALTS.map((salt) => drawSponsorOffer(request({
        salt, held: allBut('tyres'), raced: [Discipline.ROAD], championships: [sports],
      })));

      expect(named?.covers).toBe(Discipline.ROAD);
      expect(named?.perks[0]).toEqual({ kind: 'championship', series: 'road-cup', seriesName: 'Road Cup' });
      expect(elsewhere.every((offer) => offer?.perks[0]?.kind === 'climbs')).toBe(true);
    });

    it('covers a discipline for a trade that leans on one, and any racing otherwise', () => {
      for (const salt of SALTS) {
        const offer = drawSponsorOffer(request({ salt }));
        if (offer && TRADE_LEAN[offer.sponsor.trade].discipline) {
          expect(Object.values(Discipline)).toContain(offer.covers);
        } else {
          expect(offer?.covers).toBeNull();
        }
      }
    });

    it("draws on the rung of the discipline it covers, and the career's best for any racing", () => {
      const level = { ...levels(4), [Discipline.ROAD]: 3 };

      expect(drawSponsorOffer(request({ held: allBut('tyres'), level, raced: [Discipline.ROAD] }))?.rung).toBe(3);
      expect(drawSponsorOffer(request({ held: allBut('tyres'), level, raced: [Discipline.TOURING] }))?.rung).toBe(4);
      expect(drawSponsorOffer(request({ held: allBut('drinks'), level }))?.rung).toBe(3);
    });

    it("scales its figures with the career's prize speed", () => {
      expect(racePay({ prizeSpeed: 2 })).toBeGreaterThan(racePay({ prizeSpeed: 1 }) * 1.5);
    });

    it("scales its figures with the rung's typical entry fee", () => {
      for (const slot of ['main', 'partner'] as const) {
        expect(racePay({ slot, level: levels(1) })).toBeGreaterThan(racePay({ slot, level: levels(5) }));
      }
    });

    it('draws its signature from any its trade leans to, not only the first', () => {
      const kinds = new Set(offersOf('finance').map((offer) => offer.perks[0].kind));

      expect(kinds).toEqual(new Set(['seatBacking', 'carBacking', 'climbs']));
    });

    it('pays half of a seat for seat backing', () => {
      const backing = offersOf('finance').map((offer) => offer.perks[0]).find((perk) => perk.kind === 'seatBacking');

      expect(backing).toEqual({ kind: 'seatBacking', share: 50 });
    });

    it('names a reward among the cars of the discipline it covers, without what found it', () => {
      const cars = offersOf('dealer', { rewards: REWARDS, raced: [Discipline.ROAD] })
        .flatMap((offer) => (offer.perks[0].kind === 'carReward' ? [offer.perks[0].car] : []));

      expect(cars.length).toBeGreaterThan(0);
      for (const car of cars) {
        expect(car).toEqual({
          model: 'road_car', name: 'Road Car', price: 40_000, skin: 'red',
        });
      }
    });

    it('offers no reward with no car to name, in what it covers or at all', () => {
      const none = offersOf('dealer', { raced: [Discipline.ROAD] });
      const elsewhere = offersOf('dealer', { rewards: REWARDS, raced: [Discipline.TOURING] });

      expect([...none, ...elsewhere].some((offer) => offer.perks[0].kind === 'carReward')).toBe(false);
    });

    it('keeps cost shares and repaints to a partner, and draws a share inside its range', () => {
      const partner = offersOf('parts', { slot: 'partner' }).flatMap((offer) => offer.perks);
      const rent = partner.find((perk) => perk.kind === 'rentShare');
      const main = TRADES.flatMap((trade) => offersOf(trade)).flatMap((offer) => offer.perks);

      expect(main.some((perk) => PARTNER_ONLY.includes(perk.kind))).toBe(false);
      expect(partner.some((perk) => perk.kind === 'repaints')).toBe(true);
      expect(rent?.share).toBeGreaterThanOrEqual(COST_SHARE_RANGE.rentShare[0]);
      expect(rent?.share).toBeLessThanOrEqual(COST_SHARE_RANGE.rentShare[1]);
    });

    it('gives a perk that helps no figure at all', () => {
      const helps = offersOf('drinks').flatMap((offer) => offer.perks).find((perk) => perk.kind === 'teamInterest');

      expect(helps).toEqual({ kind: 'teamInterest' });
    });
  });

  describe('drawRenewal', () => {
    it("keeps the deal's sponsor, slot, cover, target and goal, saying what it renews", () => {
      const deal = makeDeal([{ kind: 'racePay', amount: 500 }], { covers: Discipline.ROAD });

      expect(drawRenewal(renewal(deal))).toMatchObject({
        sponsor: deal.sponsor, slot: 'main', covers: Discipline.ROAD, target: deal.target, goal: deal.goal, renews: 'deal',
      });
    });

    it('reads the rung the career holds now, in the discipline a deal covers', () => {
      const level = { ...levels(4), [Discipline.ROAD]: 3, [Discipline.TOURING]: 2 };

      expect(drawRenewal(renewal(makeDeal([], { covers: Discipline.ROAD }), { level })).rung).toBe(3);
      expect(drawRenewal(renewal(makeDeal([]), { level })).rung).toBe(2);
    });

    it('draws a figure again, saying what it was when it rose', () => {
      const [pay] = drawRenewal(renewal(makeDeal([{ kind: 'racePay', amount: 10 }]))).perks;

      expect(pay.amount).toBeGreaterThan(10);
      expect(pay.was).toBe(10);
    });

    it('never draws a figure down, and says nothing of one that held', () => {
      const [pay, share] = drawRenewal(renewal(makeDeal([
        { kind: 'racePay', amount: 1_000_000 }, { kind: 'prizeMatch', share: 99 },
      ]))).perks;

      expect(pay).toEqual({ kind: 'racePay', amount: 1_000_000 });
      expect(share).toEqual({ kind: 'prizeMatch', share: 99 });
    });

    it('draws a share again, saying what it was when it rose', () => {
      const [share] = drawRenewal(renewal(makeDeal([{ kind: 'feeShare', share: 1 }]))).perks;

      expect(share.share).toBeGreaterThanOrEqual(COST_SHARE_RANGE.feeShare[0]);
      expect(share.was).toBe(1);
    });

    it('keeps a perk with no figure to draw as it stands', () => {
      const perks: SponsorPerk[] = [{ kind: 'carBacking', share: 50 }, { kind: 'repaints' }, { kind: 'climbs' }];

      expect(drawRenewal(renewal(makeDeal(perks))).perks).toEqual(perks);
    });

    it('says nothing of what the renewal before this one changed', () => {
      const [pay] = drawRenewal(renewal(makeDeal([{ kind: 'racePay', amount: 1_000_000, was: 5 }]))).perks;

      expect(pay).not.toHaveProperty('was');
    });

    it('starts a climbing deal from what it pays now', () => {
      const deal = makeDeal([{ kind: 'climbs' }, { kind: 'racePay', amount: 600_000 }]);

      expect(drawRenewal(renewal(deal, { level: levels(3) })).perks[1].amount).toBe(1_000_000);
    });

    // Guards a fix: the scale read the career's best while the draw read the
    // deal's own rung, so a deal that had not climbed renewed as if it had.
    it("reads a deal covering a discipline on that rung, whatever the career's best", () => {
      const deal = makeDeal([{ kind: 'climbs' }, { kind: 'racePay', amount: 600_000 }], { covers: Discipline.ROAD });
      const level = { ...levels(4), [Discipline.TOURING]: 1 };

      expect(drawRenewal(renewal(deal, { level })).perks[1].amount).toBe(600_000);
    });

    it('names a new car, of the highest rung open for a deal covering any racing, saying which it was', () => {
      const reward: SponsorPerk = {
        kind: 'carReward',
        car: {
          model: 'old_car', name: 'Old Car', price: 30_000,
        },
      };
      const [perk] = drawRenewal(renewal(makeDeal([reward]), { rewards: REWARDS })).perks;

      expect(perk).toEqual({
        kind: 'carReward',
        car: {
          model: 'gt_car', name: 'GT Car', price: 100_000,
        },
        wasCar: 'Old Car',
      });
    });

    it('names a car of the discipline a deal covers, never the one it named', () => {
      const reward: SponsorPerk = {
        kind: 'carReward',
        car: {
          model: 'gt_car', name: 'GT Car', price: 100_000,
        },
      };
      const road = makeDeal([reward], { covers: Discipline.ROAD });
      const sports = makeDeal([reward], { covers: Discipline.SPORTSCAR });

      expect(drawRenewal(renewal(road, { rewards: REWARDS })).perks[0].car?.model).toBe('road_car');
      expect(drawRenewal(renewal(sports, { rewards: REWARDS })).perks[0]).toEqual(reward);
    });

    it('keeps the car it named with no other left to name', () => {
      const reward: SponsorPerk = {
        kind: 'carReward',
        car: {
          model: 'old_car', name: 'Old Car', price: 30_000,
        },
      };

      expect(drawRenewal(renewal(makeDeal([reward]))).perks).toEqual([reward]);
    });

    it('draws the same renewal off the same salt', () => {
      const deal = makeDeal([{ kind: 'racePay', amount: 10 }]);

      expect(drawRenewal(renewal(deal))).toEqual(drawRenewal(renewal(deal)));
    });
  });
});
