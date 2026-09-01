// The driving aids and regulations AC itself ships, which is what an omitted
// field means. Shared rather than kept in src/core/launch/, because the renderer
// shows them as placeholders and may not import core.

import type { Assists } from '../types/race.ts';
import type { DrivingAidFlag, DrivingAidNumber } from '../types/settings.ts';

/**
 * Every assist at the value AC uses when nothing has been chosen.
 *
 * `Required` on purpose: this is the one place a default is written down, so a
 * field added to `Assists` and forgotten here fails the typecheck rather than
 * reaching Content Manager as undefined.
 */
export const DEFAULT_ASSISTS: Required<Assists> = {
  idealLine: false,
  autoBlip: false,
  stabilityControl: 0,
  autoBrake: false,
  autoShifter: false,
  abs: 1,
  tractionControl: 1,
  autoClutch: false,
  visualDamage: true,
  damage: 100,
  fuelRate: 1,
  tyreWear: 1,
  tyreBlankets: true,
  slipstream: 1,
};

/**
 * The driving aids that are on or off, in the order the settings screen shows
 * the switches.
 *
 * Written down once because three things need the same list and none of them
 * would notice its absence: the settings migration reads these as booleans, the
 * screen renders a switch per entry, and `DrivingAidFlag` says which keys are
 * allowed here.
 */
export const DRIVING_AID_FLAGS: readonly DrivingAidFlag[] = [
  'idealLine',
  'autoBlip',
  'autoBrake',
  'autoShifter',
  'autoClutch',
  'tyreBlankets',
  'visualDamage',
];

/**
 * The driving aids that carry a number.
 */
export const DRIVING_AID_NUMBERS: readonly DrivingAidNumber[] = [
  'abs',
  'tractionControl',
  'stabilityControl',
];
