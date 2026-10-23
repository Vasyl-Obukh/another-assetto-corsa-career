import type {
  Car, CarSource, OwnedCar, SeasonEntry,
} from '../../../../shared/types';
import type { DisplayableError } from '@/lib/ipc';

/**
 * A career's garage and what it costs: the cars it owns, what any car costs to
 * buy, rent, repaint or sell, and the commands that spend and raise money on
 * them. Null outside a career, which has no money.
 */
export interface Garage {
  /**
   * The money the career holds.
   */
  balance: number;
  /**
   * The day the career's clock stands at, as an ISO date.
   */
  today: string;
  /**
   * The cars it owns, in the order they were bought.
   */
  cars: readonly OwnedCar[];
  /**
   * A car the career owns.
   * @param model The car's folder ID
   * @returns The car as the garage holds it, or null when it is not owned
   */
  owned(model: string): OwnedCar | null;
  /**
   * What a car costs to buy.
   * @param car The car
   * @returns The price
   */
  priceOf(car: Car): number;
  /**
   * What a car sells for today.
   * @param owned The car as the garage holds it
   * @returns What selling it pays
   */
  valueOf(owned: OwnedCar): number;
  /**
   * The entries of the current season still to race a car.
   * @param model The car's folder ID
   * @param source Only entries racing it owned, or rented, when given
   * @returns The entries
   */
  racingIn(model: string, source?: CarSource): readonly SeasonEntry[];
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Why the last command was refused, or null.
   */
  error: DisplayableError | null;
  /**
   * Clears the error.
   */
  dismissError(): void;
  /**
   * Buys a car, in a livery.
   * @param model The car's folder ID
   * @param skin The livery, by skin folder ID
   * @returns Whether it was bought
   */
  buy(model: string, skin?: string): Promise<boolean>;
  /**
   * Sells a car the career owns.
   * @param model The car's folder ID
   * @returns Whether it was sold
   */
  sell(model: string): Promise<boolean>;
  /**
   * Repaints a car the career owns.
   * @param model The car's folder ID
   * @param skin The new livery, by skin folder ID
   * @returns Whether it was repainted
   */
  repaint(model: string, skin: string): Promise<boolean>;
}
