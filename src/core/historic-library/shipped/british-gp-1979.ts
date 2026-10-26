import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * British Grand Prix 1979, as a historic event of its own.
 */
export const BRITISH_GP_1979: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'british-gp-1979',
  name: 'British Grand Prix 1979',
  description: 'Silverstone, and Clay Regazzoni\'s win - the first ever for Williams.',
  teams: [
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('williams', 'Albilad-Saudia Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('ligier', 'Équipe Ligier Gitanes', 'FRA', TeamBudget.WORKS),
    team('lotus', 'Martini Racing Team Lotus', 'GBR', TeamBudget.WORKS),
    team('renault', 'Équipe Renault Elf', 'FRA', TeamBudget.WORKS),
    team('mclaren', 'Löwenbräu Team McLaren', 'GBR', TeamBudget.WORKS),
    team('tyrrell', 'Team Tyrrell', 'GBR', TeamBudget.INDEPENDENT),
    team('arrows', 'Warsteiner Arrows Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('brabham', 'Parmalat Racing Team', 'GBR', TeamBudget.WORKS),
    team('fittipaldi', 'Fittipaldi Automotive', 'BRA', TeamBudget.PRIVATEER),
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
        seat('ferrari-scheckter', 'ferrari', 'Jody Scheckter', 'ZAF'),
        seat('ferrari-villeneuve', 'ferrari', 'Gilles Villeneuve', 'CAN'),
        seat('williams-jones', 'williams', 'Alan Jones', 'AUS'),
        seat('ligier-laffite', 'ligier', 'Jacques Laffite', 'FRA'),
        seat('williams-regazzoni', 'williams', 'Clay Regazzoni', 'CHE'),
        seat('ligier-depailler', 'ligier', 'Patrick Depailler', 'FRA'),
        seat('lotus-reutemann', 'lotus', 'Carlos Reutemann', 'ARG'),
        seat('renault-arnoux', 'renault', 'René Arnoux', 'FRA'),
        seat('mclaren-watson', 'mclaren', 'John Watson', 'GBR'),
        seat('tyrrell-pironi', 'tyrrell', 'Didier Pironi', 'FRA'),
        seat('tyrrell-jarier', 'tyrrell', 'Jean-Pierre Jarier', 'FRA'),
        seat('lotus-andretti', 'lotus', 'Mario Andretti', 'USA'),
        seat('renault-jabouille', 'renault', 'Jean-Pierre Jabouille', 'FRA'),
        seat('arrows-patrese', 'arrows', 'Riccardo Patrese', 'ITA'),
        seat('fittipaldi-fittipaldi', 'fittipaldi', 'Emerson Fittipaldi', 'BRA'),
        seat('brabham-lauda', 'brabham', 'Niki Lauda', 'AUT'),
        seat('brabham-piquet', 'brabham', 'Nelson Piquet', 'BRA'),
        seat('mclaren-tambay', 'mclaren', 'Patrick Tambay', 'FRA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1979,
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
      name: 'British Grand Prix 1979',
      track: {
        id: 'ks_silverstone1967',
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
