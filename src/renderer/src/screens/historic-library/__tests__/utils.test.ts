import { describe, expect, it } from '@jest/globals';

import {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from '../../../../../shared/types';
import type { SeriesListing, SeriesRequirements } from '../../../../../shared/types';
import { eventRequirements, historicSwitches, offeredHere } from '../utils.ts';

/**
 * What a historic event needs, needing nothing unless a test says.
 * @param overrides What to change about it
 * @returns The requirements
 */
const requires = (overrides: Partial<SeriesRequirements> = {}): SeriesRequirements => ({
  sources: [ContentSource.BASE],
  packs: [],
  makers: [],
  distributors: [],
  pools: [],
  rounds: { packs: [], makers: [], distributors: [] },
  widenedBy: { packs: [], makers: [], distributors: [] },
  ...overrides,
});

/**
 * A historic event as the pool lists it, of ours and raceable unless a test
 * says otherwise.
 * @param overrides What to change about the listing
 * @param needs What it needs
 * @returns The listing
 */
const listing = (
  overrides: Partial<SeriesListing> = {},
  needs: SeriesRequirements = requires(),
): SeriesListing => ({
  series: { id: 'monza-1967' } as SeriesListing['series'],
  availability: {
    series: 'monza-1967', available: true, problems: [], entries: [], rounds: [], requires: needs,
  },
  origin: 'shipped',
  activeByDefault: true,
  filler: false,
  event: null,
  ...overrides,
});

/**
 * No content source switched off.
 */
const NOTHING_HIDDEN = { packs: [], makers: [], distributors: [] };

describe('renderer/screens/historic-library/utils', () => {
  describe('historicSwitches', () => {
    it("hands the historic events' switches over under the name the championship helpers read", () => {
      expect(historicSwitches({ historicActive: { 'monza-1967': false } }))
        .toEqual({ seriesActive: { 'monza-1967': false } });
    });
  });

  describe('eventRequirements', () => {
    it('counts what its one round needs as what the event needs', () => {
      const folded = eventRequirements(requires({
        packs: [DLCPack.RED_PACK],
        rounds: { packs: [DLCPack.READY_TO_RACE], makers: [ModMaker.RSS], distributors: [ModDistributor.LFM] },
      }));

      expect(folded.packs).toEqual([DLCPack.RED_PACK, DLCPack.READY_TO_RACE]);
      expect(folded.makers).toEqual([ModMaker.RSS]);
      expect(folded.distributors).toEqual([ModDistributor.LFM]);
      expect(folded.rounds).toEqual({ packs: [], makers: [], distributors: [] });
    });

    it('adds DLC to the sources for a pack the round needs, and Mod for a maker or a redistributor', () => {
      const pack = requires({ rounds: { packs: [DLCPack.RED_PACK], makers: [], distributors: [] } });
      const lfm = requires({ rounds: { packs: [], makers: [], distributors: [ModDistributor.LFM] } });

      expect(eventRequirements(pack).sources).toEqual([ContentSource.BASE, ContentSource.DLC]);
      expect(eventRequirements(lfm).sources).toEqual([ContentSource.BASE, ContentSource.MOD]);
    });

    it('names a source or a pack once when the event and its round both need it', () => {
      const folded = eventRequirements(requires({
        sources: [ContentSource.DLC],
        packs: [DLCPack.RED_PACK],
        rounds: { packs: [DLCPack.RED_PACK], makers: [], distributors: [] },
      }));

      expect(folded.sources).toEqual([ContentSource.DLC]);
      expect(folded.packs).toEqual([DLCPack.RED_PACK]);
    });

    it('leaves an event its round adds nothing to as it was', () => {
      const needs = requires({ makers: [ModMaker.RSS], sources: [ContentSource.MOD] });

      expect(eventRequirements(needs)).toEqual(needs);
    });
  });

  describe('offeredHere', () => {
    it('lists one of ours the install can race', () => {
      expect(offeredHere(listing(), NOTHING_HIDDEN)).toBe(true);
    });

    it('leaves out one of ours the install cannot race', () => {
      const missing = listing();

      expect(offeredHere({ ...missing, availability: { ...missing.availability, available: false } }, NOTHING_HIDDEN))
        .toBe(false);
    });

    it('leaves out one of ours needing a content source switched off', () => {
      const red = listing({}, requires({ sources: [ContentSource.DLC], packs: [DLCPack.RED_PACK] }));

      expect(offeredHere(red, { ...NOTHING_HIDDEN, packs: [DLCPack.RED_PACK] })).toBe(false);
    });

    it("always lists one of the user's own, whatever it needs and whatever is switched off", () => {
      const own = listing({ origin: 'user' }, requires({ sources: [ContentSource.DLC], packs: [DLCPack.RED_PACK] }));

      expect(offeredHere(
        { ...own, availability: { ...own.availability, available: false } },
        { ...NOTHING_HIDDEN, packs: [DLCPack.RED_PACK] },
      )).toBe(true);
    });
  });
});
