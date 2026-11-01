import { describe, expect, it } from '@jest/globals';

import { Discipline } from '../../../shared/types/index.ts';
import type { SponsorPerkKind, SponsorTrade } from '../../../shared/types/index.ts';
import { randomFrom, seedFrom } from '../../seeded-random/index.ts';
import {
  FORM_CHANCE, REPLACE_FACTOR, SPONSOR_BOOK, STANDOUT_CHANCE, TRADE_LEAN, TRADES,
} from '../constants.ts';
import { drawSponsorOffer, sponsorChance, sponsorDrawn } from '../sponsor-offers.ts';
import type { SponsorDrawRequest } from '../types.ts';

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
const SIGNATURES: readonly SponsorPerkKind[] = ['championship', 'climbs', 'carBacking'];

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
      const [left, ...taken] = SPONSOR_BOOK.oil.map((one) => one.name);
      for (const salt of SALTS) {
        expect(drawSponsorOffer(request({ salt, held: allBut('oil'), names: taken }))?.sponsor.name).toBe(left);
      }
    });

    it('falls back on the whole book once every name is taken', () => {
      const names = SPONSOR_BOOK.oil.map((one) => one.name);

      expect(names).toContain(drawSponsorOffer(request({ held: allBut('oil'), names }))?.sponsor.name);
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
      const named = drawSponsorOffer(request({ held: allBut('tyres'), raced: [Discipline.ROAD], championships: [road, sports] }));
      const elsewhere = drawSponsorOffer(request({ held: allBut('tyres'), raced: [Discipline.ROAD], championships: [sports] }));

      expect(named?.covers).toBe(Discipline.ROAD);
      expect(named?.perks[0]).toEqual({ kind: 'championship', series: 'road-cup', seriesName: 'Road Cup' });
      expect(elsewhere?.perks[0]?.kind).toBe('climbs');
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
  });
});
