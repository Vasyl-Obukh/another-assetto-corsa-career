import { describe, expect, it } from '@jest/globals';

import { makeGroup, makeGroupOf } from './fixtures.ts';
import { isLocated, pitboxRange, trackImageSources } from '../utils.ts';

describe('renderer/screens/track-browser/utils', () => {
  describe('trackImageSources', () => {
    it('prefers the photo, with the map outline behind it', () => {
      expect(trackImageSources(makeGroup({ id: 'ks_monza' }))).toEqual([
        'accontent://track/ks_monza/preview',
        'accontent://track/ks_monza/outline',
      ]);
    });

    // A single-layout track has an empty layout, which must not become a
    // trailing empty segment the parser would reject.
    it('leaves the layout segment off a single-layout track', () => {
      const [preview] = trackImageSources(makeGroup({ id: 'ks_monza', layout: '' }));

      expect(preview).toBe('accontent://track/ks_monza/preview');
    });

    it('appends the layout when there is one', () => {
      expect(trackImageSources(makeGroup({ id: 'spa', layout: 'gp' }))).toEqual([
        'accontent://track/spa/preview/gp',
        'accontent://track/spa/outline/gp',
      ]);
    });

    // VIR ships layouts named "full course". Spaces are legal in a segment and
    // must not cost the layout its preview.
    it('serves a layout whose folder name contains spaces', () => {
      expect(trackImageSources(makeGroup({ id: 'vir', layout: 'full course' }))).toEqual([
        'accontent://track/vir/preview/full%20course',
        'accontent://track/vir/outline/full%20course',
      ]);
    });

    it('offers nothing when the track folder cannot be served', () => {
      expect(trackImageSources(makeGroup({ id: 'a/b' }))).toEqual([]);
    });

    it('offers nothing when the layout folder cannot be served', () => {
      expect(trackImageSources(makeGroup({ id: 'vir', layout: '..' }))).toEqual([]);
    });
  });

  describe('isLocated', () => {
    it('is true when both coordinates are known', () => {
      expect(isLocated(makeGroup({ id: 'spa', geotags: { lat: 50.4, lon: 5.9 } }))).toBe(true);
    });

    it('is false when neither is known', () => {
      expect(isLocated(makeGroup({ id: 'spa' }))).toBe(false);
    });

    // CSP needs both to place the sun; one alone is not a position.
    it('is false when only one of the two is known', () => {
      expect(isLocated(makeGroup({ id: 'spa', geotags: { lat: 50.4, lon: null } }))).toBe(false);
      expect(isLocated(makeGroup({ id: 'spa', geotags: { lat: null, lon: 5.9 } }))).toBe(false);
    });

    // A track on the prime meridian or the equator is still located.
    it('treats zero as a real coordinate rather than a missing one', () => {
      expect(isLocated(makeGroup({ id: 'x', geotags: { lat: 0, lon: 0 } }))).toBe(true);
    });

    // Layouts of one circuit are the same place, and mod authors fill the
    // geotags in per layout, so one of them knowing is enough.
    it('is true when any one layout knows where the circuit is', () => {
      const group = makeGroupOf('x', [null, null], [
        { lat: null, lon: null },
        { lat: 50.4, lon: 5.9 },
      ]);

      expect(isLocated(group)).toBe(true);
    });
  });

  describe('pitboxRange', () => {
    it('is a single figure when every layout agrees', () => {
      expect(pitboxRange(makeGroup({ id: 'spa', pitboxes: 24 }))).toEqual({ from: 24, to: 24 });
    });

    // Kunos' Red Bull Ring holds 24, the LFM layout beside it holds 48, and the
    // card has to span them rather than pick one.
    it('spans the layouts when they disagree', () => {
      const group = makeGroupOf('ks_red_bull_ring', [24, 48, 24]);

      expect(pitboxRange(group)).toEqual({ from: 24, to: 48 });
    });

    it('ignores the layouts that state nothing', () => {
      expect(pitboxRange(makeGroupOf('x', [null, 30, null]))).toEqual({ from: 30, to: 30 });
    });

    it('is null when no layout states a grid size', () => {
      expect(pitboxRange(makeGroupOf('x', [null, null]))).toBeNull();
    });
  });

});
