import { describe, expect, it } from '@jest/globals';

import { DLCPack, ModDistributor, ModMaker } from '../../../types/index.ts';
import type {
  ContentSources, RequirementPool, SeriesListing, SeriesOrigin, SeriesRequirements,
} from '../../../types/index.ts';
import {
  ALL_CONTENT_SOURCES, allSourcesBut, hiddenBySources, hiddenCount, isOffered, poolHolds,
} from '../content-sources.ts';

/**
 * Nothing switched on, as a fresh install starts.
 */
const NOTHING_ON: ContentSources = { packs: [], makers: [], distributors: [] };

/**
 * Some sources switched off, the rest on.
 * @param switchedOff The sources switched off
 * @returns The switches
 */
const hiding = (switchedOff: Partial<ContentSources>): ContentSources => allSourcesBut(switchedOff);

/**
 * Requirements naming nothing, for a test to add to.
 * @param overrides What the championship needs
 * @returns The requirements
 */
const requiring = (overrides: Partial<SeriesRequirements> = {}): SeriesRequirements => ({
  sources: [],
  packs: [],
  makers: [],
  distributors: [],
  pools: [],
  rounds: { packs: [] },
  widenedBy: { packs: [], makers: [], distributors: [] },
  ...overrides,
});

/**
 * A spec grid of one Ready to Race car and one RSS car.
 */
const modPool: RequirementPool = {
  cars: [
    { pack: DLCPack.READY_TO_RACE, maker: null, distributor: null },
    { pack: null, maker: ModMaker.RSS, distributor: null },
  ],
};

/**
 * A listing carrying nothing but what the switches read.
 * @param origin Whose championship it is
 * @param requires What it needs
 * @returns The listing
 */
const listing = (origin: SeriesOrigin, requires: SeriesRequirements): SeriesListing => ({
  series: { id: 'cup' } as SeriesListing['series'],
  availability: { requires } as SeriesListing['availability'],
  origin,
  activeByDefault: true,
  filler: false,
  event: null,
});

describe('shared/utils/content-sources', () => {
  describe('allSourcesBut', () => {
    it('switches every source on but the ones given', () => {
      const on = allSourcesBut({ packs: [DLCPack.READY_TO_RACE], makers: [ModMaker.RSS] });

      expect(on.packs).not.toContain(DLCPack.READY_TO_RACE);
      expect(on.packs).toContain(DLCPack.RED_PACK);
      expect(on.makers).not.toContain(ModMaker.RSS);
      expect(on.makers).toContain(ModMaker.VRC);
      expect(on.distributors).toEqual(ALL_CONTENT_SOURCES.distributors);
    });

    it('switches everything on when nothing is left off', () => {
      expect(allSourcesBut({})).toEqual(ALL_CONTENT_SOURCES);
    });
  });

  describe('poolHolds', () => {
    it('holds while any of the grid is still switched on', () => {
      expect(poolHolds(modPool, hiding({ packs: [DLCPack.READY_TO_RACE] }))).toBe(true);
    });

    it('falls short once the switched-off sources take every car of it', () => {
      expect(poolHolds(modPool, hiding({ packs: [DLCPack.READY_TO_RACE], makers: [ModMaker.RSS] }))).toBe(false);
    });

    it('counts a redistributor\'s cars as switched off with it', () => {
      const pool: RequirementPool = {
        cars: [{ pack: null, maker: null, distributor: ModDistributor.LFM }],
      };

      expect(poolHolds(pool, ALL_CONTENT_SOURCES)).toBe(true);
      expect(poolHolds(pool, hiding({ distributors: [ModDistributor.LFM] }))).toBe(false);
    });

    it('never counts base content as switched off', () => {
      const pool: RequirementPool = { cars: [...modPool.cars, { pack: null, maker: null, distributor: null }] };

      expect(poolHolds(pool, NOTHING_ON)).toBe(true);
    });
  });

  describe('isOffered', () => {
    // The switches start off: only what the player says they own is offered.
    it('offers a base-only championship and nothing else while nothing is switched on', () => {
      expect(isOffered(requiring(), NOTHING_ON)).toBe(true);
      expect(isOffered(requiring({ packs: [DLCPack.READY_TO_RACE] }), NOTHING_ON)).toBe(false);
      expect(isOffered(requiring({ pools: [modPool] }), NOTHING_ON)).toBe(false);
    });

    it('offers a championship whose needs are all switched on', () => {
      expect(isOffered(requiring({ packs: [DLCPack.READY_TO_RACE] }), ALL_CONTENT_SOURCES)).toBe(true);
    });

    it('withholds one needing a pack that is switched off', () => {
      expect(isOffered(requiring({ packs: [DLCPack.READY_TO_RACE] }), hiding({ packs: [DLCPack.READY_TO_RACE] })))
        .toBe(false);
    });

    it('withholds one needing a mod team that is switched off', () => {
      expect(isOffered(requiring({ makers: [ModMaker.VRC] }), hiding({ makers: [ModMaker.VRC] }))).toBe(false);
    });

    // A redistributor's cars credit no mod team, so its switch is the only one
    // that reaches them.
    it('withholds one needing a redistributor that is switched off', () => {
      const lfm = [ModDistributor.LFM];

      expect(isOffered(requiring({ distributors: lfm }), hiding({ distributors: lfm }))).toBe(false);
    });

    it('offers a spec championship while any of its grid is switched on', () => {
      const requires = requiring({ pools: [modPool] });

      expect(isOffered(requires, hiding({ packs: [DLCPack.READY_TO_RACE] }))).toBe(true);
    });

    // Two sources neither of which the spec needs alone can still leave it short
    // together, which is why the pools travel beside the needed lists.
    it('withholds a spec championship once several switches together empty its grid', () => {
      const requires = requiring({ pools: [modPool] });

      expect(isOffered(requires, hiding({ packs: [DLCPack.READY_TO_RACE], makers: [ModMaker.RSS] }))).toBe(false);
    });
  });

  describe('hiddenBySources', () => {
    const needsRtr = requiring({ packs: [DLCPack.READY_TO_RACE] });
    const hidden = hiding({ packs: [DLCPack.READY_TO_RACE] });

    it('hides a championship the app ships that is not offered', () => {
      expect(hiddenBySources(listing('shipped', needsRtr), hidden)).toBe(true);
    });

    it('never hides one the user wrote or adjusted', () => {
      expect(hiddenBySources(listing('user', needsRtr), hidden)).toBe(false);
      expect(hiddenBySources(listing('adjusted', needsRtr), hidden)).toBe(false);
    });

    it('leaves an offered championship alone', () => {
      expect(hiddenBySources(listing('shipped', needsRtr), ALL_CONTENT_SOURCES)).toBe(false);
    });
  });

  describe('hiddenCount', () => {
    it('counts only the championships the switches hide', () => {
      const listings = [
        listing('shipped', requiring({ packs: [DLCPack.READY_TO_RACE] })),
        listing('shipped', requiring()),
        listing('user', requiring({ packs: [DLCPack.READY_TO_RACE] })),
      ];

      expect(hiddenCount(listings, hiding({ packs: [DLCPack.READY_TO_RACE] }))).toBe(1);
    });
  });
});
