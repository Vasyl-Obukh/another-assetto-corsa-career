import type { Car, PriceOrigin } from '../../../../shared/types';

/**
 * What Your content does with prices: every car the user has switched on shows
 * what it costs, where that comes from, and a way to change it.
 */
export interface CarAppraise {
  /**
   * What a car costs.
   * @param car The car
   * @returns The user's price, or the suggestion
   */
  priceOf(car: Car): number;
  /**
   * Where a car's price comes from.
   * @param car The car
   * @returns The user's, or the suggestion
   */
  originOf(car: Car): PriceOrigin;
  /**
   * Opens Edit price for a car.
   * @param car The car
   */
  onEdit(car: Car): void;
}
