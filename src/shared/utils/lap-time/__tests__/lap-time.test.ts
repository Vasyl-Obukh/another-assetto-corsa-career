import { describe, expect, it } from '@jest/globals';

import { formatGap, formatLapTime } from '../lap-time.ts';

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

  describe('formatGap', () => {
    it('drops the minutes while there are none', () => {
      expect(formatGap(1234)).toBe('01.234');
      expect(formatGap(45007)).toBe('45.007');
    });

    it('keeps them from a minute up', () => {
      expect(formatGap(61007)).toBe('1:01.007');
    });

    it('shows the lap placeholder for a gap of nothing', () => {
      expect(formatGap(0)).toBe('--:--.---');
    });
  });
});
