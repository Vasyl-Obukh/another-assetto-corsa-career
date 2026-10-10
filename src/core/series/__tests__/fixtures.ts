// Shared fixtures for the series tests: a small installed library, and a
// championship clean enough that a test can break exactly one thing about it.

import { SERIES_FORMAT_VERSION } from '../../../shared/constants/index.ts';
import { Discipline } from '../../../shared/types/index.ts';
import type {
  Car, Championship, Content, Skin, Track,
} from '../../../shared/types/index.ts';
import { carProvenance, trackProvenance } from '../../content-catalogue/index.ts';

/**
 * Builds a livery carrying nothing but its folder name.
 * @param id The livery folder name
 * @returns A complete Skin
 */
const makeSkin = (id: string): Skin => ({
  id, name: id, driver: null, team: null, number: null, country: null,
});

/**
 * Builds a car, defaulting the metadata none of these tests reads.
 * @param id The car folder ID
 * @param skins The livery folder names it ships
 * @returns A complete Car
 */
const makeCar = (id: string, skins: string[]): Car => ({
  id,
  name: id,
  brand: null,
  provenance: carProvenance(id),
  tags: [],
  carClass: null,
  description: null,
  curves: null,
  year: null,
  country: null,
  performance: {
    bhp: null,
    torqueNm: null,
    weightKg: null,
    topSpeedKph: null,
    accelerationSeconds: null,
    powerToWeight: null,
    raw: {
      bhp: null, torque: null, weight: null, topspeed: null, acceleration: null, pwratio: null,
    },
  },
  skins: skins.map(makeSkin),
});

/**
 * Builds a single-layout circuit.
 * @param id The track folder ID
 * @param pitboxes How many cars it can start
 * @returns A complete Track
 */
const makeTrack = (id: string, pitboxes: number): Track => ({
  id,
  layout: '',
  key: id,
  name: id,
  country: null,
  pitboxes,
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
  provenance: trackProvenance(id, ''),
});

/**
 * Installed content the series tests resolve eligibility against.
 * @returns A fresh Content, so a test mutating it cannot affect another
 */
export const makeContent = (): Content => ({
  cars: [
    makeCar('test_car', ['red', 'blue', 'green']),
    makeCar('oval_car', ['white']),
    makeCar('skinless_car', []),
  ],
  tracks: [makeTrack('magione', 24), makeTrack('tiny', 2)],
  weather: [],
  controllers: [],
  issues: [],
});

/**
 * A championship that validates clean, for a test to break one thing about.
 * @param overrides What to change about it
 * @returns The championship
 */
export const makeSeries = (overrides: Partial<Championship> = {}): Championship => ({
  version: SERIES_FORMAT_VERSION,
  id: 'test-cup',
  name: 'Test Cup',
  entries: [{
    id: 'main',
    name: 'Main',
    ladder: { discipline: Discipline.ROAD, tier: 6 },
    seats: Array.from({ length: 3 }, (unused, at) => ({ id: `main-${at + 1}` })),
    eligibility: { kind: 'cars', cars: ['test_car'] },
  }],
  rounds: [{ id: 'magione', name: 'Magione', track: { id: 'magione' } }],
  eventFormats: [{
    id: 'standard',
    name: 'Standard',
    sessions: [{ type: 'race', name: 'Race', laps: 8, day: 0 }],
  }],
  defaultEventFormat: 'standard',
  pointsSystems: [{ id: 'race', name: 'Race points', positions: [10, 8, 6] }],
  defaultPointsSystem: 'race',
  ...overrides,
});
