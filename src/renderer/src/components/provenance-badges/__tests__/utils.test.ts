import { describe, expect, it } from '@jest/globals';

import {
  ContentSource, DLCPack, ModDistributor, ModMaker,
} from '../../../../../shared/types';
import {
  distributorKey,
  distributorTagKey,
  makerKey,
  makerTagKey,
  packKey,
  packNameKey,
  SOURCE_TAG_CLASS,
  sourceKey,
  sourceTagKey,
} from '../utils.ts';

describe('renderer/components/provenance-badges/utils', () => {
  describe('sourceKey', () => {
    it('translates every source the catalogue can report', () => {
      expect(Object.values(ContentSource).map(sourceKey)).toEqual([
        'content.source.base',
        'content.source.dlc',
        'content.source.mod',
      ]);
    });

    // Facet values arrive as plain strings from main, so an unknown one has to
    // be shown as it came rather than as a missing translation.
    it('has no key for a value it does not know', () => {
      expect(sourceKey('something-else')).toBeNull();
    });
  });

  describe('packKey', () => {
    it('translates every pack', () => {
      const keys = Object.values(DLCPack).map(packKey);

      expect(keys).toHaveLength(11);
      expect(keys.every((key) => key !== null)).toBe(true);
    });

    it('has no key for a pack this build does not carry', () => {
      expect(packKey('dream-pack-4')).toBeNull();
    });
  });

  describe('makerKey', () => {
    it('translates every mod maker', () => {
      expect(Object.values(ModMaker).map(makerKey)).toEqual([
        'content.maker.rss',
        'content.maker.vrc',
        'content.maker.urd',
        'content.maker.guerilla',
        'content.maker.yezhrod',
      ]);
    });

    it('has no key for a maker it does not know', () => {
      expect(makerKey('some-team')).toBeNull();
    });
  });

  describe('distributorKey', () => {
    it('translates every redistributor', () => {
      expect(distributorKey(ModDistributor.LFM)).toBe('content.distributor.lfm');
    });

    it('has no key for a redistributor it does not know', () => {
      expect(distributorKey('someone-else')).toBeNull();
    });
  });

  // The tag keys are the short forms the badge shows, as against the long ones
  // the filter list uses: "RSS" on a card, "Race Sim Studio" in the filter.
  describe('sourceTagKey', () => {
    it('gives a badge key for every source', () => {
      expect(Object.values(ContentSource).map(sourceTagKey)).toEqual([
        'content.sourceTag.base',
        'content.sourceTag.dlc',
        'content.sourceTag.mod',
      ]);
    });
  });

  describe('makerTagKey', () => {
    it('gives a badge key for every maker', () => {
      expect(Object.values(ModMaker).map(makerTagKey)).toEqual([
        'content.makerTag.rss',
        'content.makerTag.vrc',
        'content.makerTag.urd',
        'content.makerTag.guerilla',
        'content.makerTag.yezhrod',
      ]);
    });

    it('differs from the filter-list key, which is spelled out in full', () => {
      expect(makerTagKey(ModMaker.RSS)).not.toBe(makerKey(ModMaker.RSS));
    });
  });

  describe('distributorTagKey', () => {
    it('gives a badge key for every redistributor', () => {
      expect(distributorTagKey(ModDistributor.LFM)).toBe('content.distributorTag.lfm');
    });
  });

  describe('packNameKey', () => {
    // The badge reads "DLC - Dream Pack 1", built from content.packTag and this
    // name, so the pack must resolve to a bare name rather than a whole label.
    it('names a pack for the badge to interpolate', () => {
      expect(packNameKey(DLCPack.DREAM_PACK_1)).toBe('content.pack.dream-pack-1');
      expect(packNameKey(DLCPack.FERRARI_70TH)).toBe('content.pack.ferrari-70th');
    });
  });

  describe('SOURCE_TAG_CLASS', () => {
    // Source badges are app-defined rather than read out of the content, so they
    // carry their own colour instead of the default badge styling.
    it('colours every source distinctly', () => {
      const classes = Object.values(ContentSource).map((source) => SOURCE_TAG_CLASS[source]);

      expect(new Set(classes).size).toBe(classes.length);
      expect(classes.every((value) => value.includes('provenance'))).toBe(true);
    });
  });
});
