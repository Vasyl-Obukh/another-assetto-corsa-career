import { describe, expect, it } from '@jest/globals';

import { makeTrack } from './fixtures.ts';
import { isLocated, trackImageSources } from '../utils.ts';

describe('renderer/screens/track-browser/utils', () => {
  describe('trackImageSources', () => {
    it('prefers the photo, with the map outline behind it', () => {
      expect(trackImageSources(makeTrack({ id: 'ks_monza' }))).toEqual([
        'accontent://track/ks_monza/preview',
        'accontent://track/ks_monza/outline',
      ]);
    });

    // A single-layout track has an empty layout, which must not become a
    // trailing empty segment the parser would reject.
    it('leaves the layout segment off a single-layout track', () => {
      const [preview] = trackImageSources(makeTrack({ id: 'ks_monza', layout: '' }));

      expect(preview).toBe('accontent://track/ks_monza/preview');
    });

    it('appends the layout when there is one', () => {
      expect(trackImageSources(makeTrack({ id: 'spa', layout: 'gp' }))).toEqual([
        'accontent://track/spa/preview/gp',
        'accontent://track/spa/outline/gp',
      ]);
    });

    // VIR ships layouts named "full course". Spaces are legal in a segment and
    // must not cost the layout its preview.
    it('serves a layout whose folder name contains spaces', () => {
      expect(trackImageSources(makeTrack({ id: 'vir', layout: 'full course' }))).toEqual([
        'accontent://track/vir/preview/full%20course',
        'accontent://track/vir/outline/full%20course',
      ]);
    });

    it('offers nothing when the track folder cannot be served', () => {
      expect(trackImageSources(makeTrack({ id: 'a/b' }))).toEqual([]);
    });

    it('offers nothing when the layout folder cannot be served', () => {
      expect(trackImageSources(makeTrack({ id: 'vir', layout: '..' }))).toEqual([]);
    });
  });

  describe('isLocated', () => {
    it('is true when both coordinates are known', () => {
      expect(isLocated(makeTrack({ id: 'spa', geotags: { lat: 50.4, lon: 5.9 } }))).toBe(true);
    });

    it('is false when neither is known', () => {
      expect(isLocated(makeTrack({ id: 'spa' }))).toBe(false);
    });

    // CSP needs both to place the sun; one alone is not a position.
    it('is false when only one of the two is known', () => {
      expect(isLocated(makeTrack({ id: 'spa', geotags: { lat: 50.4, lon: null } }))).toBe(false);
      expect(isLocated(makeTrack({ id: 'spa', geotags: { lat: null, lon: 5.9 } }))).toBe(false);
    });

    // A track on the prime meridian or the equator is still located.
    it('treats zero as a real coordinate rather than a missing one', () => {
      expect(isLocated(makeTrack({ id: 'x', geotags: { lat: 0, lon: 0 } }))).toBe(true);
    });
  });
});
