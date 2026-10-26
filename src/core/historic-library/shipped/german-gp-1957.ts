import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * German Grand Prix 1957, as a historic event of its own.
 */
export const GERMAN_GP_1957: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'german-gp-1957',
  name: 'German Grand Prix 1957',
  description: 'Fangio\'s greatest drive: nearly a minute lost at his pit stop, then the lap record broken again and again to catch the Ferraris on the Nordschleife.',
  teams: [
    team('maserati', 'Officine Alfieri Maserati', 'ITA', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('vanwall', 'Vandervell Products', 'GBR', TeamBudget.WORKS),
    team('cooper', 'Cooper Car Company', 'GBR', TeamBudget.INDEPENDENT),
    team('centro-sud', 'Scuderia Centro Sud', 'ITA', TeamBudget.PRIVATEER),
    team('bonnier', 'Joakim Bonnier', 'SWE', TeamBudget.PRIVATEER),
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
        seat('mas-fangio', 'maserati', 'Juan Manuel Fangio', 'ARG'),
        seat('van-moss', 'vanwall', 'Stirling Moss', 'GBR'),
        seat('fer-musso', 'ferrari', 'Luigi Musso', 'ITA'),
        seat('fer-hawthorn', 'ferrari', 'Mike Hawthorn', 'GBR'),
        seat('van-brooks', 'vanwall', 'Tony Brooks', 'GBR'),
        seat('cen-gregory', 'centro-sud', 'Masten Gregory', 'USA'),
        seat('mas-behra', 'maserati', 'Jean Behra', 'FRA'),
        seat('mas-schell', 'maserati', 'Harry Schell', 'USA'),
        seat('fer-collins', 'ferrari', 'Peter Collins', 'GBR'),
        seat('van-lewis-evans', 'vanwall', 'Stuart Lewis-Evans', 'GBR'),
        seat('fer-trintignant', 'ferrari', 'Maurice Trintignant', 'FRA'),
        seat('mas-menditeguy', 'maserati', 'Carlos Menditéguy', 'ARG'),
        seat('mas-scarlatti', 'maserati', 'Giorgio Scarlatti', 'ITA'),
        seat('coo-brabham', 'cooper', 'Jack Brabham', 'AUS'),
        seat('coo-salvadori', 'cooper', 'Roy Salvadori', 'GBR'),
        seat('bon-bonnier', 'bonnier', 'Jo Bonnier', 'SWE'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1957,
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
          name: 'Practice',
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
          distance: 458,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'German Grand Prix 1957',
      track: {
        id: 'ks_nordschleife',
        layout: 'nordschleife',
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
  entryFee: 3600,
  prizes: {
    positions: [36000, 23000, 15500, 10500, 7500],
  },
};
