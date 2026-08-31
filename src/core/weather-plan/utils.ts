// Turning a step's length into the seconds both plan formats want.

import { HOLD_SECONDS } from './constants.ts';
import { SECONDS_PER_MINUTE } from '../../shared/constants/index.ts';
import type { WeatherPlan, WeatherStep } from '../../shared/types/index.ts';

/**
 * How long a step runs, in seconds.
 *
 * A step with no length holds until the session ends, which is the only way a
 * plan can be written for a race measured in laps: nobody knows how many minutes
 * twelve laps takes. Neither planner has a way to say "until the end", so it is
 * expressed as a duration no session will outlast - which is what PURE's own
 * files already do, their default plan being a single step of 86400.
 * @param step The step to measure
 * @returns Its length in seconds
 */
export const stepSeconds = (step: WeatherStep): number => (
  step.minutes === undefined ? HOLD_SECONDS : Math.round(step.minutes * SECONDS_PER_MINUTE)
);

/**
 * Whether a plan is expressible: only its last step may be open-ended.
 *
 * An open-ended step in the middle would swallow everything after it, silently
 * turning a three-step plan into a one-step one.
 * @param plan The plan to check
 * @returns True when every step but the last names a length
 */
export const openEndedIsLast = (plan: WeatherPlan): boolean => (
  plan.steps.slice(0, -1).every((step) => step.minutes !== undefined)
);
