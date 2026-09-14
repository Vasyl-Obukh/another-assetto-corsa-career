import { describe, expect, it } from '@jest/globals';

import type { ContentProvenance } from '../../../types/index.ts';
import {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from '../../../types/index.ts';
import {
  isCatalogued, isInLibrary, isUserAdded, isUserAddedCircuit,
} from '../library.ts';

/**
 * Builds a provenance, anonymous mod unless told otherwise.
 * @param overrides The fields to set
 * @returns A complete provenance
 */
const provenance = (overrides: Partial<ContentProvenance> = {}): ContentProvenance => ({
  source: ContentSource.MOD,
  pack: null,
  maker: null,
  distributor: null,
  ...overrides,
});

describe('shared/utils/library', () => {
  describe('isCatalogued', () => {
    it('names base and DLC content on its source alone', () => {
      expect(isCatalogued(provenance({ source: ContentSource.BASE }))).toBe(true);
      expect(isCatalogued(provenance({ source: ContentSource.DLC, pack: DLCPack.DREAM_PACK_1 })))
        .toBe(true);
    });

    it('names a mod whose maker or redistributor is known', () => {
      expect(isCatalogued(provenance({ maker: ModMaker.RSS }))).toBe(true);
      expect(isCatalogued(provenance({ distributor: ModDistributor.LFM }))).toBe(true);
    });

    it('does not name a mod nobody claims', () => {
      expect(isCatalogued(provenance())).toBe(false);
    });
  });

  describe('isUserAdded', () => {
    it('is true for an anonymous mod the user listed', () => {
      expect(isUserAdded(provenance(), 'my_mod', ['my_mod'])).toBe(true);
    });

    it('is false for an anonymous mod the user did not list', () => {
      expect(isUserAdded(provenance(), 'my_mod', ['other_mod'])).toBe(false);
    });

    // A row the catalogue gains later must stop reading as the user's, rather
    // than the leftover entry in settings overriding what the catalogue says.
    it('is false for catalogued content even when the user listed it', () => {
      expect(isUserAdded(provenance({ source: ContentSource.BASE }), 'bmw_m3_e30', ['bmw_m3_e30']))
        .toBe(false);
    });
  });

  describe('isUserAddedCircuit', () => {
    // A circuit card carries the redistributor of any layout it holds, so an
    // added circuit with one LFM layout lost its Custom badge once added.
    it('still reads as the user\'s when one of its layouts is redistributed', () => {
      const circuit = provenance({ distributor: ModDistributor.LFM });

      expect(isUserAdded(circuit, 'portimao', ['portimao'])).toBe(false);
      expect(isUserAddedCircuit(circuit, 'portimao', ['portimao'])).toBe(true);
    });

    it('is false for a circuit its own records claim', () => {
      expect(isUserAddedCircuit(provenance({ maker: ModMaker.RSS }), 'rss_track', ['rss_track']))
        .toBe(false);
    });

    it('is false for a circuit the user did not add', () => {
      expect(isUserAddedCircuit(provenance(), 'portimao', [])).toBe(false);
    });
  });

  describe('isInLibrary', () => {
    it('offers catalogued content whether or not the user listed it', () => {
      expect(isInLibrary(provenance({ maker: ModMaker.VRC }), 'vrc_car', [])).toBe(true);
    });

    it('offers an anonymous mod only once the user has listed it', () => {
      expect(isInLibrary(provenance(), 'my_mod', [])).toBe(false);
      expect(isInLibrary(provenance(), 'my_mod', ['my_mod'])).toBe(true);
    });
  });
});
