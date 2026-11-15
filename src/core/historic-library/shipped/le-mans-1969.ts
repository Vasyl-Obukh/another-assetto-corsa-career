import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * 24 Hours of Le Mans 1969, as a historic event of its own.
 */
export const LE_MANS_1969: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'le-mans-1969',
  name: '24 Hours of Le Mans 1969',
  description: {
    en: 'Ickx walked to his car in protest at the running start, then won by barely a hundred metres after twenty-four hours.',
    uk: 'Ікс на знак протесту проти ле-манівського старту пішов до машини кроком, а через двадцять чотири '
      + 'години виграв із перевагою ледве в сотню метрів.',
  },
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
      },
    },
  ],
  eventFormats: [
    {
      id: 'twenty-four-hours',
      name: 'Twenty-four hours',
      sessions: [
        {
          type: 'practice',
          name: 'Practice',
          minutes: 180,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Qualifying',
          minutes: 120,
          day: 1,
        },
        {
          id: 'race',
          type: 'race',
          name: '24 Hours',
          laps: 670,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'twenty-four-hours',
  rounds: [
    {
      id: 'event',
      name: '24 Hours of Le Mans 1969',
      track: recommendedTrack('le-mans/no-chicanes'),
      sessionLengths: [
        {
          session: 'race',
          laps: 382,
        },
      ],
      climate: Climate.TEMPERATE,
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
    aggression: -5,
  },
  generatedWeather: {
    climate: Climate.MEDITERRANEAN,
  },
  regulations: {
    assists: {
      tyreWear: 1,
      fuelRate: 1,
      tyreBlankets: false,
    },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 4500,
  prizes: {
    positions: [45000, 29000, 19000, 13500, 10000, 7000],
  },
};
