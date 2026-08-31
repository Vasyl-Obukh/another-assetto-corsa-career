import { describe, expect, it } from '@jest/globals';

import { WeatherType } from '../../../constants/index.ts';
import {
  controllerFor, isDynamic, plannerFor, supportsDynamic,
} from '../weather-system.ts';

describe('shared/utils/weather-system', () => {
  describe('plannerFor', () => {
    it('names the planner app a system reads its plans from', () => {
      expect(plannerFor('pure')).toBe('pure');
      expect(plannerFor('sol')).toBe('sol');
    });

    it('has none for plain Custom Shaders Patch', () => {
      expect(plannerFor('none')).toBeNull();
    });
  });

  describe('supportsDynamic', () => {
    // Weather changes during a session only by a planner app running a plan, so
    // an install with neither mod cannot have it at all - which is what makes
    // the Add slot button disappear rather than fail.
    it('is true only for a system with a planner behind it', () => {
      expect(supportsDynamic('pure')).toBe(true);
      expect(supportsDynamic('sol')).toBe(true);
      expect(supportsDynamic('none')).toBe(false);
    });
  });

  describe('isDynamic', () => {
    it('treats one step as static weather, since nothing changes', () => {
      expect(isDynamic([{ weather: WeatherType.CLEAR }])).toBe(false);
    });

    it('treats two or more as a plan', () => {
      expect(isDynamic([
        { weather: WeatherType.CLEAR, minutes: 5 },
        { weather: WeatherType.RAIN },
      ])).toBe(true);
    });

    it('treats no steps at all as static', () => {
      expect(isDynamic(undefined)).toBe(false);
      expect(isDynamic([])).toBe(false);
    });
  });

  describe('controllerFor', () => {
    it('names the static controller when the weather simply holds', () => {
      expect(controllerFor('pure', false)).toBe('pureCtrl static');
      expect(controllerFor('sol', false)).toBe('sol2static');
      expect(controllerFor('none', false)).toBe('base');
    });

    it('names the dynamic one when a plan is running', () => {
      expect(controllerFor('pure', true)).toBe('pureCtrl');
      expect(controllerFor('sol', true)).toBe('sol2');
    });

    it('has no dynamic controller without a weather mod', () => {
      expect(controllerFor('none', true)).toBeNull();
    });
  });
});
