import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * 1000 km of Spa 1969, as a historic event of its own.
 */
export const SPA_1000_1969: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'spa-1000-1969',
  name: '1000 km of Spa 1969',
  description: 'Siffert and Redman\'s Porsche 908 against the Ford GT40s, in the rain that always finds Spa.',
  teams: [
    team('gulf-wyer', 'Slough Engineering', 'GBR', TeamBudget.WORKS),
    team('zuffenhausen', 'Salzburg Sportwagen', 'AUT', TeamBudget.WORKS),
    team('maranello', 'Scuderia Modenese', 'ITA', TeamBudget.WORKS),
    team('ecurie-bleue', 'Écurie Bleue', 'FRA', TeamBudget.INDEPENDENT),
    team('dearborn', 'Dearborn Racing', 'USA', TeamBudget.INDEPENDENT),
    team('scuderia-lario', 'Scuderia del Lario', 'ITA', TeamBudget.PRIVATEER),
    team('ostschweiz', 'Ecurie Ostschweiz', 'CHE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'sports',
      name: 'Sports and prototypes',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 1,
      },
      seats: [
        seat('gul-1', 'gulf-wyer', 'Anthony Latchford', 'GBR'),
        seat('gul-2', 'gulf-wyer', 'Malcolm Everingham', 'GBR'),
        seat('zuf-1', 'zuffenhausen', 'Werner Hollenstein', 'AUT'),
        seat('zuf-2', 'zuffenhausen', 'Kurt Messerschmied', 'DEU'),
        seat('zuf-3', 'zuffenhausen', 'Hubert Lehrbach', 'DEU'),
        seat('mar-1', 'maranello', 'Carlo Ruggerini', 'ITA'),
        seat('mar-2', 'maranello', 'Nino Vacchelli', 'ITA'),
        seat('ecu-1', 'ecurie-bleue', 'Jean-Claude Arnaudet', 'FRA'),
        seat('ecu-2', 'ecurie-bleue', 'Gérard Lafforgue', 'FRA'),
        seat('dea-1', 'dearborn', 'Walt Henning', 'USA'),
        seat('dea-2', 'dearborn', 'Bobby Tennant', 'USA'),
        seat('lar-1', 'scuderia-lario', 'Ernesto Colnaghi', 'ITA'),
        seat('lar-2', 'scuderia-lario', 'Piero Galimberti', 'ITA'),
        seat('ost-1', 'ostschweiz', 'Toni Blattmann', 'CHE'),
        seat('ost-2', 'ostschweiz', 'Herbert Rüegg', 'CHE'),
        seat('dea-3', 'dearborn', 'Chuck Maddox', 'USA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.SPORTS_PROTOTYPE_60S,
        minModels: 1,
      },
    },
  ],
  eventFormats: [
    {
      id: 'spa-1000',
      name: '1000 km (Spa)',
      sessions: [
        {
          type: 'practice',
          name: 'Practice',
          minutes: 120,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Qualifying',
          minutes: 60,
          day: 0,
        },
        {
          type: 'race',
          name: '1000 km',
          laps: 143,
          day: 1,
        },
      ],
    },
  ],
  defaultEventFormat: 'spa-1000',
  rounds: [
    {
      id: 'event',
      name: '1000 km of Spa 1969',
      track: {
        id: 'spa',
      },
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    {
      id: 'none',
      name: 'No points',
      positions: [],
    },
  ],
  defaultPointsSystem: 'none',
  grid: {
    strength: 3,
    aggression: -5,
  },
  generatedWeather: {
    climate: Climate.MEDITERRANEAN,
  },
  regulations: {
    assists: {
      damage: 100,
      tyreWear: 1,
      fuelRate: 1,
      tyreBlankets: false,
    },
    penalties: true,
    jumpStartPenalty: 10,
  },
  prizes: {
    positions: [45000, 29000, 19000, 13500, 10000, 7000],
  },
};
