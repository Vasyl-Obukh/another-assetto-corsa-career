// The controller each weather system runs, by folder name under
// extension/weather-controllers.

import type { WeatherSystem } from '../../types/weather-plan.ts';

/**
 * The controller that renders the weather a race asks for.
 *
 * These follow the selected weather - `FOLLOWS_SELECTED_WEATHER` is absent or 1
 * in their manifests - so the race decides and the controller draws it.
 * `base` is CSP's own, which every install has.
 */
export const STATIC_CONTROLLER: Record<WeatherSystem, string> = {
  none: 'base',
  pure: 'pureCtrl static',
  sol: 'sol2static',
};

/**
 * The controller that runs a plan from its own planner app.
 *
 * These declare `FOLLOWS_SELECTED_WEATHER = 0` and ignore what the race says
 * about weather entirely. `none` has none, because plain CSP ships no planner.
 */
export const DYNAMIC_CONTROLLER: Record<WeatherSystem, string | null> = {
  none: null,
  pure: 'pureCtrl',
  sol: 'sol2',
};

/**
 * How few steps still count as static weather.
 *
 * One step is a weather that never changes, which needs no planner and no plan -
 * so a plan is only installed from the second step onwards.
 */
export const STATIC_STEP_COUNT = 1;
