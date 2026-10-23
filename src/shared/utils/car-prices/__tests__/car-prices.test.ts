import { describe, expect, it } from '@jest/globals';

import { CarSpec, ContentSource } from '../../../types/index.ts';
import type { Car, CarPerformance } from '../../../types/index.ts';
import { resolveCatalogue, SHIPPED_CATALOGUE, specCars } from '../../car-classes/index.ts';
import {
  appraise,
  carPrice,
  derivedPrice,
  isCarPrice,
  priceOrigin,
  rentOf,
  repaintOf,
  resaleValue,
  withCarPrice,
} from '../car-prices.ts';
import {
  CAR_PRICES, KIN_COUNT, MAX_CAR_PRICE, MIN_CAR_PRICE, PRICE_FLOOR, RESALE_FLOOR,
} from '../constants.ts';

/**
 * A car the user added and placed in the shipped GT3 spec, which the price list
 * does not name.
 */
const MY_GT3 = 'my_gt3';

/**
 * The shipped catalogue with that car in the GT3 spec.
 */
const CATALOGUE = resolveCatalogue({
  version: 1, classes: [], specs: [], cars: { [MY_GT3]: [CarSpec.GT3_2010S] },
});

/**
 * The listed cars the GT3 spec holds, which a car in it is priced off.
 */
const GT3_KIN = specCars(CarSpec.GT3_2010S, CATALOGUE).filter((id) => id !== MY_GT3);

/**
 * The middle of a list of prices.
 * @param prices The prices
 * @returns The median
 */
const median = (prices: readonly number[]): number => {
  const sorted = [...prices].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/**
 * Builds a car, defaulting everything the test in hand does not care about.
 * @param id Its folder ID
 * @param over Whatever the test wants said differently
 * @param performance Its figures, those left out unstated
 * @returns The car
 */
const makeCar = (id: string, over: Partial<Omit<Car, 'performance'>> = {}, performance: Partial<CarPerformance> = {}): Car => ({
  id,
  name: id,
  brand: null,
  tags: [],
  skins: [],
  carClass: null,
  year: 2015,
  country: null,
  description: null,
  curves: null,
  provenance: {
    source: ContentSource.MOD, pack: null, maker: null, distributor: null,
  },
  ...over,
  performance: {
    bhp: null,
    torqueNm: null,
    weightKg: null,
    topSpeedKph: null,
    accelerationSeconds: null,
    powerToWeight: null,
    ...performance,
    raw: {
      bhp: null, torque: null, weight: null, topspeed: null, acceleration: null, pwratio: null,
    },
  },
});

/**
 * A car off the price list and outside every spec, priced on the curve alone.
 * @param bhp Its power, or null for none stated
 * @param weightKg Its weight, or null for none stated
 * @param year The year it was made, or null for none stated
 * @returns The car
 */
const curveCar = (bhp: number | null, weightKg: number | null, year: number | null): Car => (
  makeCar('unlisted_mod', { year }, { bhp, weightKg })
);

describe('shared/utils/car-prices', () => {
  describe('derivedPrice', () => {
    it("is the middle of the listed prices its spec holds, rounded to its band's step", () => {
      const middle = median(GT3_KIN.map((id) => CAR_PRICES[id]));

      expect(derivedPrice(makeCar(MY_GT3), CATALOGUE)).toBe(Math.round(middle / 5_000) * 5_000);
    });

    it('prices a car in no spec on its power to weight', () => {
      expect(derivedPrice(curveCar(150, 1000, 2015), SHIPPED_CATALOGUE)).toBe(25_000);
      expect(derivedPrice(curveCar(300, 1000, 2015), SHIPPED_CATALOGUE)).toBe(115_000);
    });

    it('rounds to a coarser step the dearer the car', () => {
      expect(derivedPrice(curveCar(1000, 1000, 2015), SHIPPED_CATALOGUE)).toBe(1_600_000);
    });

    it('takes a share off an older car, by the decade it was made in', () => {
      expect(derivedPrice(curveCar(150, 1000, 2005), SHIPPED_CATALOGUE)).toBe(21_000);
      expect(derivedPrice(curveCar(150, 1000, 1995), SHIPPED_CATALOGUE)).toBe(19_000);
      expect(derivedPrice(curveCar(150, 1000, 1985), SHIPPED_CATALOGUE)).toBe(18_000);
    });

    it('takes a car that states no weight at the assumed one', () => {
      expect(derivedPrice(curveCar(195, null, 2015), SHIPPED_CATALOGUE)).toBe(25_000);
    });

    it('never goes under the floor, which is also what a car stating no power costs', () => {
      expect(derivedPrice(curveCar(10, 1000, 2015), SHIPPED_CATALOGUE)).toBe(PRICE_FLOOR);
      expect(derivedPrice(curveCar(null, 1000, 2015), SHIPPED_CATALOGUE)).toBe(PRICE_FLOOR);
    });
  });

  describe('carPrice', () => {
    it("is the price list's for a car it names, whatever the user set", () => {
      const car = makeCar('ks_porsche_911_gt3_r_2016');

      expect(carPrice(car, CATALOGUE, { ks_porsche_911_gt3_r_2016: 1_000 })).toBe(CAR_PRICES[car.id]);
    });

    it("is the user's for a car they priced", () => {
      expect(carPrice(makeCar(MY_GT3), CATALOGUE, { [MY_GT3]: 99_000 })).toBe(99_000);
    });

    it('is the suggestion for a car nobody priced', () => {
      const car = makeCar(MY_GT3);

      expect(carPrice(car, CATALOGUE)).toBe(derivedPrice(car, CATALOGUE));
    });
  });

  describe('priceOrigin', () => {
    it("says a listed car's price is the price list's, whatever the user set", () => {
      expect(priceOrigin('ks_porsche_911_gt3_r_2016', { ks_porsche_911_gt3_r_2016: 1_000 })).toBe('catalogue');
    });

    it("says a car the user priced is theirs, and any other a suggestion", () => {
      expect(priceOrigin(MY_GT3, { [MY_GT3]: 99_000 })).toBe('yours');
      expect(priceOrigin(MY_GT3, {})).toBe('suggested');
    });
  });

  describe('isCarPrice', () => {
    it('takes a whole number within the bounds, the bounds included', () => {
      expect(isCarPrice(MIN_CAR_PRICE)).toBe(true);
      expect(isCarPrice(MAX_CAR_PRICE)).toBe(true);
      expect(isCarPrice(85_000)).toBe(true);
    });

    it('refuses anything out of bounds, fractional or not a number', () => {
      expect(isCarPrice(MIN_CAR_PRICE - 1)).toBe(false);
      expect(isCarPrice(MAX_CAR_PRICE + 1)).toBe(false);
      expect(isCarPrice(85_000.5)).toBe(false);
      expect(isCarPrice('85000')).toBe(false);
      expect(isCarPrice(null)).toBe(false);
    });
  });

  describe('withCarPrice', () => {
    it("sets a car's price and leaves the others", () => {
      expect(withCarPrice({ other: 10_000 }, MY_GT3, 99_000, 220_000)).toEqual({ other: 10_000, [MY_GT3]: 99_000 });
    });

    it("replaces a car's price set before", () => {
      expect(withCarPrice({ [MY_GT3]: 50_000 }, MY_GT3, 99_000, 220_000)).toEqual({ [MY_GT3]: 99_000 });
    });

    it("takes the user's price back with null", () => {
      expect(withCarPrice({ other: 10_000, [MY_GT3]: 50_000 }, MY_GT3, null, 220_000)).toEqual({ other: 10_000 });
    });

    it('drops a price equal to the suggestion, which is no price of theirs', () => {
      expect(withCarPrice({ [MY_GT3]: 50_000 }, MY_GT3, 220_000, 220_000)).toEqual({});
    });
  });

  describe('appraise', () => {
    const listed = GT3_KIN.map((id) => makeCar(id));

    it('compares a car in a priced spec with the cars of that spec nearest its suggestion', () => {
      const car = makeCar(MY_GT3);
      const appraisal = appraise(car, [car, ...listed], CATALOGUE, { [MY_GT3]: 99_000 });
      const suggested = derivedPrice(car, CATALOGUE);
      const gap = (other: Car): number => Math.abs(Math.log(CAR_PRICES[other.id] / suggested));

      expect(appraisal).toMatchObject({
        car, price: 99_000, suggested, basis: 'spec', spec: CarSpec.GT3_2010S,
      });
      expect(appraisal.kin).toHaveLength(Math.min(KIN_COUNT, listed.length));
      expect(appraisal.kin.map(gap)).toEqual([...appraisal.kin.map(gap)].sort((left, right) => left - right));
      expect(appraisal.kin.every((other) => GT3_KIN.includes(other.id))).toBe(true);
    });

    describe('for a car in no priced spec', () => {
      const road = makeCar('ks_mazda_mx5_nd', { carClass: 'street' }, { bhp: 160, weightKg: 1000 });
      const racer = makeCar('ks_mazda_mx5_cup', { carClass: 'race' }, { bhp: 160, weightKg: 1000 });
      const unpowered = makeCar('ks_porsche_911_gt3_r_2016', { carClass: 'street' });

      it('compares it on power to weight with the listed cars of its kind', () => {
        const car = makeCar('unlisted_mod', { carClass: 'Street' }, { bhp: 150, weightKg: 1000 });
        const appraisal = appraise(car, [car, road, racer, unpowered], SHIPPED_CATALOGUE, {});

        expect(appraisal).toMatchObject({ basis: 'curve', spec: null, price: derivedPrice(car, SHIPPED_CATALOGUE) });
        expect(appraisal.kin.map((one) => one.id)).toEqual(['ks_mazda_mx5_nd']);
      });

      it('reads its kind off its tags where it states no class', () => {
        const car = makeCar('unlisted_mod', { tags: ['Race'] }, { bhp: 150, weightKg: 1000 });

        expect(appraise(car, [road, racer], SHIPPED_CATALOGUE, {}).kin.map((one) => one.id))
          .toEqual(['ks_mazda_mx5_cup']);
      });

      it('orders the comparison nearest its power to weight first', () => {
        const car = makeCar('unlisted_mod', {}, { bhp: 150, weightKg: 1000 });
        const heavy = makeCar('ks_porsche_911_gt3_r_2016', { carClass: 'race' }, { bhp: 500, weightKg: 1000 });

        expect(appraise(car, [heavy, road], SHIPPED_CATALOGUE, {}).kin.map((one) => one.id))
          .toEqual(['ks_mazda_mx5_nd', 'ks_porsche_911_gt3_r_2016']);
      });

      it('compares it with every listed car where none is of its kind', () => {
        const car = makeCar('unlisted_mod', { carClass: 'street' }, { bhp: 150, weightKg: 1000 });

        expect(appraise(car, [racer], SHIPPED_CATALOGUE, {}).kin.map((one) => one.id)).toEqual(['ks_mazda_mx5_cup']);
      });

      it('has nothing to compare a car stating no power with', () => {
        const car = makeCar('unlisted_mod', { carClass: 'street' });

        expect(appraise(car, [road, racer], SHIPPED_CATALOGUE, {}).kin).toEqual([]);
      });
    });
  });

  describe('rentOf', () => {
    it('is a fiftieth of the price a round, in whole units', () => {
      expect(rentOf(32_000)).toBe(640);
      expect(rentOf(32_025)).toBe(641);
    });
  });

  describe('repaintOf', () => {
    it('is one and a half percent of the price, in whole units', () => {
      expect(repaintOf(40_000)).toBe(600);
      expect(repaintOf(40_030)).toBe(600);
    });
  });

  describe('resaleValue', () => {
    it('pays everything that was paid on the day of purchase', () => {
      expect(resaleValue(40_000, '2027-01-01', '2027-01-01')).toBe(40_000);
    });

    it('loses seven and a half percent a year, a day at a time, rounded to the hundred', () => {
      expect(resaleValue(40_000, '2027-01-01', '2028-01-01')).toBe(37_000);
      expect(resaleValue(40_000, '2027-01-01', '2027-07-02')).toBe(38_500);
    });

    it('never falls under the floor', () => {
      expect(resaleValue(40_000, '2027-01-01', '2040-01-01')).toBe(40_000 * RESALE_FLOOR);
    });

    it('pays everything for a sale dated before the purchase', () => {
      expect(resaleValue(40_000, '2027-06-01', '2027-01-01')).toBe(40_000);
    });
  });
});
