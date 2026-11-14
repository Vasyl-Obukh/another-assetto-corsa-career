import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * 24 Hours of Daytona 1978, as a historic event of its own.
 */
export const DAYTONA_24_1978: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'daytona-24-1978',
  name: '24 Hours of Daytona 1978',
  description: {
    en: 'Group 5 silhouettes round the banking and the infield through the Florida night.',
    uk: 'Силуети Групи 5 на похилих віражах та в інфілді крізь флоридську ніч.',
  },
  teams: [
    team('kremer-78', 'Kölner Rennstall', 'DEU', TeamBudget.WORKS),
    team('loos-78', 'Gelo Sportwagen', 'DEU', TeamBudget.WORKS),
    team('jmsa', 'Ile-de-France Compétition', 'FRA', TeamBudget.INDEPENDENT),
    team('dick-barbour', 'Pacific Coast Racing', 'USA', TeamBudget.INDEPENDENT),
    team('jolly-club', 'Scuderia Monzese', 'ITA', TeamBudget.PRIVATEER),
    team('charles-ivey', 'Kent Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-5',
      name: 'Group 5',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 2,
      },
      seats: [
        seat('kol-1', 'kremer-78', 'Manfred Rösler', 'DEU'),
        seat('kol-2', 'kremer-78', 'Dieter Kasper', 'DEU'),
        seat('gel-1', 'loos-78', 'Klaus Niedermeier', 'DEU'),
        seat('gel-2', 'loos-78', 'Heinz-Otto Brandt', 'DEU'),
        seat('idf-1', 'jmsa', 'Claude Bardonnet', 'FRA'),
        seat('idf-2', 'jmsa', 'Bernard Darmon', 'FRA'),
        seat('pac-1', 'dick-barbour', 'Rick Hollister', 'USA'),
        seat('pac-2', 'dick-barbour', 'Gary Brandvold', 'USA'),
        seat('mon-1', 'jolly-club', 'Lella Castagna', 'ITA'),
        seat('mon-2', 'jolly-club', 'Martino Ferlini', 'ITA'),
        seat('ken-1', 'charles-ivey', 'Tony Hallam', 'GBR'),
        seat('ken-2', 'charles-ivey', 'Phil Ashwood', 'GBR'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['ks_porsche_935_78_moby_dick'],
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
          name: 'Free practice',
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
          laps: 734,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'twenty-four-hours',
  rounds: [
    {
      id: 'event',
      name: '24 Hours of Daytona 1978',
      track: {
        id: 'rt_daytona',
        layout: 'sportscar',
      },
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
    strength: 2,
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
  entryFee: 3500,
  prizes: {
    positions: [35000, 24500, 17500, 13300, 10150, 7700, 5600, 4200, 2800, 1750],
  },
};
