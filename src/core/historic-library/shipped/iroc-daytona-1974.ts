import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * IROC at Daytona 1974, as a historic event of its own.
 */
export const IROC_DAYTONA_1974: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'iroc-daytona-1974',
  name: 'IROC at Daytona 1974',
  description: {
    en: 'The best drivers of every discipline in identical Porsche Carrera RSRs, and no excuses.',
    uk: 'Найкращі пілоти всіх дисциплін в однакових Porsche Carrera RSR - і жодних виправдань.',
  },
  teams: [
    team('iroc', 'International Race of Champions', 'USA', TeamBudget.WORKS),
  ],
  entries: [
    {
      id: 'iroc',
      name: 'IROC',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 2,
      },
      seats: [
        seat('donohue', 'iroc', 'Mark Donohue', 'USA'),
        seat('follmer', 'iroc', 'George Follmer', 'USA'),
        seat('revson', 'iroc', 'Peter Revson', 'USA'),
        seat('unser', 'iroc', 'Bobby Unser', 'USA'),
        seat('foyt', 'iroc', 'A. J. Foyt', 'USA'),
        seat('hulme', 'iroc', 'Denny Hulme', 'NZL'),
        seat('fittipaldi', 'iroc', 'Emerson Fittipaldi', 'BRA'),
        seat('pearson', 'iroc', 'David Pearson', 'USA'),
        seat('petty', 'iroc', 'Richard Petty', 'USA'),
        seat('johncock', 'iroc', 'Gordon Johncock', 'USA'),
        seat('mccluskey', 'iroc', 'Roger McCluskey', 'USA'),
        seat('allison', 'iroc', 'Bobby Allison', 'USA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['ks_porsche_911_carrera_rsr'],
      },
    },
  ],
  eventFormats: [
    {
      id: 'daytona',
      name: 'One race',
      sessions: [
        {
          type: 'practice',
          name: 'Practice',
          minutes: 30,
          day: 0,
        },
        {
          type: 'race',
          name: 'Race 4',
          distance: 75,
          day: 0,
        },
      ],
    },
  ],
  defaultEventFormat: 'daytona',
  rounds: [
    {
      id: 'event',
      name: 'IROC at Daytona 1974',
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
    strength: 6,
    aggression: 15,
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
  entryFee: 3000,
  prizes: {
    positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
  },
};
