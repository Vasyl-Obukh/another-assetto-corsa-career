// Shared fixtures for the contentStore tests.

import type { ContentScan } from '../../../core/content/index.ts';
import { carProvenance, trackProvenance } from '../../../core/content-catalogue/index.ts';
import { CONTENT_CATALOGUE_VERSION } from '../../../core/content-catalogue/index.ts';
import type {
  Car, Content, Track, Weather, WeatherController,
} from '../../../shared/types/index.ts';
import { CONTENT_CACHE_VERSION } from '../constants.ts';
import type { ContentCache } from '../types.ts';

/**
 * Builds a car with only the fields these tests look at filled in.
 * @param id Car folder name, used as its name too
 * @returns A complete Car
 */
export const makeCar = (id: string): Car => ({
  id,
  name: id,
  provenance: carProvenance(id),
  brand: null,
  tags: [],
  skins: [{
    id: 'default', name: 'Default', driver: null, team: null, number: null, country: null,
  }],
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
});

/**
 * Builds a track layout with only the fields these tests look at filled in.
 * @param id Track folder name, used as its name too
 * @returns A complete Track
 */
export const makeTrack = (id: string): Track => ({
  id,
  layout: '',
  provenance: trackProvenance(id),
  key: id,
  name: id,
  country: null,
  pitboxes: 24,
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
});

/**
 * Builds a weather preset.
 * @param id Weather folder name
 * @returns A complete Weather
 */
export const makeWeather = (id: string): Weather => ({
  id,
  name: id,
  type: null,
  temperatureCoeff: 0,
  author: null,
  timeDiapason: null, cloudCover: 0, rain: null, forceHeadlights: false,
});

/**
 * Builds a CSP weather controller.
 * @param id Controller folder name
 * @returns A complete WeatherController
 */
export const makeController = (id: string): WeatherController => ({
  id,
  name: id,
  author: null,
  description: null,
  version: null, follows: { weather: 'yes', temperature: 'yes', wind: 'yes' },
});

/**
 * Builds scanned content out of plain ID lists.
 * @param cars Car IDs
 * @param tracks Track IDs
 * @returns A Content carrying those entries and nothing broken
 */
export const makeContent = (cars: string[] = [], tracks: string[] = []): Content => ({
  cars: cars.map(makeCar),
  tracks: tracks.map(makeTrack),
  weather: [],
  controllers: [],
  issues: [],
});

/**
 * Builds a scan, defaulting the fingerprints to one stamp per entry.
 * @param content What the scan found
 * @param stamp The fingerprint every entry gets
 * @returns A complete ContentScan
 */
export const makeScan = (content: Content, stamp = 'a'): ContentScan => ({
  content,
  fingerprints: {
    cars: Object.fromEntries(content.cars.map((car) => [car.id, stamp])),
    tracks: Object.fromEntries(content.tracks.map((track) => [track.id, stamp])),
  },
  scannedAt: '2026-01-01T00:00:00.000Z',
  durationMs: 12,
});

/**
 * Builds a cache file's contents.
 * @param contentDir The install it claims to describe
 * @param content What it claims was found
 * @returns A complete ContentCache
 */
export const makeCache = (contentDir: string, content = makeContent(['car_a'])): ContentCache => ({
  version: CONTENT_CACHE_VERSION,
  catalogueVersion: CONTENT_CATALOGUE_VERSION,
  contentDir,
  scannedAt: '2026-01-01T00:00:00.000Z',
  durationMs: 12,
  fingerprints: makeScan(content).fingerprints,
  content,
});
