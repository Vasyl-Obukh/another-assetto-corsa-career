// Shared fixtures for the contentQuery tests. Deliberately small and varied:
// enough brands, tags and missing figures to tell filtering, ordering and facet
// counting apart from one another.

import type { Car, CarSpecs, Track } from '../../../shared/types/index.ts';
import { carProvenance, trackProvenance } from '../../content-catalogue/index.ts';

/**
 * What a fixture car may override. Specs are partial, since no test cares about
 * all six figures at once.
 */
type CarOverrides = Pick<Car, 'id' | 'name'>
  & Partial<Omit<Car, 'specs'>>
  & { specs?: Partial<CarSpecs> };

/**
 * Builds a car, defaulting everything the test in hand does not care about.
 * @param car The fields this car actually needs
 * @returns A complete Car
 */
export const makeCar = ({ specs, ...car }: CarOverrides): Car => ({
  brand: null,
  provenance: carProvenance(car.id),
  tags: [],
  skins: ['default'],
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
  geotags: { lat: null, lon: null },
  provenance: trackProvenance(track.id, track.layout ?? ''),
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
    tags: ['gt3', 'race'],
    carClass: 'race',
    year: 2018,
    country: 'Italy',
    specs: { bhp: 600, weightKg: 1200, powerToWeight: 500 },
  }),
  makeCar({
    id: 'ferrari_f40',
    name: 'Ferrari F40',
    brand: 'Ferrari',
    tags: ['street'],
    carClass: 'street',
    year: 1987,
    country: 'Italy',
    specs: { bhp: 471, weightKg: 1100, powerToWeight: 428 },
  }),
  makeCar({
    id: 'porsche_911_gt3',
    name: 'Porsche 911 GT3',
    brand: 'Porsche',
    tags: ['gt3', 'street'],
    carClass: 'race',
    year: 2018,
    country: 'Germany',
    specs: { bhp: 500, weightKg: 1400, powerToWeight: 357 },
  }),
  makeCar({
    id: 'citroen_ds3',
    name: 'Citroën DS3',
    brand: 'Citroën',
    tags: ['street'],
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
