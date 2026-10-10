import { describe, expect, it } from '@jest/globals';

import { DLCPack, ModDistributor, ModMaker } from '../../../types/index.ts';
import type {
  HiddenContentSources, RequirementPool, SeriesListing, SeriesOrigin, SeriesRequirements,
} from '../../../types/index.ts';
import {
  hiddenBySources, hiddenCount, isOffered, poolHolds,
} from '../content-sources.ts';

/**
 * Nothing switched off.
 */
const NONE: HiddenContentSources = { packs: [], makers: [], distributors: [] };

/**
 * Some sources switched off, the rest on.
 * @param switchedOff The sources switched off
 * @returns The switches
 */
const hiding = (switchedOff: Partial<HiddenContentSources>): HiddenContentSources => ({ ...NONE, ...switchedOff });

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
  rounds: { packs: [], makers: [], distributors: [] },
  widenedBy: { packs: [], makers: [], distributors: [] },
  ...overrides,
});

/**
 * A spec grid of two base cars, one Ready to Race car and one RSS car.
 * @param minModels How many of them the spec needs
 * @returns The pool
 */
const mixedPool = (minModels: number): RequirementPool => ({
  minModels,
  cars: [
    { pack: null, maker: null, distributor: null },
    { pack: null, maker: null, distributor: null },
    { pack: DLCPack.READY_TO_RACE, maker: null, distributor: null },
    { pack: null, maker: ModMaker.RSS, distributor: null },
  ],
});

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
  describe('poolHolds', () => {
    it('holds while enough of the grid is still switched on', () => {
      expect(poolHolds(mixedPool(3), hiding({ packs: [DLCPack.READY_TO_RACE] }))).toBe(true);
    });

    it('falls short once the switched-off sources take it below its floor', () => {
      expect(poolHolds(mixedPool(3), hiding({ packs: [DLCPack.READY_TO_RACE], makers: [ModMaker.RSS] }))).toBe(false);
    });

    it('counts a redistributor\'s cars as switched off with it', () => {
      const pool: RequirementPool = {
        minModels: 2,
        cars: [
          { pack: null, maker: null, distributor: null },
          { pack: null, maker: null, distributor: ModDistributor.LFM },
        ],
      };

      expect(poolHolds(pool, NONE)).toBe(true);
      expect(poolHolds(pool, hiding({ distributors: [ModDistributor.LFM] }))).toBe(false);
    });

    it('never counts base content as switched off', () => {
      expect(poolHolds(mixedPool(2), {
        packs: Object.values(DLCPack), makers: Object.values(ModMaker), distributors: Object.values(ModDistributor),
      }))
        .toBe(true);
    });
  });

  describe('isOffered', () => {
    it('offers a championship whose needs are all switched on', () => {
      expect(isOffered(requiring({ packs: [DLCPack.READY_TO_RACE] }), NONE)).toBe(true);
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

    it('offers a spec championship while its grid keeps its floor', () => {
      const requires = requiring({ pools: [mixedPool(3)] });

      expect(isOffered(requires, hiding({ packs: [DLCPack.READY_TO_RACE] }))).toBe(true);
    });

    // Two sources neither of which the spec needs alone can still leave it short
    // together, which is why the pools travel beside the needed lists.
    it('withholds a spec championship once several switches together empty its grid', () => {
      const requires = requiring({ pools: [mixedPool(3)] });

      expect(isOffered(requires, hiding({ packs: [DLCPack.READY_TO_RACE], makers: [ModMaker.RSS] }))).toBe(false);
    });
  });

  describe('hiddenBySources', () => {
    const needsRtr = requiring({ packs: [DLCPack.READY_TO_RACE] });
    const hidden = { packs: [DLCPack.READY_TO_RACE], makers: [], distributors: [] };

    it('hides a championship the app ships that is not offered', () => {
      expect(hiddenBySources(listing('shipped', needsRtr), hidden)).toBe(true);
    });

    it('never hides one the user wrote or adjusted', () => {
      expect(hiddenBySources(listing('user', needsRtr), hidden)).toBe(false);
      expect(hiddenBySources(listing('adjusted', needsRtr), hidden)).toBe(false);
    });

    it('leaves an offered championship alone', () => {
      expect(hiddenBySources(listing('shipped', needsRtr), NONE)).toBe(false);
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
