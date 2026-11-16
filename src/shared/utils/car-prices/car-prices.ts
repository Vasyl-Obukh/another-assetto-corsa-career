// What a car costs a career: to buy, to rent a round, to repaint, and what it
// sells for. Shared because main charges these and the renderer shows them.
// Looked up at runtime and never baked into the content cache, since a mod's
// price follows the specs the user gives it and the price they set on it.

import {
  AGE_SHARES,
  ASSUMED_WEIGHT_KG,
  CAR_PRICES,
  DEPRECIATION_PER_YEAR,
  KIN_COUNT,
  MAX_CAR_PRICE,
  MIN_CAR_PRICE,
  POWER_EXPONENT,
  PRICE_FLOOR,
  PRICE_STEPS,
  REFERENCE_POWER,
  REFERENCE_PRICE,
  RENT_CAP_FEES,
  RENT_SHARE,
  REPAINT_SHARE,
  RESALE_FLOOR,
  RESALE_STEP,
  ROAD_CAR_CLASSES,
} from './constants.ts';
import { DAYS_PER_YEAR } from '../../constants/index.ts';
import type {
  Car, CarAppraisal, ClassCatalogue, PriceOrigin, UserPrices,
} from '../../types/index.ts';
import { daysBetween } from '../calendar-days/index.ts';
import { carSpecsOf, specCars } from '../car-classes/index.ts';
import { rungFee } from '../career-eligibility/index.ts';

/**
 * No prices of the user's.
 */
const NO_PRICES: UserPrices = {};

/**
 * A derived price rounded to the step of its band.
 * @param price The price as worked out
 * @returns The price, rounded, and never under the floor
 */
const rounded = (price: number): number => {
  const { step } = PRICE_STEPS.find((band) => price < band.under) ?? PRICE_STEPS[PRICE_STEPS.length - 1];

  return Math.max(PRICE_FLOOR, Math.round(price / step) * step);
};

/**
 * The median of a list of prices.
 * @param prices The prices, at least one
 * @returns The middle one, or the mean of the two middle ones
 */
const median = (prices: readonly number[]): number => {
  const sorted = [...prices].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * A car's power to weight as the price curve reads it.
 * @param car The car
 * @returns Its bhp a tonne, a car stating no weight taken at the assumed one,
 * or null for a car stating no power
 */
const perTonne = (car: Pick<Car, 'performance'>): number | null => {
  const { bhp, weightKg } = car.performance;
  if (bhp === null || bhp <= 0) return null;

  return bhp / ((weightKg ?? ASSUMED_WEIGHT_KG) / 1000);
};

/**
 * The cars on the price list that share a spec with a car.
 * @param id The car's folder ID
 * @param catalogue The class catalogue its specs resolve against
 * @returns Their folder IDs, each once
 */
const specKin = (id: string, catalogue: ClassCatalogue): string[] => [...new Set(
  carSpecsOf(id, catalogue)
    .flatMap((spec) => specCars(spec, catalogue))
    .filter((other) => other !== id && CAR_PRICES[other] !== undefined),
)];

/**
 * Whether a car is a road car or a racing car, as its own ui_car.json says:
 * its class, or else its tags.
 * @param car The car
 * @returns 'road' or 'race', or null for a car that says neither
 */
const kindOf = (car: Pick<Car, 'carClass' | 'tags'>): 'road' | 'race' | null => {
  if (car.carClass !== null) return ROAD_CAR_CLASSES.includes(car.carClass.toLowerCase()) ? 'road' : 'race';

  const tags = car.tags.map((tag) => tag.toLowerCase());
  if (tags.some((tag) => ROAD_CAR_CLASSES.includes(tag))) return 'road';

  return tags.includes('race') ? 'race' : null;
};

/**
 * How far apart two figures are, as a ratio, so a $5M car is as far above a
 * $2.5M one as a $100k car is above a $50k one.
 * @param left One figure
 * @param right The other
 * @returns The distance, zero for equal figures
 */
const apart = (left: number, right: number): number => Math.abs(Math.log(left / right));

/**
 * What a car off the price list is suggested to cost: the median of the listed
 * cars that share a spec with it, or else a price worked out from its power to
 * weight and its age.
 * @param car The car
 * @param catalogue The class catalogue its specs resolve against
 * @returns The price
 */
export const derivedPrice = (car: Pick<Car, 'id' | 'year' | 'performance'>, catalogue: ClassCatalogue): number => {
  const kin = specKin(car.id, catalogue);
  if (kin.length > 0) return rounded(median(kin.map((id) => CAR_PRICES[id])));

  const power = perTonne(car);
  if (power === null) return PRICE_FLOOR;
  const age = [...AGE_SHARES].reverse().find((band) => (car.year ?? 0) >= band.from)?.share ?? 1;

  return rounded(REFERENCE_PRICE * (power / REFERENCE_POWER) ** POWER_EXPONENT * age);
};

/**
 * What a car costs to buy: its listed price, which nothing changes, or else
 * the price the user set on it, or else the suggestion.
 * @param car The car
 * @param catalogue The class catalogue its specs resolve against
 * @param prices The prices the user set on cars they added
 * @returns The price, in whole units
 */
export const carPrice = (
  car: Pick<Car, 'id' | 'year' | 'performance'>,
  catalogue: ClassCatalogue,
  prices: UserPrices = NO_PRICES,
): number => CAR_PRICES[car.id] ?? prices[car.id] ?? derivedPrice(car, catalogue);

/**
 * Where a car's price comes from.
 * @param id The car's folder ID
 * @param prices The prices the user set on cars they added
 * @returns The price list's, the user's, or the suggestion
 */
export const priceOrigin = (id: string, prices: UserPrices): PriceOrigin => {
  if (CAR_PRICES[id] !== undefined) return 'catalogue';

  return prices[id] === undefined ? 'suggested' : 'yours';
};

/**
 * Whether a value is a price the user may set: a whole number within bounds.
 * @param value Anything
 * @returns True when it is
 */
export const isCarPrice = (value: unknown): value is number => (
  typeof value === 'number' && Number.isInteger(value) && value >= MIN_CAR_PRICE && value <= MAX_CAR_PRICE
);

/**
 * The user's prices with one car's set or taken back. A price equal to the
 * suggestion is no price of theirs, so it drops the row rather than storing it.
 * @param prices The prices as they stand
 * @param id The car's folder ID
 * @param price Its new price, or null to take the user's back
 * @param suggested What it is suggested to cost
 * @returns The prices
 */
export const withCarPrice = (
  prices: UserPrices,
  id: string,
  price: number | null,
  suggested: number,
): UserPrices => {
  const { [id]: dropped, ...others } = prices;

  return price === null || price === suggested ? others : { ...others, [id]: price };
};

/**
 * A car the user added as the Edit price dialog shows it: its price, the
 * suggestion and what that rests on, and the listed cars to compare it with -
 * those in its spec nearest the suggestion, or those of its kind, road or
 * race, nearest it in power to weight.
 * @param car The car
 * @param cars Every installed car, the listed ones among them
 * @param catalogue The class catalogue its specs resolve against
 * @param prices The prices the user set on cars they added
 * @returns The appraisal
 */
export const appraise = (
  car: Car,
  cars: readonly Car[],
  catalogue: ClassCatalogue,
  prices: UserPrices,
): CarAppraisal => {
  const price = carPrice(car, catalogue, prices);
  const suggested = derivedPrice(car, catalogue);
  const kin = specKin(car.id, catalogue);
  const nearest = (candidates: readonly Car[], distance: (other: Car) => number): Car[] => [...candidates]
    .sort((left, right) => distance(left) - distance(right))
    .slice(0, KIN_COUNT);

  if (kin.length > 0) {
    const spec = carSpecsOf(car.id, catalogue).find((one) => specCars(one, catalogue).some((id) => kin.includes(id)));

    return {
      car,
      price,
      suggested,
      basis: 'spec',
      spec: spec ?? null,
      kin: nearest(cars.filter((other) => kin.includes(other.id)), (other) => apart(CAR_PRICES[other.id], suggested)),
    };
  }

  const power = perTonne(car);
  const listed = cars.filter((other) => CAR_PRICES[other.id] !== undefined && perTonne(other) !== null);
  // A road car among road cars and a racer among racers, wherever there are
  // any of its kind to compare with.
  const kind = kindOf(car);
  const alike = listed.filter((other) => kind === null || kindOf(other) === kind);

  return {
    car,
    price,
    suggested,
    basis: 'curve',
    spec: null,
    kin: power === null
      ? []
      : nearest(alike.length > 0 ? alike : listed, (other) => apart(perTonne(other) ?? power, power)),
  };
};

/**
 * The rung a rented car's rent is capped at: its class's, or the lower one a
 * historic event is raced from, so the rent follows the purse.
 * @param tier The class's rung, 1 being the top
 * @param raced The rung a historic event is raced from, where it has one
 * @returns The rung
 */
export const rentRung = (tier: number, raced?: number): number => Math.max(tier, raced ?? tier);

/**
 * What renting a car costs each round: a share of its price, never more than
 * the rung it is raced on can carry. Without a rung, the top one's, so a car
 * shown on its own shows the most it can cost.
 * @param price What the car costs to buy
 * @param rung The rung of the class it is raced in, 1 being the top
 * @returns The rent, in whole units
 */
export const rentOf = (price: number, rung = 1): number => (
  Math.round(Math.min(price * RENT_SHARE, rungFee(rung) * RENT_CAP_FEES))
);

/**
 * What repainting a car costs.
 * @param price What the car costs to buy, or what was paid for one owned
 * @returns The cost, in whole units
 */
export const repaintOf = (price: number): number => Math.round(price * REPAINT_SHARE);

/**
 * What selling a car pays: what was paid for it on the day it was bought,
 * falling a day at a time, and never under the floor.
 * @param paid What was paid for it
 * @param bought The day it was bought, as an ISO date
 * @param today The day it is sold, as an ISO date
 * @returns What it sells for, in whole units
 */
export const resaleValue = (paid: number, bought: string, today: string): number => {
  const years = Math.max(0, daysBetween(bought, today)) / DAYS_PER_YEAR;
  const share = Math.max(RESALE_FLOOR, 1 - DEPRECIATION_PER_YEAR * years);

  return Math.round((paid * share) / RESALE_STEP) * RESALE_STEP;
};
