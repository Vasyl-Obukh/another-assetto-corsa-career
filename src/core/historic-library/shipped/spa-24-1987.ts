import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Spa 24 Hours 1987, as a historic event of its own.
 */
export const SPA_24_1987: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'spa-24-1987',
  name: 'Spa 24 Hours 1987',
  description: {
    en: 'Group A saloons through a day and a night in the Ardennes.',
    uk: 'Седани Групи A крізь день і ніч в Арденнах.',
  },
  teams: [
    team('schwaben', 'Schwaben Tourenwagen', 'DEU', TeamBudget.WORKS),
    team('bologna', 'Squadra Petronio', 'ITA', TeamBudget.WORKS),
    team('linz', 'Donau Motorsport', 'AUT', TeamBudget.INDEPENDENT),
    team('ardennes', 'Écurie Francorchamps', 'BEL', TeamBudget.INDEPENDENT),
    team('castilla', 'Castilla Competición', 'ESP', TeamBudget.PRIVATEER),
    team('brands', 'Kentish Saloon Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'division-2',
      name: 'Division 2',
      ladder: {
        discipline: Discipline.TOURING,
        tier: 3,
      },
      seats: [
        seat('sch-1', 'schwaben', 'Albrecht Heigl', 'DEU'),
        seat('sch-2', 'schwaben', 'Wolfgang Kutscher', 'DEU'),
        seat('sch-3', 'schwaben', 'Rainer Lüttgens', 'DEU'),
        seat('bol-1', 'bologna', 'Roberto Castagnoli', 'ITA'),
        seat('bol-2', 'bologna', 'Emanuele Bottazzi', 'ITA'),
        seat('bol-3', 'bologna', 'Gianfranco Brancaleoni', 'ITA'),
        seat('lin-1', 'linz', 'Franz Haslinger', 'AUT'),
        seat('lin-2', 'linz', 'Gerold Pichlmayr', 'AUT'),
        seat('ard-1', 'ardennes', 'Eric Van Damme', 'BEL'),
        seat('ard-2', 'ardennes', 'Didier Lambrechts', 'BEL'),
        seat('cas-1', 'castilla', 'Luis Pérez-Sanz', 'ESP'),
        seat('cas-2', 'castilla', 'Carlos Villalobos', 'ESP'),
        seat('bra-1', 'brands', 'Gordon Pettifer', 'GBR'),
        seat('bra-2', 'brands', 'Ian Kilbride', 'GBR'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['bmw_m3_e30_gra'],
      },
    },
  ],
  eventFormats: [
    {
      id: 'spa-24',
      name: '24 Hours',
      sessions: [
        {
          type: 'practice',
          name: 'Free practice',
          minutes: 120,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Qualifying',
          minutes: 60,
          day: 1,
        },
        {
          id: 'race',
          type: 'race',
          name: '24 Hours',
          laps: 481,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'spa-24',
  rounds: [
    {
      id: 'event',
      name: 'Spa 24 Hours 1987',
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
    aggression: 10,
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
  entryFee: 1400,
  prizes: {
    positions: [14000, 9500, 7000, 5200, 4000, 3000, 2200, 1600, 1100, 600],
  },
};
