import { describe, expect, it } from '@jest/globals';

import {
  makeGroup, makeGroupOf, makeGroupOfLengths, makeTrack,
} from './fixtures.ts';
import {
  coordinatesOf, isLocated, lapLength, layoutImageSources, layoutMapSources, layoutOutline, lengthText, spanOf,
  spanText, trackImageSources,
} from '../utils.ts';
import type { Units } from '@/hooks';

/**
 * A number formatter that writes the figure as it is, so a test reads what was
 * rounded rather than how a locale punctuates it.
 * @param value The figure
 * @returns The figure as plain text
 */
const plain = (value: number): string => String(value);

/**
 * Unit formatters measuring a distance in kilometres to a tenth.
 */
const kilometres: Pick<Units, 'figure'> = {
  figure: (quantity, metric) => plain(Math.round(metric * 10) / 10),
};

/**
 * Unit formatters measuring a distance in miles to a tenth.
 */
const miles: Pick<Units, 'figure'> = {
  figure: (quantity, metric) => plain(Math.round(metric * 0.621371 * 10) / 10),
};

describe('renderer/screens/track-browser/utils', () => {
  describe('layoutImageSources', () => {
    it('prefers the photo, with the map outline behind it', () => {
      expect(layoutImageSources({ id: 'spa', layout: 'gp' })).toEqual([
        'accontent://track/spa/preview/gp',
        'accontent://track/spa/outline/gp',
      ]);
    });

    // A round names its layout by folder alone, and must be illustrated without
    // a scanned Track behind it.
    it('reads nothing but the folder and the layout', () => {
      expect(layoutImageSources({ id: 'ks_monza', layout: '' })).toEqual([
        'accontent://track/ks_monza/preview',
        'accontent://track/ks_monza/outline',
      ]);
    });

    it('offers nothing when either folder cannot be served', () => {
      expect(layoutImageSources({ id: 'a/b', layout: '' })).toEqual([]);
      expect(layoutImageSources({ id: 'vir', layout: '..' })).toEqual([]);
    });
  });

  describe('layoutMapSources', () => {
    it('puts the outline ahead of the photo', () => {
      expect(layoutMapSources({ id: 'spa', layout: 'gp' })).toEqual([
        'accontent://track/spa/outline/gp',
        'accontent://track/spa/preview/gp',
      ]);
    });

    it('offers nothing when the layout cannot be served', () => {
      expect(layoutMapSources({ id: 'vir', layout: 'a:b' })).toEqual([]);
    });
  });

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

    it('offers nothing for a track with no layouts', () => {
      expect(trackImageSources({ ...makeGroup({ id: 'spa' }), layouts: [] })).toEqual([]);
    });
  });

  describe('coordinatesOf', () => {
    it('reads the coordinates of a located layout', () => {
      expect(coordinatesOf([makeTrack({ id: 'spa', geotags: { lat: 50.4, lon: 5.9 } })]))
        .toEqual({ lat: 50.4, lon: 5.9 });
    });

    it('takes the first layout that knows both, past those that know one or none', () => {
      const layouts = [
        makeTrack({ id: 'x', geotags: { lat: 1, lon: null } }),
        makeTrack({ id: 'x', geotags: { lat: null, lon: null } }),
        makeTrack({ id: 'x', geotags: { lat: 2, lon: 3 } }),
        makeTrack({ id: 'x', geotags: { lat: 4, lon: 5 } }),
      ];

      expect(coordinatesOf(layouts)).toEqual({ lat: 2, lon: 3 });
    });

    it('treats zero as a real coordinate', () => {
      expect(coordinatesOf([makeTrack({ id: 'x', geotags: { lat: 0, lon: 0 } })])).toEqual({ lat: 0, lon: 0 });
    });

    it('is null when no layout is located', () => {
      expect(coordinatesOf([makeTrack({ id: 'x' })])).toBeNull();
      expect(coordinatesOf([])).toBeNull();
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

  describe('spanOf', () => {
    const pitboxes = (layout: { pitboxes: number | null }): number | null => layout.pitboxes;
    const lengths = (layout: { lengthM: number | null }): number | null => layout.lengthM;

    it('is a single figure when every layout agrees', () => {
      expect(spanOf(makeGroup({ id: 'spa', pitboxes: 24 }).layouts, pitboxes)).toEqual({ from: 24, to: 24 });
    });

    // Kunos' Red Bull Ring holds 24, the LFM layout beside it holds 48, and the
    // card has to span them rather than pick one.
    it('spans the layouts when they disagree', () => {
      expect(spanOf(makeGroupOf('ks_red_bull_ring', [24, 48, 24]).layouts, pitboxes)).toEqual({ from: 24, to: 48 });
    });

    // The Nordschleife ships a 3.8 km sprint beside a 25.4 km endurance layout,
    // and picking either to stand for the circuit would be a lie.
    it('spans lengths in any order the layouts come in', () => {
      expect(spanOf(makeGroupOfLengths('ks_nordschleife', [20832, 25378, 3800]).layouts, lengths))
        .toEqual({ from: 3800, to: 25378 });
    });

    it('ignores the layouts that state nothing', () => {
      expect(spanOf(makeGroupOf('x', [null, 30, null]).layouts, pitboxes)).toEqual({ from: 30, to: 30 });
    });

    it('is null when no layout states the figure', () => {
      expect(spanOf(makeGroupOf('x', [null, null]).layouts, pitboxes)).toBeNull();
      expect(spanOf([], pitboxes)).toBeNull();
    });

    // Zero is a figure, unlike null, so a stated zero is kept.
    it('keeps a stated zero', () => {
      expect(spanOf(makeGroupOf('x', [0, 12]).layouts, pitboxes)).toEqual({ from: 0, to: 12 });
    });
  });

  describe('layoutOutline', () => {
    it('serves the outline of a layout', () => {
      expect(layoutOutline({ id: 'spa', layout: 'gp' })).toBe('accontent://track/spa/outline/gp');
    });

    it('leaves the layout segment off a single-layout track', () => {
      expect(layoutOutline({ id: 'ks_monza', layout: '' })).toBe('accontent://track/ks_monza/outline');
    });

    it('is null when either folder cannot be served', () => {
      expect(layoutOutline({ id: 'a/b', layout: '' })).toBeNull();
      expect(layoutOutline({ id: 'vir', layout: '..' })).toBeNull();
    });
  });

  describe('spanText', () => {
    it('writes a span as its two ends', () => {
      expect(spanText({ from: 24, to: 48 }, plain)).toBe('24-48');
    });

    it('writes a span whose ends agree as one figure', () => {
      expect(spanText({ from: 24, to: 24 }, plain)).toBe('24');
    });

    // 5.79 km and 5.81 km both read 5.8, and "5.8-5.8" says nothing.
    it('writes one figure when the ends only agree once written out', () => {
      expect(spanText({ from: 5790, to: 5810 }, (metres) => lapLength(metres, kilometres))).toBe('5.8');
    });

    it('is null when there is no span', () => {
      expect(spanText(null, plain)).toBeNull();
    });
  });

  describe('lapLength', () => {
    it('measures metres as a distance in kilometres, to one decimal place', () => {
      expect(lapLength(5793, kilometres)).toBe('5.8');
      expect(lapLength(7004, kilometres)).toBe('7');
    });

    it('writes the figure in the units it is handed', () => {
      expect(lapLength(7004, miles)).toBe('4.4');
    });
  });

  describe('lengthText', () => {
    it('writes a single length in kilometres', () => {
      expect(lengthText(makeGroupOfLengths('spa', [7004]).layouts, kilometres)).toBe('7');
    });

    it('spans the shortest and the longest layout', () => {
      expect(lengthText(makeGroupOfLengths('ks_nordschleife', [20832, 25378, 3800]).layouts, kilometres)).toBe('3.8-25.4');
    });

    it('is null when no layout states a length', () => {
      expect(lengthText(makeGroupOfLengths('x', [null]).layouts, kilometres)).toBeNull();
    });
  });
});
