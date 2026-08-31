import { describe, expect, it } from '@jest/globals';

import { WeatherType } from '../../../shared/constants/index.ts';
import { HOLD_SECONDS } from '../constants.ts';
import { openEndedIsLast, stepSeconds } from '../utils.ts';

describe('core/weather-plan/utils', () => {
  describe('stepSeconds', () => {
    it('turns minutes into the seconds both formats want', () => {
      expect(stepSeconds({ weather: WeatherType.CLEAR, minutes: 3 })).toBe(180);
    });

    it('rounds a fractional length rather than passing it through', () => {
      expect(stepSeconds({ weather: WeatherType.CLEAR, minutes: 2.51 })).toBe(151);
    });

    // Neither planner can say "until the session ends", so a step with no length
    // is written as a duration no session will outlast. That is what makes a
    // plan expressible for a race measured in laps.
    it('holds for a full day when the step names no length', () => {
      expect(stepSeconds({ weather: WeatherType.RAIN })).toBe(HOLD_SECONDS);
    });
  });

  describe('openEndedIsLast', () => {
    it('accepts a plan whose last step runs to the end', () => {
      expect(openEndedIsLast({
        steps: [
          { weather: WeatherType.CLEAR, minutes: 5 },
          { weather: WeatherType.RAIN },
        ],
      })).toBe(true);
    });

    it('accepts a plan where every step names a length', () => {
      expect(openEndedIsLast({
        steps: [
          { weather: WeatherType.CLEAR, minutes: 5 },
          { weather: WeatherType.RAIN, minutes: 5 },
        ],
      })).toBe(true);
    });

    // An open-ended step in the middle swallows everything after it, turning a
    // three-step plan into a one-step one without saying so.
    it('rejects one that runs to the end before the end', () => {
      expect(openEndedIsLast({
        steps: [
          { weather: WeatherType.CLEAR },
          { weather: WeatherType.RAIN, minutes: 5 },
        ],
      })).toBe(false);
    });

    it('accepts a single open-ended step, which is just static weather', () => {
      expect(openEndedIsLast({ steps: [{ weather: WeatherType.CLEAR }] })).toBe(true);
    });
  });
});
