// Shared content fixture for the raceIni tests. Deliberately small: two cars
// with different skin counts, a single-layout and a multi-layout track, and one
// weather with a non-zero temperature coefficient.

import type { Content, RaceDefinition } from '../../../shared/types/index.ts';

/**
 * Installed content the raceIni tests resolve against.
 * @returns A fresh Content, so a test mutating it cannot affect another
 */
export const makeContent = (): Content => ({
  cars: [
    {
      id: 'test_car', name: 'Test Car', brand: 'Testing', tags: [], skins: ['red', 'blue', 'green'],
    },
    {
      id: 'other_car', name: 'Other Car', brand: null, tags: [], skins: ['white'],
    },
    {
      id: 'skinless_car', name: 'Skinless', brand: null, tags: [], skins: [],
    },
  ],
  tracks: [
    {
      id: 'test_track',
      layout: '',
      key: 'test_track',
      name: 'Test Track',
      country: 'Testland',
      pitboxes: 24,
      geotags: { lat: 52.5, lon: -1.25 },
    },
    {
      id: 'multi_track',
      layout: 'gp',
      key: 'multi_track/gp',
      name: 'Multi GP',
      country: null,
      pitboxes: 4,
      geotags: { lat: null, lon: null },
    },
  ],
  weather: [
    {
      id: 'test_clear', name: 'Clear', type: 15, temperatureCoeff: 1, author: null,
    },
    {
      id: 'test_rain', name: 'Rain', type: 8, temperatureCoeff: -0.5, author: null,
    },
    {
      id: 'kunos_weather', name: 'Kunos', type: null, temperatureCoeff: 0, author: null,
    },
  ],
  controllers: [
    {
      id: 'testCtrl static', name: 'Test Static', author: null, description: null,
    },
  ],
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
