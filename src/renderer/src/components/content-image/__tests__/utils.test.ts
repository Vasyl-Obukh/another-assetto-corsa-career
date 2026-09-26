import { describe, expect, it } from '@jest/globals';

import { carBadgeUrl, carLiveryUrl, carSkinUrl } from '../../../../../shared/utils/content-url';
import { carPictureSources, carSwatchSources } from '../utils.ts';

describe('renderer/components/content-image/utils', () => {
  describe('carPictureSources', () => {
    it('tries the livery\'s preview before the car\'s badge', () => {
      expect(carPictureSources('ks_audi_r8', 'red')).toEqual([carSkinUrl('ks_audi_r8', 'red'), carBadgeUrl('ks_audi_r8')]);
    });

    it('falls back to the badge alone with no livery, or one the URL grammar refuses', () => {
      expect(carPictureSources('ks_audi_r8')).toEqual([carBadgeUrl('ks_audi_r8')]);
      expect(carPictureSources('ks_audi_r8', '')).toEqual([carBadgeUrl('ks_audi_r8')]);
      expect(carPictureSources('ks_audi_r8', '../x')).toEqual([carBadgeUrl('ks_audi_r8')]);
    });

    it('asks for nothing for a car folder the URL grammar refuses', () => {
      expect(carPictureSources('../etc', 'red')).toEqual([]);
    });

    // Mod liveries are routinely named "2024_WEC_27_Heart Of Racing". Spaces are
    // legal in a segment and must not cost the livery its photo.
    it('serves a livery whose folder name contains spaces', () => {
      expect(carPictureSources('yzd_oreca_07_2017', '1 Oreca Showcar')).toEqual([
        'accontent://car/yzd_oreca_07_2017/skin/1%20Oreca%20Showcar',
        'accontent://car/yzd_oreca_07_2017/badge',
      ]);
    });

    it('percent-encodes an id rather than letting it break the URL', () => {
      expect(carPictureSources('car#1', 'skin#2')).toEqual([
        'accontent://car/car%231/skin/skin%232',
        'accontent://car/car%231/badge',
      ]);
    });
  });

  describe('carSwatchSources', () => {
    it('tries the livery\'s swatch before the car\'s badge', () => {
      expect(carSwatchSources('ks_audi_r8', 'red')).toEqual([carLiveryUrl('ks_audi_r8', 'red'), carBadgeUrl('ks_audi_r8')]);
    });

    it('falls back to the badge alone with no livery', () => {
      expect(carSwatchSources('ks_audi_r8')).toEqual([carBadgeUrl('ks_audi_r8')]);
    });

    it('asks for nothing for a car folder the URL grammar refuses', () => {
      expect(carSwatchSources('a/b')).toEqual([]);
    });
  });
});
