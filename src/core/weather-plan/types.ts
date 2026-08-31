// Core-only shapes for installing a weather plan. The plan itself lives in
// src/shared/types/weather-plan.ts, because the renderer edits one and a race
// definition stores one, and the renderer may not import core.

import type { PlannerKind } from '../../shared/types/index.ts';

/**
 * What was overwritten in the user's own settings when a plan was installed, so
 * removing the plan can put it back.
 *
 * Written beside our own files rather than into theirs. Pointing PURE at a named
 * plan means turning its "load last used" setting off, and claiming a Sol preset
 * slot means whatever was in it is ours to give back - both are changes to files
 * we are a guest in, and would otherwise be permanent.
 */
export interface PlanBackup {
  /**
   * Which planner the backup is for.
   */
  planner: PlannerKind;
  /**
   * The settings keys as they were, keyed by section then key.
   */
  settings: Record<string, Record<string, string>>;
}
