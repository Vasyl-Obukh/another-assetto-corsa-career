// Shared content fixture for the raceIni tests. Deliberately small: two cars
// with different skin counts, a single-layout and a multi-layout track, and one
// weather with a non-zero temperature coefficient.

import type { Car, Content, RaceDefinition, Skin } from '../../../shared/types/index.ts';
import { carProvenance, trackProvenance } from '../../content-catalogue/index.ts';

/**
 * Builds a car, defaulting everything raceIni does not look at.
 *
 * raceIni reads only the id, name and skins, so the metadata a content scan also
 * collects is filled in once here rather than at every call site.
 * @param car The fields this fixture's car actually needs
 * @returns A complete Car
 */
export const makeCar = (car: Pick<Car, 'id' | 'name' | 'skins'> & Partial<Car>): Car => ({
  brand: null,
  provenance: carProvenance(car.id),
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
  ...car,
});

/**
 * Builds a livery carrying nothing but its folder name.
 *
 * race.ini only ever reads the ID, so the metadata fields stay empty here.
 * @param id The livery folder name
 * @returns A complete Skin
 */
const makeSkin = (id: string): Skin => ({
  id, name: id, driver: null, team: null, number: null, country: null,
});

/**
 * Installed content the raceIni tests resolve against.
 * @returns A fresh Content, so a test mutating it cannot affect another
 */
export const makeContent = (): Content => ({
  cars: [
    makeCar({
      id: 'test_car',
      name: 'Test Car',
      brand: 'Testing',
      skins: ['red', 'blue', 'green'].map(makeSkin),
    }),
    makeCar({ id: 'other_car', name: 'Other Car', skins: [makeSkin('white')] }),
    makeCar({ id: 'skinless_car', name: 'Skinless', skins: [] }),
  ],
  tracks: [
    {
      id: 'test_track',
      layout: '',
      key: 'test_track',
      name: 'Test Track',
      country: 'Testland',
      pitboxes: 24,
      lengthM: null,
      widthM: null,
      geotags: { lat: 52.5, lon: -1.25 },
      city: null,
      run: null,
      description: null,
      tags: [],
      author: null,
      version: null,
      year: null,
      photos: [],
      logo: false,
      provenance: trackProvenance('test_track', ''),
    },
    {
      id: 'multi_track',
      layout: 'gp',
      key: 'multi_track/gp',
      name: 'Multi GP',
      country: null,
      pitboxes: 4,
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
      provenance: trackProvenance('multi_track', 'gp'),
    },
  ],
  weather: [
    {
      id: 'test_clear', name: 'Clear', type: 15, temperatureCoeff: 1, author: null,
      timeDiapason: null, cloudCover: 0, rain: null, forceHeadlights: false,
    },
    {
      id: 'test_rain', name: 'Rain', type: 8, temperatureCoeff: -0.5, author: null,
      timeDiapason: null, cloudCover: 0, rain: null, forceHeadlights: false,
    },
    {
      id: 'kunos_weather', name: 'Kunos', type: null, temperatureCoeff: 0, author: null,
      timeDiapason: null, cloudCover: 0, rain: null, forceHeadlights: false,
    },
  ],
  controllers: [
    {
      id: 'testCtrl static',
      name: 'Test Static',
      author: null,
      description: null,
      version: null, follows: { weather: 'yes', temperature: 'yes', wind: 'yes' },
    },
  ],
  issues: [],
});

/**
 * A minimal runnable race against the fixture content.
 * @returns A fresh RaceDefinition
 */
export const makeRace = (): RaceDefinition => ({
  id: 'test-race',
  name: 'Test Race',
  track: { id: 'test_track' },
  playerCar: { model: 'test_car' },
});
