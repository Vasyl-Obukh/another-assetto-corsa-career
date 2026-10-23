// What a car costs: the prices the user set on cars they added, and what the
// Edit price dialog is shown about one.

import type { SpecId } from './car-classes.ts';
import type { Car } from './content.ts';

/**
 * The prices the user set on cars they added to the library, by folder ID.
 *
 * Only ever read for a car the price list does not name, so a row for a car
 * the catalogue later gains is harmless rather than a conflict.
 */
export type UserPrices = Readonly<Record<string, number>>;

/**
 * Where a car's price comes from: the price list the app ships, a price the
 * user set, or the suggestion worked out for a car they added.
 */
export type PriceOrigin = 'catalogue' | 'yours' | 'suggested';

/**
 * What a suggested price rests on: the middle of the priced cars sharing a spec
 * with the car, or the curve over its power to weight and age.
 */
export type PriceBasis = 'spec' | 'curve';

/**
 * What the car browsers price cars over, beyond the class catalogue: the
 * prices the user set, and which cars they added, which is what tells a car on
 * a suggestion from one not in the library at all.
 */
export interface CarPricing {
  /**
   * The prices the user set on cars they added.
   */
  prices: UserPrices;
  /**
   * Folder IDs of the cars the user added to the library.
   */
  added: readonly string[];
}

/**
 * A car the user added, as the Edit price dialog shows it.
 */
export interface CarAppraisal {
  /**
   * The car.
   */
  car: Car;
  /**
   * What it costs now: the user's price, or the suggestion.
   */
  price: number;
  /**
   * What it would cost without a price of the user's.
   */
  suggested: number;
  /**
   * What the suggestion rests on.
   */
  basis: PriceBasis;
  /**
   * The spec the suggestion was taken from, when it rests on one.
   */
  spec: SpecId | null;
  /**
   * Priced cars to compare it against: those in its spec nearest the
   * suggestion, or those nearest it in power to weight.
   */
  kin: Car[];
}
