import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Italian Grand Prix 1971, as a historic event of its own.
 */
export const ITALIAN_GP_1971: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'italian-gp-1971',
  name: 'Italian Grand Prix 1971',
  description: {
    en: 'Monza without chicanes, and the closest finish there has ever been: five cars across the line inside two tenths of a second.',
    uk: 'Монца без шикан і найщільніший фініш в історії: п\'ять машин перетнули лінію в межах двох '
      + 'десятих секунди.',
  },
  teams: [
    team('tyrrell', 'Elf Team Tyrrell', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('brm', 'Yardley Team BRM', 'GBR', TeamBudget.WORKS),
    team('lotus', 'Gold Leaf Team Lotus', 'GBR', TeamBudget.WORKS),
    team('march', 'STP March Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('mclaren', 'Bruce McLaren Motor Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('matra', 'Équipe Matra Sports', 'FRA', TeamBudget.WORKS),
    team('brabham', 'Motor Racing Developments', 'GBR', TeamBudget.INDEPENDENT),
    team('surtees', 'Team Surtees', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: {
        discipline: Discipline.SINGLE_SEATER,
        tier: 1,
      },
      seats: [
        seat('tyrrell-stewart', 'tyrrell', 'Jackie Stewart', 'GBR'),
        seat('march-peterson', 'march', 'Ronnie Peterson', 'SWE'),
        seat('tyrrell-cevert', 'tyrrell', 'François Cevert', 'FRA'),
        seat('ferrari-ickx', 'ferrari', 'Jacky Ickx', 'BEL'),
        seat('brm-siffert', 'brm', 'Jo Siffert', 'CHE'),
        seat('lotus-fittipaldi', 'lotus', 'Emerson Fittipaldi', 'BRA'),
        seat('ferrari-regazzoni', 'ferrari', 'Clay Regazzoni', 'CHE'),
        seat('matra-amon', 'matra', 'Chris Amon', 'NZL'),
        seat('mclaren-hulme', 'mclaren', 'Denny Hulme', 'NZL'),
        seat('brm-gethin', 'brm', 'Peter Gethin', 'GBR'),
        seat('brm-rodriguez', 'brm', 'Pedro Rodríguez', 'MEX'),
        seat('lotus-wisell', 'lotus', 'Reine Wisell', 'SWE'),
        seat('surtees-surtees', 'surtees', 'John Surtees', 'GBR'),
        seat('matra-beltoise', 'matra', 'Jean-Pierre Beltoise', 'FRA'),
        seat('brabham-schenken', 'brabham', 'Tim Schenken', 'AUS'),
        seat('brm-ganley', 'brm', 'Howden Ganley', 'NZL'),
        seat('brabham-hill', 'brabham', 'Graham Hill', 'GBR'),
        seat('surtees-stommelen', 'surtees', 'Rolf Stommelen', 'DEU'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1971,
      },
    },
  ],
  eventFormats: [
    {
      id: 'grand-prix',
      name: 'Grand Prix',
      sessions: [
        {
          type: 'practice',
          name: 'Friday practice',
          minutes: 120,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Timed practice',
          minutes: 120,
          day: 1,
        },
        {
          id: 'grand-prix',
          type: 'race',
          name: 'Grand Prix',
          distance: 318,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'Italian Grand Prix 1971',
      track: {
        id: 'ks_monza66',
        layout: 'road',
      },
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
  entryFee: 5000,
  prizes: {
    positions: [50000, 32000, 21000, 15000, 11000, 8000],
  },
};
