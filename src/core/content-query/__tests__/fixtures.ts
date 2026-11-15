// Shared fixtures for the contentQuery tests. Deliberately small and varied:
// enough brands, tags and missing figures to tell filtering, ordering and facet
// counting apart from one another.

import type { Car, CarPerformance, Track } from '../../../shared/types/index.ts';
import { carProvenance, trackProvenance } from '../../content-catalogue/index.ts';

/**
 * What a fixture car may override. Specs are partial, since no test cares about
 * all six figures at once.
 */
type CarOverrides = Pick<Car, 'id' | 'name'>
  & Partial<Omit<Car, 'performance'>>
  & { performance?: Partial<CarPerformance> };

/**
 * Builds a car, defaulting everything the test in hand does not care about.
 * @param car The fields this car actually needs
 * @returns A complete Car
 */
export const makeCar = ({ performance, ...car }: CarOverrides): Car => ({
  brand: null,
  provenance: carProvenance(car.id),
  tags: [],
  skins: [{
    id: 'default', name: 'Default', driver: null, team: null, number: null, country: null,
  }],
  carClass: null,
  description: null,
  curves: null,
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

/**
 * Builds a track layout, defaulting everything the test in hand does not care about.
 * @param track The fields this layout actually needs
 * @returns A complete Track
 */
export const makeTrackEntry = (
  track: Pick<Track, 'id' | 'name'> & Partial<Track>,
): Track => ({
  layout: '',
  key: track.layout ? `${track.id}/${track.layout}` : track.id,
  country: null,
  pitboxes: null,
  lengthM: null,
  widthM: null,
  geotags: { lat: null, lon: null },
  city: null,
  run: null,
  description: null,
  tags: [],
  author: null,
  version: null,
  year: null,
  photos: [],
  logo: false,
  provenance: trackProvenance(track.id),
  ...track,
});

/**
 * A small library covering every filter and sort the car browser offers.
 * @returns Five cars, some of which are missing figures on purpose
 */
export const makeCars = (): Car[] => [
  makeCar({
    id: 'ferrari_488_gt3',
    name: 'Ferrari 488 GT3',
    brand: 'Ferrari',
    year: 2018,
    country: 'Italy',
    performance: { bhp: 600, weightKg: 1200, powerToWeight: 500 },
  }),
  makeCar({
    id: 'ferrari_f40',
    name: 'Ferrari F40',
    brand: 'Ferrari',
    year: 1987,
    country: 'Italy',
    performance: { bhp: 471, weightKg: 1100, powerToWeight: 428 },
  }),
  makeCar({
    id: 'ks_porsche_911_gt3_r_2016',
    name: 'Porsche 911 GT3',
    brand: 'Porsche',
    year: 2018,
    country: 'Germany',
    performance: { bhp: 500, weightKg: 1400, powerToWeight: 357 },
  }),
  makeCar({
    id: 'citroen_ds3',
    name: 'Citroën DS3',
    brand: 'Citroën',
    country: 'France',
  }),
  makeCar({ id: 'nameless_mod', name: 'Nameless Mod', skins: [] }),
];

/**
 * A small set of layouts covering every track filter and sort.
 * @returns Four layouts, some of which are missing figures on purpose
 */
export const makeTracks = (): Track[] => [
  makeTrackEntry({
    id: 'spa',
    name: 'Spa-Francorchamps',
    country: 'Belgium',
    pitboxes: 24,
    geotags: { lat: 50.4, lon: 5.9 },
  }),
  makeTrackEntry({
    id: 'monza', name: 'Monza', country: 'Italy', pitboxes: 30,
  }),
  makeTrackEntry({
    id: 'imola', name: 'Imola', country: 'Italy', pitboxes: 12, geotags: { lat: 44.3, lon: 11.7 },
  }),
  makeTrackEntry({ id: 'mod_track', name: 'Mod Track' }),
];
