import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Road America 1973, as a historic event of its own.
 */
export const ROAD_AMERICA_1973: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'road-america-1973',
  name: 'Road America 1973',
  description: {
    en: 'Over a thousand horsepower and no rules to speak of: the Porsche 917/30 at the height of its power.',
    uk: 'Понад тисяча кінських сил і майже жодних правил: Porsche 917/30 на піку своєї могутності.',
  },
  teams: [
    team('reading', 'Brandywine Racing', 'USA', TeamBudget.WORKS),
    team('rinzler', 'Lakeshore Can-Am', 'USA', TeamBudget.INDEPENDENT),
    team('shadow-canam', 'Nightfall Racing', 'USA', TeamBudget.INDEPENDENT),
    team('mosport-racing', 'Ontario Group 7', 'CAN', TeamBudget.PRIVATEER),
    team('europe-canam', 'Interserie Racing', 'DEU', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-7',
      name: 'Group 7',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 1,
      },
      seats: [
        seat('bra-1', 'reading', 'Hank Lassiter', 'USA'),
        seat('bra-2', 'reading', 'Curt Wendover', 'USA'),
        seat('lak-1', 'rinzler', 'Dale Brockway', 'USA'),
        seat('lak-2', 'rinzler', 'Jim Halvorsen', 'USA'),
        seat('nig-1', 'shadow-canam', 'Vic Tamberlane', 'USA'),
        seat('nig-2', 'shadow-canam', 'Scooter Maddox', 'USA'),
        seat('ont-1', 'mosport-racing', 'Gord McAllister', 'CAN'),
        seat('ont-2', 'mosport-racing', 'Rene Lachance', 'CAN'),
        seat('int-1', 'europe-canam', 'Helmut Kressler', 'DEU'),
        seat('int-2', 'europe-canam', 'Willi Bauernhofer', 'DEU'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['ks_porsche_917_30'],
      },
    },
  ],
  eventFormats: [
    {
      id: 'road-america',
      name: '200 miles (Road America)',
      sessions: [
        {
          type: 'practice',
          name: 'Practice',
          minutes: 60,
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
          name: 'Race',
          laps: 50,
          day: 1,
        },
      ],
    },
  ],
  defaultEventFormat: 'road-america',
  rounds: [
    {
      id: 'event',
      name: 'Road America 1973',
      track: {
        id: 'lilski_road_america',
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
    strength: 4,
    aggression: 5,
  },
  generatedWeather: {
    climate: Climate.TEMPERATE,
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
  entryFee: 4000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
  },
};
