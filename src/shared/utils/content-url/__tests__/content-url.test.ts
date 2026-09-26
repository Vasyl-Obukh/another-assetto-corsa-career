import { describe, expect, it } from '@jest/globals';

import {
  carBadgeUrl,
  carLiveryUrl,
  carSkinUrl,
  isSafeSegment,
  isServableLayout,
  nationFlagUrl,
  parseContentUrl,
  trackLogoUrl,
  trackOutlineUrl,
  trackPhotoUrl,
  trackPreviewUrl,
} from '../content-url.ts';

describe('shared/utils/content-url', () => {
  describe('isSafeSegment', () => {
    it('accepts an ordinary folder name', () => {
      expect(isSafeSegment('ks_mazda_787b')).toBe(true);
    });

    it('accepts the spaces and brackets mod folders actually use', () => {
      expect(isSafeSegment('pureCtrl static')).toBe(true);
      expect(isSafeSegment('Porsche 911 (992)')).toBe(true);
    });

    it('refuses anything that could climb out of a folder', () => {
      expect(isSafeSegment('..')).toBe(false);
      expect(isSafeSegment('.')).toBe(false);
      expect(isSafeSegment('')).toBe(false);
      expect(isSafeSegment('a/b')).toBe(false);
      expect(isSafeSegment('a\\b')).toBe(false);
    });

    it('refuses a drive letter, a UNC prefix and a NUL', () => {
      expect(isSafeSegment('C:')).toBe(false);
      expect(isSafeSegment('\\\\server')).toBe(false);
      expect(isSafeSegment('name\u0000.png')).toBe(false);
    });
  });

  describe('isServableLayout', () => {
    it('serves a circuit and its layout when both names are plain folders', () => {
      expect(isServableLayout('spa', 'gp')).toBe(true);
    });

    it('serves a circuit with no layouts, whose layout name is empty', () => {
      expect(isServableLayout('magione', '')).toBe(true);
    });

    it('refuses a circuit or a layout a path could be smuggled through', () => {
      expect(isServableLayout('..', 'gp')).toBe(false);
      expect(isServableLayout('spa', 'gp/../..')).toBe(false);
      expect(isServableLayout('', '')).toBe(false);
    });
  });

  describe('carSkinUrl', () => {
    it('builds a livery URL', () => {
      expect(carSkinUrl('ks_mazda_787b', '00_racing'))
        .toBe('accontent://car/ks_mazda_787b/skin/00_racing');
    });

    it('escapes the spaces and brackets mod folders use', () => {
      expect(carSkinUrl('Porsche 911 (992)', 'red skin'))
        .toBe('accontent://car/Porsche%20911%20(992)/skin/red%20skin');
    });
  });

  describe('carLiveryUrl', () => {
    it('builds a livery swatch URL', () => {
      expect(carLiveryUrl('Porsche 911 (992)', 'red skin'))
        .toBe('accontent://car/Porsche%20911%20(992)/livery/red%20skin');
    });
  });

  describe('carBadgeUrl', () => {
    it('builds a badge URL', () => {
      expect(carBadgeUrl('abarth500')).toBe('accontent://car/abarth500/badge');
    });
  });

  describe('trackPreviewUrl', () => {
    it('leaves the layout off a single-layout track', () => {
      expect(trackPreviewUrl('spa', '')).toBe('accontent://track/spa/preview');
    });

    it('appends the layout when there is one', () => {
      expect(trackPreviewUrl('multi', 'gp')).toBe('accontent://track/multi/preview/gp');
    });
  });

  describe('trackOutlineUrl', () => {
    it('builds an outline URL, with or without a layout', () => {
      expect(trackOutlineUrl('spa', '')).toBe('accontent://track/spa/outline');
      expect(trackOutlineUrl('multi', 'gp')).toBe('accontent://track/multi/outline/gp');
    });
  });

  describe('trackPhotoUrl', () => {
    it('names the photograph before the layout, with or without one', () => {
      expect(trackPhotoUrl('spa', '', 'bgr00')).toBe('accontent://track/spa/bgr00');
      expect(trackPhotoUrl('multi', 'gp', 'bgr03')).toBe('accontent://track/multi/bgr03/gp');
    });
  });

  describe('trackLogoUrl', () => {
    it('builds a logo URL, with or without a layout', () => {
      expect(trackLogoUrl('spa', '')).toBe('accontent://track/spa/logo');
      expect(trackLogoUrl('multi', 'gp')).toBe('accontent://track/multi/logo/gp');
    });
  });

  describe('nationFlagUrl', () => {
    it('names the flag by its code alone', () => {
      expect(nationFlagUrl('ITA')).toBe('accontent://flag/ITA');
    });
  });

  describe('parseContentUrl', () => {
    it('round-trips every kind of target', () => {
      expect(parseContentUrl(carSkinUrl('car_a', 'red')))
        .toEqual({ kind: 'carSkin', carId: 'car_a', skinId: 'red' });
      expect(parseContentUrl(carBadgeUrl('car_a')))
        .toEqual({ kind: 'carBadge', carId: 'car_a' });
      expect(parseContentUrl(trackPreviewUrl('spa', '')))
        .toEqual({ kind: 'trackPreview', trackId: 'spa', layout: '' });
      expect(parseContentUrl(trackOutlineUrl('multi', 'gp')))
        .toEqual({ kind: 'trackOutline', trackId: 'multi', layout: 'gp' });
      expect(parseContentUrl(carLiveryUrl('car_a', 'red')))
        .toEqual({ kind: 'carLivery', carId: 'car_a', skinId: 'red' });
      expect(parseContentUrl(trackLogoUrl('multi', 'gp')))
        .toEqual({ kind: 'trackLogo', trackId: 'multi', layout: 'gp' });
      expect(parseContentUrl(trackPhotoUrl('multi', 'gp', 'bgr01')))
        .toEqual({
          kind: 'trackPhoto', trackId: 'multi', layout: 'gp', photo: 'bgr01',
        });
      expect(parseContentUrl(trackPhotoUrl('spa', '', 'bgr00')))
        .toEqual({
          kind: 'trackPhoto', trackId: 'spa', layout: '', photo: 'bgr00',
        });
      expect(parseContentUrl(nationFlagUrl('GBR'))).toEqual({ kind: 'nationFlag', code: 'GBR' });
      expect(parseContentUrl(nationFlagUrl('SCT'))).toEqual({ kind: 'nationFlag', code: 'SCT' });
    });

    // The photograph's name is the segment itself, so only AC's own numbered
    // pattern may select a file there.
    it('refuses a photograph AC would not have named', () => {
      expect(parseContentUrl('accontent://track/spa/bgr1')).toBeNull();
      expect(parseContentUrl('accontent://track/spa/bgr001')).toBeNull();
      expect(parseContentUrl('accontent://track/spa/preview.png')).toBeNull();
    });

    it('refuses a flag AC does not ship, or anything more than a code', () => {
      expect(parseContentUrl('accontent://flag/XYZ')).toBeNull();
      expect(parseContentUrl('accontent://flag/ita')).toBeNull();
      expect(parseContentUrl('accontent://flag/ITA/extra')).toBeNull();
      expect(parseContentUrl('accontent://flag')).toBeNull();
    });

    it('round-trips ids carrying spaces and brackets', () => {
      const url = carSkinUrl('Porsche 911 (992)', 'red skin');
      expect(parseContentUrl(url))
        .toEqual({ kind: 'carSkin', carId: 'Porsche 911 (992)', skinId: 'red skin' });
    });

    // Chromium lowercases the host of a standard scheme, which is why the kind
    // lives there and the identity - whose case matters - lives in the path.
    it('keeps the case of an id while ignoring the case of the kind', () => {
      expect(parseContentUrl('accontent://CAR/Car_A/badge'))
        .toEqual({ kind: 'carBadge', carId: 'Car_A' });
    });

    it('refuses a traversal, however it is encoded', () => {
      expect(parseContentUrl('accontent://car/..%2F..%2Fwindows/badge')).toBeNull();
      expect(parseContentUrl('accontent://car/%2E%2E/badge')).toBeNull();
      expect(parseContentUrl('accontent://car/a%5Cb/badge')).toBeNull();
    });

    it('refuses a broken percent escape rather than throwing', () => {
      expect(parseContentUrl('accontent://car/%zz/badge')).toBeNull();
    });

    it('refuses another scheme', () => {
      expect(parseContentUrl('file:///c:/windows/win.ini')).toBeNull();
      expect(parseContentUrl('https://example.com/car/a/badge')).toBeNull();
    });

    it('refuses a host it does not serve', () => {
      expect(parseContentUrl('accontent://weather/rain/badge')).toBeNull();
    });

    it('refuses a shape it does not recognise', () => {
      expect(parseContentUrl('accontent://car/car_a')).toBeNull();
      expect(parseContentUrl('accontent://car/car_a/nonsense')).toBeNull();
      expect(parseContentUrl('accontent://car/car_a/badge/extra')).toBeNull();
      expect(parseContentUrl('accontent://car/car_a/skin')).toBeNull();
      expect(parseContentUrl('accontent://car/car_a/livery')).toBeNull();
      expect(parseContentUrl('accontent://track/spa/preview/gp/extra')).toBeNull();
    });

    // Nothing chooses the filename but us, so a URL cannot ask for one.
    it('refuses a URL that names a file', () => {
      expect(parseContentUrl('accontent://car/car_a/ui/badge.png')).toBeNull();
    });

    it('is null rather than throwing on anything that is not a URL', () => {
      expect(parseContentUrl('')).toBeNull();
      expect(parseContentUrl('not a url at all')).toBeNull();
    });
  });
});
