import { describe, expect, it } from '@jest/globals';

import {
  carBadgeUrl,
  carSkinUrl,
  isSafeSegment,
  parseContentUrl,
  trackOutlineUrl,
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
