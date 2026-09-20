import { describe, expect, it } from '@jest/globals';

import { DLCPack, ModDistributor, ModMaker } from '../../types/index.ts';
import { DISTRIBUTOR_PAGES, MAKER_PAGES, PACK_PAGES } from '../content-links.ts';

// `as const satisfies Record<...>` already fails the build when a pack or a
// maker has no page, so completeness is not what these guard. What the compiler
// cannot see is the string: a mistyped host ships silently and is only found by
// somebody clicking it.
const pages = [
  ...Object.values(PACK_PAGES),
  ...Object.values(MAKER_PAGES),
  ...Object.values(DISTRIBUTOR_PAGES),
];

describe('shared/constants/content-links', () => {
  describe('PACK_PAGES', () => {
    it('sends every pack to its own Steam app page', () => {
      const urls = Object.values(PACK_PAGES);

      expect(urls).toHaveLength(Object.values(DLCPack).length);
      expect(urls.every((url) => /^https:\/\/store\.steampowered\.com\/app\/\d+\/$/.test(url)))
        .toBe(true);
    });

    // The `/dlc/<id>` route one of Kunos' own markers writes lists the DLC *of*
    // an app, which is a different page from the DLC's own.
    it('never uses Steam\'s dlc-of-an-app route', () => {
      expect(Object.values(PACK_PAGES).some((url) => url.includes('/dlc/'))).toBe(false);
    });

    // Guards the swap this table was authored alongside: the Red Pack is Steam
    // app 493190 and the Tripl3 Pack 509350, which the provenance catalogue had
    // the wrong way round.
    it('keeps the Red Pack and the Tripl3 Pack apart', () => {
      expect(PACK_PAGES[DLCPack.RED_PACK]).toContain('493190');
      expect(PACK_PAGES[DLCPack.TRIPL3_PACK]).toContain('509350');
    });
  });

  describe('MAKER_PAGES', () => {
    it('sends every mod team somewhere of its own', () => {
      const urls = Object.values(MAKER_PAGES);

      expect(urls).toHaveLength(Object.values(ModMaker).length);
      expect(new Set(urls).size).toBe(urls.length);
    });
  });

  describe('DISTRIBUTOR_PAGES', () => {
    it('sends every redistributor to its platform', () => {
      expect(Object.values(DISTRIBUTOR_PAGES)).toHaveLength(Object.values(ModDistributor).length);
      expect(DISTRIBUTOR_PAGES[ModDistributor.LFM]).toContain('lowfuelmotorsport.com');
    });
  });

  // Every one of these is opened in the user's own browser, so a value that is
  // not an absolute https URL is either a dead link or a relative one resolving
  // against the renderer's own file:// origin.
  it('states every page as an absolute https URL', () => {
    pages.forEach((page) => {
      expect(() => new URL(page)).not.toThrow();
      expect(new URL(page).protocol).toBe('https:');
    });
  });
});
