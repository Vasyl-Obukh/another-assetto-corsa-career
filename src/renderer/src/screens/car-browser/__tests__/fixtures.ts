// Shared fixtures for the car card tests. Only the fields the card actually
// reads are interesting; everything else defaults out of the way.

import { ContentSource } from '../../../../../shared/types';
import type { Car, CarSpecs } from '../../../../../shared/types';

/**
 * What a fixture car may override.
 */
type CarOverrides = Pick<Car, 'id'> & Partial<Omit<Car, 'specs'>> & { specs?: Partial<CarSpecs> };

/**
 * Builds a car, defaulting everything the test in hand does not care about.
 * @param car The fields this car actually needs
 * @returns A complete Car
 */
export const makeCar = ({ specs, ...car }: CarOverrides): Car => ({
  name: car.id,
  brand: null,
  provenance: {
    source: ContentSource.MOD, pack: null, maker: null, distributor: null,
  },
  tags: [],
  skins: [],
  carClass: null,
  year: null,
  country: null,
  ...car,
  specs: {
    bhp: null,
    torqueNm: null,
    weightKg: null,
    topSpeedKph: null,
    accelerationSeconds: null,
    powerToWeight: null,
    ...specs,
    raw: {
      bhp: null, torque: null, weight: null, topspeed: null, acceleration: null, pwratio: null,
    },
  },
});
