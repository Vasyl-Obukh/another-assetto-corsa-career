import type { StoreSwitches } from './types.ts';
import type { FieldShape } from '@/lib/stored-preference';

/**
 * The IDs a browser narrowed to the cars the career owns is asked for when it
 * owns none: an empty list would ask for the whole library, and no folder is
 * named the empty string.
 */
export const NO_CARS: readonly string[] = [''];

/**
 * What the Store's switches open on the first time: all off.
 */
export const NO_SWITCHES: StoreSwitches = { owned: false, affordable: false, onSale: false };

/**
 * What each of the Store's switches has to be to be read back.
 */
export const STORE_SWITCHES_SHAPE: FieldShape<StoreSwitches> = {
  owned: 'boolean',
  affordable: 'boolean',
  onSale: 'boolean',
};
