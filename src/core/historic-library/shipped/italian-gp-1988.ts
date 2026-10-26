import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Italian Grand Prix 1988, as a historic event of its own.
 */
export const ITALIAN_GP_1988: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'italian-gp-1988',
  name: 'Italian Grand Prix 1988',
  description: 'The only race McLaren lost all year: a Ferrari one-two at Monza, a month after Enzo Ferrari died.',
  teams: [
    team('mclaren', 'Honda Marlboro McLaren', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('benetton', 'Benetton Formula', 'GBR', TeamBudget.WORKS),
    team('lotus', 'Camel Team Lotus Honda', 'GBR', TeamBudget.WORKS),
    team('march', 'Leyton House March Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('arrows', 'USF&G Arrows Megatron', 'GBR', TeamBudget.INDEPENDENT),
    team('williams', 'Canon Williams Team', 'GBR', TeamBudget.INDEPENDENT),
    team('tyrrell', 'Tyrrell Racing Organisation', 'GBR', TeamBudget.PRIVATEER),
    team('rial', 'Rial Racing', 'DEU', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Team', 'ITA', TeamBudget.PRIVATEER),
    team('larrousse', 'Larrousse Calmels', 'FRA', TeamBudget.PRIVATEER),
    team('dallara', 'BMS Scuderia Italia', 'ITA', TeamBudget.PRIVATEER),
    team('ags', 'Automobiles Gonfaronnaises Sportives', 'FRA', TeamBudget.PRIVATEER),
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
        seat('mclaren-senna', 'mclaren', 'Ayrton Senna', 'BRA'),
        seat('mclaren-prost', 'mclaren', 'Alain Prost', 'FRA'),
        seat('ferrari-berger', 'ferrari', 'Gerhard Berger', 'AUT'),
        seat('benetton-boutsen', 'benetton', 'Thierry Boutsen', 'BEL'),
        seat('ferrari-alboreto', 'ferrari', 'Michele Alboreto', 'ITA'),
        seat('lotus-piquet', 'lotus', 'Nelson Piquet', 'BRA'),
        seat('march-capelli', 'march', 'Ivan Capelli', 'ITA'),
        seat('arrows-warwick', 'arrows', 'Derek Warwick', 'GBR'),
        seat('benetton-nannini', 'benetton', 'Alessandro Nannini', 'ITA'),
        seat('williams-patrese', 'williams', 'Riccardo Patrese', 'ITA'),
        seat('arrows-cheever', 'arrows', 'Eddie Cheever', 'USA'),
        seat('williams-mansell', 'williams', 'Nigel Mansell', 'GBR'),
        seat('march-gugelmin', 'march', 'Maurício Gugelmin', 'BRA'),
        seat('lotus-nakajima', 'lotus', 'Satoru Nakajima', 'JPN'),
        seat('tyrrell-palmer', 'tyrrell', 'Jonathan Palmer', 'GBR'),
        seat('rial-cesaris', 'rial', 'Andrea de Cesaris', 'ITA'),
        seat('minardi-martini', 'minardi', 'Pierluigi Martini', 'ITA'),
        seat('larrousse-alliot', 'larrousse', 'Philippe Alliot', 'FRA'),
        seat('dallara-caffi', 'dallara', 'Alex Caffi', 'ITA'),
        seat('ags-streiff', 'ags', 'Philippe Streiff', 'FRA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1988,
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
          minutes: 90,
          day: 0,
        },
        {
          type: 'practice',
          name: 'Saturday practice',
          minutes: 90,
          day: 1,
        },
        {
          type: 'qualify',
          name: 'Qualifying',
          minutes: 60,
          day: 1,
        },
        {
          id: 'grand-prix',
          type: 'race',
          name: 'Grand Prix',
          distance: 305,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'Italian Grand Prix 1988',
      track: {
        id: 'monza',
      },
      sessionLengths: [
        {
          session: 'grand-prix',
          laps: 51,
        },
      ],
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
      tyreBlankets: true,
    },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
  },
};
