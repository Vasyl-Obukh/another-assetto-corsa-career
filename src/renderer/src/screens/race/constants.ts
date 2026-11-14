import type { ParseKeys } from 'i18next';

import type { RegulationSpec } from './types.ts';
import type {
  QuickRacePhase, RegulationFlag, TrackStateName,
} from '../../../../shared/types';

/**
 * How many laps a race added to an event starts with.
 */
export const DEFAULT_SESSION_LAPS = 5;

/**
 * How many minutes a practice added to an event starts with.
 */
export const DEFAULT_SESSION_MINUTES = 15;

/**
 * How much rubber is down at the start, in the order the menu offers it.
 */
export const TRACK_STATES: TrackStateName[] = ['green', 'fast', 'optimum'];

/**
 * The label for each track state.
 */
export const TRACK_STATE_LABEL: Record<TrackStateName, ParseKeys> = {
  green: 'race.trackState.green',
  fast: 'race.trackState.fast',
  optimum: 'race.trackState.optimum',
};

/**
 * The Select item value for "nothing chosen".
 *
 * An empty string cannot be a Select item value in Radix, and an id can be
 * anything, so the sentinel is a string no folder can hold - `/` is not legal
 * in a Windows path segment.
 */
export const NOT_SET = '/none';

/**
 * How many slots make a plan rather than a static weather.
 */
export const MIN_PLAN_SLOTS = 2;

/**
 * How long a slot runs for when one is added, in minutes.
 */
export const DEFAULT_SLOT_MINUTES = 10;

/**
 * The regulations that are measured, each as a slider from nothing up to its
 * most, with the points worth naming offered as chips. Real is Assetto Corsa's
 * own figure - one times the fuel, wear and slipstream.
 */
export const REGULATIONS: readonly RegulationSpec[] = [
  {
    key: 'fuelRate',
    id: 'race-fuel-rate',
    max: 5,
    step: 0.1,
    stops: [
      { value: 0, label: 'race.regulations.stop.off' },
      { value: 1, label: 'race.regulations.stop.real' },
      { value: 2 },
      { value: 3 },
    ],
  },
  {
    key: 'tyreWear',
    id: 'race-tyre-wear',
    max: 5,
    step: 0.1,
    stops: [
      { value: 0, label: 'race.regulations.stop.off' },
      { value: 1, label: 'race.regulations.stop.real' },
      { value: 2 },
      { value: 3 },
    ],
  },
  {
    key: 'slipstream',
    id: 'race-slipstream',
    max: 10,
    step: 0.1,
    stops: [
      { value: 0, label: 'race.regulations.stop.off' },
      { value: 1, label: 'race.regulations.stop.real' },
      { value: 3 },
      { value: 5 },
    ],
  },
];

/**
 * The regulations that are allowed or not, rather than measured.
 */
export const REGULATION_FLAGS: readonly { key: RegulationFlag; id: string }[] = [
  { key: 'tyreBlankets', id: 'race-tyre-blankets' },
];

/**
 * The colour a race event's phase pill wears over its photograph. One under
 * way is primary and one finished is success, which is what those two tokens
 * mean everywhere; one only set up stays on the photograph's own scrim on
 * purpose, since nothing about it has happened yet.
 */
export const PHASE_PILL = {
  setup: '',
  running: 'bg-primary text-primary-foreground',
  finished: 'bg-success text-success-foreground',
} as const satisfies Record<QuickRacePhase, string>;

/**
 * How many event cards the list's skeleton holds.
 */
export const EVENT_SKELETON = 5;

/**
 * How many session rows an event card's skeleton holds.
 */
export const SESSION_SKELETON = 2;

/**
 * How many classes the race page's skeleton lists.
 */
export const CLASS_SKELETON = 2;

/**
 * How many car tiles the open class shows while the page is read.
 */
export const CAR_TILE_SKELETON = 5;

/**
 * How many rows a started event's session list shows while it is read: the
 * results row and two sessions.
 */
export const EVENT_ROW_SKELETON = 3;

/**
 * The most cars one class of a race event may hold. As a championship's
 * class: past it a grid outgrows every track's pit lane anyway.
 */
export const MAX_CLASS_CARS = 60;

/**
 * Decimal places the track card states a lap length to. The third is
 * load-bearing: Spa is 7.004 km, and 7 loses the circuit.
 */
export const LAP_DIGITS = 3;
