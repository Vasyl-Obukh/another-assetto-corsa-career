import type {
  Car, CarBacking, CarSale, CarSource, OwnedCar, SeasonEntry,
} from '../../../../shared/types';
import type { LiveDeal } from '../../../../shared/utils/car-sale';
import type { DisplayableError } from '@/lib/ipc';

/**
 * What a career's main sponsor can pay of one car.
 */
export interface CarBackingOffer {
  /**
   * The sponsor's name.
   */
  sponsor: string;
  /**
   * What it would pay.
   */
  amount: number;
  /**
   * The last day it can be used, as an ISO date.
   */
  until: string;
}

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
   * What a car costs to buy this week, after any sale.
   * @param car The car
   * @returns The price
   */
  priceOf(car: Car): number;
  /**
   * What a car is listed at, before any sale - which renting it is worked out
   * from.
   * @param car The car
   * @returns The price
   */
  listedOf(car: Car): number;
  /**
   * The week's deal on a car.
   * @param car The car
   * @returns The deal, or null when it is not on sale or is owned already
   */
  dealOf(car: Car): LiveDeal | null;
  /**
   * The sale running this week, or null with none.
   */
  sale: CarSale | null;
  /**
   * The cars on sale this week, the Deal of the week first, those the career
   * owns left out.
   */
  deals: readonly LiveDeal[];
  /**
   * What the career's main sponsor can pay of a car.
   * @param car The car
   * @returns What it can pay, or null when it cannot
   */
  backingOf(car: Car): CarBackingOffer | null;
  /**
   * What the career's main sponsor can still pay part of, the garage's own cars
   * left out - null with no backing left to use.
   */
  backing: Pick<CarBacking, 'share' | 'models'> | null;
  /**
   * The least the career could pay for a car, a sponsor's backing taken off.
   * @param car The car
   * @returns The amount
   */
  payableFor(car: Car): number;
  /**
   * What repainting a car costs now.
   * @param owned The car
   * @returns The cost, nothing where a sponsor pays for repaints
   */
  repaintCost(owned: OwnedCar): number;
  /**
   * The sponsor paying for repaints, null with none.
   */
  repaintSponsor: string | null;
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
   * @param backed Whether to spend a sponsor's backing on it
   * @returns Whether it was bought
   */
  buy(model: string, skin?: string, backed?: boolean): Promise<boolean>;
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
