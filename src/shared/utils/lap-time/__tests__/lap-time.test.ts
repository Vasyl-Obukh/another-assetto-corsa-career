import { describe, expect, it } from '@jest/globals';

import { formatLapTime } from '../lap-time.ts';

describe('shared/utils/lap-time', () => {
  describe('formatLapTime', () => {
    it('renders minutes, seconds and milliseconds', () => {
      expect(formatLapTime(83456)).toBe('1:23.456');
    });

    it('pads seconds and milliseconds', () => {
      expect(formatLapTime(61007)).toBe('1:01.007');
    });

    it('shows a placeholder when no lap was set', () => {
      expect(formatLapTime(null)).toBe('--:--.---');
      expect(formatLapTime(0)).toBe('--:--.---');
      expect(formatLapTime(-1)).toBe('--:--.---');
    });
  });
});
