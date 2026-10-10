import { describe, expect, it } from '@jest/globals';

import type { SessionForecast } from '../../../../../shared/types';
import { forecastDays } from '../utils.ts';

/**
 * Builds a session's forecast on one day of the event.
 * @param index Its position in the event format
 * @param day Which day it runs on
 * @returns A complete SessionForecast
 */
const session = (index: number, day: number): SessionForecast => ({
  index,
  day,
  type: 'practice',
  generated: true,
  steps: [],
  ambient: 20,
  windMin: 0,
  windMax: 10,
  conditions: {},
});

describe('renderer/components/weather-forecast/utils', () => {
  describe('forecastDays', () => {
    it('gathers the sessions under the day each runs on', () => {
      const friday = session(0, 0);
      const saturday = session(1, 1);
      const sunday = session(2, 1);

      expect(forecastDays([friday, saturday, sunday])).toEqual([
        { day: 0, sessions: [friday] },
        { day: 1, sessions: [saturday, sunday] },
      ]);
    });

    // A format lists its sessions in the order they were written, which need not
    // be the order their days run in.
    it('lists the days in order even when the sessions are not', () => {
      const days = forecastDays([session(0, 2), session(1, 0), session(2, 1)]);

      expect(days.map((group) => group.day)).toEqual([0, 1, 2]);
    });

    it('keeps the sessions of one day in the order they were given', () => {
      const late = session(0, 1);
      const other = session(1, 0);
      const early = session(2, 1);

      const [, second] = forecastDays([late, other, early]);

      expect(second.sessions.map((entry) => entry.index)).toEqual([0, 2]);
    });

    it('has no days for a forecast with no sessions', () => {
      expect(forecastDays([])).toEqual([]);
    });
  });
});
