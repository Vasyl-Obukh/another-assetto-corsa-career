import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * British Grand Prix 1970, as a historic event of its own.
 */
export const BRITISH_GP_1970: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'british-gp-1970',
  name: 'British Grand Prix 1970',
  description: 'Brands Hatch, Rindt\'s Lotus 72 against Brabham, settled on the very last lap.',
  teams: [
    team('lotus', 'Gold Leaf Team Lotus', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'Bruce McLaren Motor Racing', 'GBR', TeamBudget.WORKS),
    team('brabham', 'Motor Racing Developments', 'GBR', TeamBudget.WORKS),
    team('tyrrell', 'Tyrrell Racing Organisation', 'GBR', TeamBudget.INDEPENDENT),
    team('brm', 'Yardley Team BRM', 'GBR', TeamBudget.WORKS),
    team('march', 'March Engineering', 'GBR', TeamBudget.WORKS),
    team('matra', 'Équipe Matra Elf', 'FRA', TeamBudget.WORKS),
    team('surtees', 'Team Surtees', 'GBR', TeamBudget.PRIVATEER),
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
        seat('lotus-rindt', 'lotus', 'Jochen Rindt', 'AUT'),
        seat('ferrari-ickx', 'ferrari', 'Jacky Ickx', 'BEL'),
        seat('ferrari-regazzoni', 'ferrari', 'Clay Regazzoni', 'CHE'),
        seat('mclaren-hulme', 'mclaren', 'Denny Hulme', 'NZL'),
        seat('brabham-brabham', 'brabham', 'Jack Brabham', 'AUS'),
        seat('tyrrell-stewart', 'tyrrell', 'Jackie Stewart', 'GBR'),
        seat('brm-rodriguez', 'brm', 'Pedro Rodríguez', 'MEX'),
        seat('march-amon', 'march', 'Chris Amon', 'NZL'),
        seat('matra-beltoise', 'matra', 'Jean-Pierre Beltoise', 'FRA'),
        seat('lotus-fittipaldi', 'lotus', 'Emerson Fittipaldi', 'BRA'),
        seat('matra-pescarolo', 'matra', 'Henri Pescarolo', 'FRA'),
        seat('surtees-surtees', 'surtees', 'John Surtees', 'GBR'),
        seat('brm-oliver', 'brm', 'Jackie Oliver', 'GBR'),
        seat('walker-hill', 'walker', 'Graham Hill', 'GBR'),
        seat('brabham-stommelen', 'brabham', 'Rolf Stommelen', 'DEU'),
        seat('tyrrell-cevert', 'tyrrell', 'François Cevert', 'FRA'),
        seat('march-siffert', 'march', 'Jo Siffert', 'CHE'),
        seat('lotus-miles', 'lotus', 'John Miles', 'GBR'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1970,
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
          distance: 393,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'British Grand Prix 1970',
      track: {
        id: 'ks_brands_hatch',
        layout: 'gp',
      },
      sessionLengths: [
        {
          session: 'grand-prix',
          laps: 87,
        },
      ],
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
    strength: 5,
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
  entryFee: 10000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
  },
};
