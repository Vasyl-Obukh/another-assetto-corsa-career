// Shared fixtures for the car card tests. Only the fields the card actually
// reads are interesting; everything else defaults out of the way.

import { ContentSource } from '../../../../../shared/types';
import type { Car, CarPerformance, Skin } from '../../../../../shared/types';

/**
 * Builds a livery carrying nothing but its folder name, which is all the card
 * reads off one.
 * @param id The livery folder name
 * @returns A complete Skin
 */
export const makeSkin = (id: string): Skin => ({
  id, name: id, driver: null, team: null, number: null, country: null,
});

/**
 * What a fixture car may override.
 */
type CarOverrides = Pick<Car, 'id'> & Partial<Omit<Car, 'performance'>> & { performance?: Partial<CarPerformance> };

/**
 * Builds a car, defaulting everything the test in hand does not care about.
 * @param car The fields this car actually needs
 * @returns A complete Car
 */
export const makeCar = ({ performance, ...car }: CarOverrides): Car => ({
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
