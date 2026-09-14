import { describe, expect, it } from '@jest/globals';

import { makeSkin } from './fixtures.ts';
import type { ClassCatalogue } from '../../../../../shared/types';
import { resolveCatalogue, SHIPPED_CATALOGUE } from '../../../../../shared/utils/car-classes';
import {
  pickedSpecs, seedPicks, skinImageSources, togglePick,
} from '../utils.ts';

/**
 * A catalogue holding a class with one spec and a class with two, both the
 * user's, so no test depends on how the shipped tables are laid out.
 */
const CATALOGUE: ClassCatalogue = resolveCatalogue({
  version: 1,
  classes: [{ id: 'single', name: 'Single' }, { id: 'double', name: 'Double' }],
  specs: [
    { id: 'single-a', name: 'Single A', class: 'single' },
    { id: 'double-a', name: 'Double A', class: 'double' },
    { id: 'double-b', name: 'Double B', class: 'double' },
  ],
  cars: { my_mod: ['double-b', 'single-a'] },
});

describe('renderer/screens/car-detail/utils', () => {
  describe('seedPicks', () => {
    it('opens on the car as it stands, classes in catalogue order', () => {
      expect(seedPicks('my_mod', CATALOGUE)).toEqual({
        classes: ['single', 'double'],
        specs: { single: 'single-a', double: 'double-b' },
      });
    });

    it('opens empty for a car on no grid', () => {
      expect(seedPicks('unknown_mod', SHIPPED_CATALOGUE)).toEqual({ classes: [], specs: {} });
    });
  });

  describe('togglePick', () => {
    it('ticks a class into catalogue order, whatever order it was ticked in', () => {
      const picks = togglePick({ classes: ['double'], specs: {} }, 'single', CATALOGUE);

      expect(picks.classes).toEqual(['single', 'double']);
    });

    it('chooses the spec of a class that has only one', () => {
      expect(togglePick({ classes: [], specs: {} }, 'single', CATALOGUE).specs).toEqual({ single: 'single-a' });
    });

    it('leaves the spec of a class with several for the second step', () => {
      expect(togglePick({ classes: [], specs: {} }, 'double', CATALOGUE).specs).toEqual({});
    });

    // Kept rather than cleared, so unticking a class by mistake and ticking it
    // again does not lose the spec picked for it.
    it('unticks a class and remembers the spec it held', () => {
      const picks = togglePick({ classes: ['double'], specs: { double: 'double-b' } }, 'double', CATALOGUE);

      expect(picks).toEqual({ classes: [], specs: { double: 'double-b' } });
    });
  });

  describe('pickedSpecs', () => {
    it('reads one spec per chosen class', () => {
      expect(pickedSpecs({ classes: ['single', 'double'], specs: { single: 'single-a', double: 'double-a' } }))
        .toEqual(['single-a', 'double-a']);
    });

    it('ignores a spec remembered for a class no longer chosen', () => {
      expect(pickedSpecs({ classes: ['single'], specs: { single: 'single-a', double: 'double-a' } }))
        .toEqual(['single-a']);
    });

    it('holds nothing to save while a chosen class lacks a spec', () => {
      expect(pickedSpecs({ classes: ['single', 'double'], specs: { single: 'single-a' } })).toBeNull();
    });

    it('saves no specs at all when no class is chosen', () => {
      expect(pickedSpecs({ classes: [], specs: {} })).toEqual([]);
    });
  });

  describe('skinImageSources', () => {
    it('prefers the livery photo, with the car badge behind it', () => {
      expect(skinImageSources('ks_ferrari_488_gt3', makeSkin('00_rosso_scuderia'))).toEqual([
        'accontent://car/ks_ferrari_488_gt3/skin/00_rosso_scuderia',
        'accontent://car/ks_ferrari_488_gt3/badge',
      ]);
    });

    // Mod liveries are routinely named "2024_WEC_27_Heart Of Racing". Spaces are
    // legal in a segment and must not cost the livery its photo.
    it('serves a livery whose folder name contains spaces', () => {
      expect(skinImageSources('yzd_oreca_07_2017', makeSkin('1 Oreca Showcar'))).toEqual([
        'accontent://car/yzd_oreca_07_2017/skin/1%20Oreca%20Showcar',
        'accontent://car/yzd_oreca_07_2017/badge',
      ]);
    });

    it('falls back to the badge when the livery folder could never be served', () => {
      expect(skinImageSources('yzd_oreca_07_2017', makeSkin('bad/name')))
        .toEqual(['accontent://car/yzd_oreca_07_2017/badge']);
    });

    it('offers nothing at all when the car folder itself cannot be served', () => {
      expect(skinImageSources('a/b', makeSkin('plain'))).toEqual([]);
    });

    it('percent-encodes an id rather than letting it break the URL', () => {
      expect(skinImageSources('car#1', makeSkin('skin#2'))).toEqual([
        'accontent://car/car%231/skin/skin%232',
        'accontent://car/car%231/badge',
      ]);
    });

    it('reads the folder name, not the display name', () => {
      const skin = makeSkin('00_rosso_scuderia', { name: 'Rosso Scuderia' });
      expect(skinImageSources('ks_ferrari_488_gt3', skin)[0])
        .toBe('accontent://car/ks_ferrari_488_gt3/skin/00_rosso_scuderia');
    });
  });
});
