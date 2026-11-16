import { NO_SWITCHES, STORE_SWITCHES_SHAPE } from './constants.ts';
import type { StoreSwitches } from './types.ts';
import { readFields } from '@/lib/stored-preference';

/**
 * Reads the switches the Store saved, each falling back to off.
 * @param stored Whatever the preference held
 * @returns The switches to open on
 */
export const readStoreSwitches = (stored: unknown): StoreSwitches => ({
  ...NO_SWITCHES,
  ...readFields(stored, STORE_SWITCHES_SHAPE),
});

/**
 * Where a career's Store keeps its switches. Each career keeps its own, since
 * they narrow by what that career owns and can pay for.
 * @param career The career, by its id
 * @returns The preference's key
 */
export const storeSwitchesKey = (career: string): string => `store.${career}.switches`;
