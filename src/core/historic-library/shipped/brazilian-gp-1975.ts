import { CarSpec, Climate, Discipline, Hemisphere, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Brazilian Grand Prix 1975, as a historic event of its own.
 */
export const BRAZILIAN_GP_1975: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'brazilian-gp-1975',
  name: 'Brazilian Grand Prix 1975',
  description: 'Interlagos, and Carlos Pace\'s only Grand Prix win, in front of his home crowd.',
  teams: [
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'Marlboro Team Texaco', 'GBR', TeamBudget.WORKS),
    team('brabham', 'Martini Racing', 'GBR', TeamBudget.WORKS),
    team('hesketh', 'Hesketh Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('tyrrell', 'Elf Team Tyrrell', 'GBR', TeamBudget.WORKS),
    team('lotus', 'John Player Team Lotus', 'GBR', TeamBudget.WORKS),
    team('shadow', 'UOP Shadow Racing Team', 'USA', TeamBudget.INDEPENDENT),
    team('march', 'Lavazza March', 'GBR', TeamBudget.INDEPENDENT),
    team('williams', 'Frank Williams Racing Cars', 'GBR', TeamBudget.PRIVATEER),
    team('hill', 'Embassy Racing with Graham Hill', 'GBR', TeamBudget.PRIVATEER),
    team('penske', 'Penske Cars', 'USA', TeamBudget.INDEPENDENT),
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
        seat('ferrari-lauda', 'ferrari', 'Niki Lauda', 'AUT'),
        seat('mclaren-fittipaldi', 'mclaren', 'Emerson Fittipaldi', 'BRA'),
        seat('brabham-reutemann', 'brabham', 'Carlos Reutemann', 'ARG'),
        seat('hesketh-hunt', 'hesketh', 'James Hunt', 'GBR'),
        seat('ferrari-regazzoni', 'ferrari', 'Clay Regazzoni', 'CHE'),
        seat('brabham-pace', 'brabham', 'Carlos Pace', 'BRA'),
        seat('tyrrell-scheckter', 'tyrrell', 'Jody Scheckter', 'ZAF'),
        seat('mclaren-mass', 'mclaren', 'Jochen Mass', 'DEU'),
        seat('lotus-peterson', 'lotus', 'Ronnie Peterson', 'SWE'),
        seat('march-brambilla', 'march', 'Vittorio Brambilla', 'ITA'),
        seat('williams-laffite', 'williams', 'Jacques Laffite', 'FRA'),
        seat('tyrrell-depailler', 'tyrrell', 'Patrick Depailler', 'FRA'),
        seat('shadow-pryce', 'shadow', 'Tom Pryce', 'GBR'),
        seat('shadow-jarier', 'shadow', 'Jean-Pierre Jarier', 'FRA'),
        seat('surtees-watson', 'surtees', 'John Watson', 'GBR'),
        seat('penske-donohue', 'penske', 'Mark Donohue', 'USA'),
        seat('hill-brise', 'hill', 'Tony Brise', 'GBR'),
        seat('march-lombardi', 'march', 'Lella Lombardi', 'ITA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1975,
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
          distance: 315,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'Brazilian Grand Prix 1975',
      track: {
        id: 'vhe_interlagos',
        layout: 'gp',
      },
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
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
  prizes: {
    positions: [55000, 35000, 23000, 16000, 12000, 8500],
  },
};
