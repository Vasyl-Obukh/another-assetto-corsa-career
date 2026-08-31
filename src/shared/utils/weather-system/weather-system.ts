// Which controller a weather system runs, and whether it can change the weather
// during a session at all.
//
// Shared because both sides need the same answer: main writes the controller
// into race.ini, and the renderer has to know whether to offer a second slot.

import { DYNAMIC_CONTROLLER, STATIC_CONTROLLER, STATIC_STEP_COUNT } from './constants.ts';
import type { PlannerKind, WeatherStep, WeatherSystem } from '../../types/weather-plan.ts';

/**
 * The planner app a system uses, if it has one.
 * @param system The chosen weather system
 * @returns The planner, or null for plain Custom Shaders Patch
 */
export const plannerFor = (system: WeatherSystem): PlannerKind | null => (
  system === 'none' ? null : system
);

/**
 * Whether a system can make the weather change during a session.
 *
 * Only by running a plan, and only PURE and Sol have an app that reads one.
 * @param system The chosen weather system
 * @returns True when weather can change mid-session
 */
export const supportsDynamic = (system: WeatherSystem): boolean => plannerFor(system) !== null;

/**
 * Whether a set of steps describes weather that changes.
 *
 * One step is a weather that simply holds, which is static weather by another
 * name and needs no plan installed for it.
 * @param steps The steps a session names, if any
 * @returns True when a plan has to be written
 */
export const isDynamic = (steps: WeatherStep[] | undefined): boolean => (
  (steps?.length ?? 0) > STATIC_STEP_COUNT
);

/**
 * The controller a race should name.
 * @param system The chosen weather system
 * @param dynamic Whether the session runs a plan
 * @returns The controller folder name, or null when the system cannot do it
 */
export const controllerFor = (system: WeatherSystem, dynamic: boolean): string | null => (
  dynamic ? DYNAMIC_CONTROLLER[system] : STATIC_CONTROLLER[system]
);
