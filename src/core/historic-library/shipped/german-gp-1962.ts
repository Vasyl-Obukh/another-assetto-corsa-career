import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * German Grand Prix 1962, as a historic event of its own.
 */
export const GERMAN_GP_1962: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'german-gp-1962',
  name: 'German Grand Prix 1962',
  description: 'A wet Nordschleife, with Hill, Surtees and Gurney covered by seconds after more than two hours.',
  teams: [
    team('lotus', 'Team Lotus', 'GBR', TeamBudget.WORKS),
    team('brm', 'Owen Racing Organisation', 'GBR', TeamBudget.WORKS),
    team('cooper', 'Cooper Car Company', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('porsche', 'Porsche System Engineering', 'DEU', TeamBudget.WORKS),
    team('brabham', 'Brabham Racing Organisation', 'GBR', TeamBudget.INDEPENDENT),
    team('bowmaker', 'Bowmaker Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('udt', 'UDT Laystall Racing Team', 'GBR', TeamBudget.PRIVATEER),
    team('walker', 'Rob Walker Racing Team', 'GBR', TeamBudget.PRIVATEER),
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
        seat('brm-hill', 'brm', 'Graham Hill', 'GBR'),
        seat('lotus-clark', 'lotus', 'Jim Clark', 'GBR'),
        seat('cooper-mclaren', 'cooper', 'Bruce McLaren', 'NZL'),
        seat('bowmaker-surtees', 'bowmaker', 'John Surtees', 'GBR'),
        seat('porsche-gurney', 'porsche', 'Dan Gurney', 'USA'),
        seat('ferrari-hill', 'ferrari', 'Phil Hill', 'USA'),
        seat('brabham-brabham', 'brabham', 'Jack Brabham', 'AUS'),
        seat('brm-ginther', 'brm', 'Richie Ginther', 'USA'),
        seat('porsche-bonnier', 'porsche', 'Jo Bonnier', 'SWE'),
        seat('cooper-maggs', 'cooper', 'Tony Maggs', 'ZAF'),
        seat('udt-ireland', 'udt', 'Innes Ireland', 'GBR'),
        seat('lotus-taylor', 'lotus', 'Trevor Taylor', 'GBR'),
        seat('ferrari-baghetti', 'ferrari', 'Giancarlo Baghetti', 'ITA'),
        seat('ferrari-rodriguez', 'ferrari', 'Ricardo Rodríguez', 'MEX'),
        seat('ferrari-bandini', 'ferrari', 'Lorenzo Bandini', 'ITA'),
        seat('bowmaker-salvadori', 'bowmaker', 'Roy Salvadori', 'GBR'),
        seat('udt-gregory', 'udt', 'Masten Gregory', 'USA'),
        seat('walker-trintignant', 'walker', 'Maurice Trintignant', 'FRA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1962,
        minModels: 1,
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
          distance: 395,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'German Grand Prix 1962',
      track: {
        id: 'ks_nordschleife',
        layout: 'nordschleife',
      },
      sessionLengths: [
        {
          session: 'grand-prix',
          laps: 15,
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
    strength: 4,
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
  entryFee: 4000,
  prizes: {
    positions: [40000, 26000, 17000, 12000, 9000, 6000],
  },
};
