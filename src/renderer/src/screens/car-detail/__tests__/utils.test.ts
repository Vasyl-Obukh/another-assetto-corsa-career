import { describe, expect, it } from '@jest/globals';

import { makeSkin } from './fixtures.ts';
import { skinImageSources } from '../utils.ts';

describe('renderer/screens/car-detail/utils', () => {
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
