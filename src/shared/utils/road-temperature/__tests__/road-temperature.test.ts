import { describe, expect, it } from '@jest/globals';

import {
  clockOf, followedRoad, parseClock, roadTempCurve,
} from '../road-temperature.ts';

describe('shared/utils/road-temperature', () => {
  describe('parseClock', () => {
    it('reads HH:MM into decimal hours', () => {
      expect(parseClock('15:30')).toBe(15.5);
      expect(parseClock('00:00')).toBe(0);
      expect(parseClock('9:15')).toBe(9.25);
    });

    it('passes a number through untouched', () => {
      expect(parseClock(13.75)).toBe(13.75);
    });

    it('throws on anything that is not HH:MM', () => {
      expect(() => parseClock('half past two')).toThrow('Invalid time of day');
      expect(() => parseClock('9:5')).toThrow('Invalid time of day');
    });

    // A cleared time input reads as '', which survives ?? and arrives here.
    // The setup screen has to send undefined instead, and this is why.
    it('rejects an empty string rather than reading it as midnight', () => {
      expect(() => parseClock('')).toThrow('Invalid time of day');
    });
  });

  describe('clockOf', () => {
    it('writes minutes after midnight as a padded clock', () => {
      expect(clockOf(870)).toBe('14:30');
      expect(clockOf(5)).toBe('00:05');
    });

    it('wraps midnight round to the start of the day', () => {
      expect(clockOf(24 * 60)).toBe('00:00');
    });
  });

  describe('roadTempCurve', () => {
    // Kunos' curve, checked against CSP's restatement of it hour by hour. These
    // are the figures that decide what reaches [TEMPERATURE] ROAD, so they are
    // pinned rather than merely bounded.
    it('follows Kunos through the middle of the day', () => {
      expect(roadTempCurve(12, 20, 1)).toBeCloseTo(28.2149, 4);
      expect(roadTempCurve(14, 20, 1)).toBeCloseTo(28.2541, 4);
      expect(roadTempCurve(18, 20, 1)).toBeCloseTo(26.3559, 4);
    });

    // Raw Kunos returns 214C here, because their launcher only ever exposed an
    // 08:00 to 18:00 slider. Our clock offers the whole day, so the phase is
    // capped and the curve stays bounded.
    it('leaves the road at ambient before dawn and at midnight', () => {
      expect(roadTempCurve(0, 20, 1)).toBe(20);
      expect(roadTempCurve(6, 20, 1)).toBe(20);
      expect(roadTempCurve(7, 20, 1)).toBe(20);
      expect(roadTempCurve(24, 20, 1)).toBe(20);
    });

    it('cools the road under a negative coefficient', () => {
      expect(roadTempCurve(14, 20, -1)).toBeCloseTo(11.7459, 4);
    });

    it('leaves the road at ambient when the coefficient is zero', () => {
      expect(roadTempCurve(14, 20, 0)).toBe(20);
    });

    // Recorded rather than fixed: winding the phase back down walks back over
    // the curve's own afternoon peak, so the evening is not monotone. It is
    // CSP's behaviour, and it is bounded.
    it('reads warmer at 20:00 than at 18:00, which is CSP\'s fade, not a bug', () => {
      expect(roadTempCurve(20, 20, 1)).toBeGreaterThan(roadTempCurve(18, 20, 1));
      expect(roadTempCurve(20, 20, 1)).toBeLessThan(roadTempCurve(14, 20, 1));
    });

    it('scales with ambient, since the whole curve is a multiple of it', () => {
      expect(roadTempCurve(14, 0, 1)).toBe(0);
      expect(roadTempCurve(14, 30, 1)).toBeCloseTo(roadTempCurve(14, 10, 1) * 3, 10);
    });
  });

  describe('followedRoad', () => {
    it('is the curve at that time, rounded as race.ini writes it', () => {
      expect(followedRoad('14:00', 20, 1)).toBe(Math.round(roadTempCurve(14, 20, 1)));
      expect(followedRoad(14, 20, 1)).toBe(followedRoad('14:00', 20, 1));
    });

    // Kunos' `if (!COEFF) COEFF = 1`: neither a preset declaring zero nor no
    // preset at all leaves the road at ambient.
    it('warms the road as the default coefficient does when none is given, or zero', () => {
      const warmed = followedRoad('14:00', 20, 1);

      expect(warmed).toBeGreaterThan(20);
      expect(followedRoad('14:00', 20)).toBe(warmed);
      expect(followedRoad('14:00', 20, null)).toBe(warmed);
      expect(followedRoad('14:00', 20, 0)).toBe(warmed);
    });

    it('follows a coefficient the weather does declare', () => {
      expect(followedRoad('14:00', 20, -1)).toBe(12);
    });
  });
});
