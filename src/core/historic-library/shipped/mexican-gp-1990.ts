import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Mexican Grand Prix 1990, as a historic event of its own.
 */
export const MEXICAN_GP_1990: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'mexican-gp-1990',
  name: 'Mexican Grand Prix 1990',
  description: {
    en: 'Prost from thirteenth on the grid to the win, round the bumps of the Peraltada.',
    uk: 'Прост пройшов від тринадцятого місця на старті до перемоги - через вибоїни Пералтади.',
  },
  teams: [
    team('mclaren', 'Honda Marlboro McLaren', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('benetton', 'Benetton Formula', 'GBR', TeamBudget.WORKS),
    team('williams', 'Canon Williams Team', 'GBR', TeamBudget.WORKS),
    team('tyrrell', 'Tyrrell Racing Organisation', 'GBR', TeamBudget.INDEPENDENT),
    team('leyton-house', 'Leyton House Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('larrousse', 'Espo Larrousse F1', 'FRA', TeamBudget.PRIVATEER),
    team('brabham', 'Motor Racing Developments', 'GBR', TeamBudget.PRIVATEER),
    team('lotus', 'Camel Team Lotus', 'GBR', TeamBudget.INDEPENDENT),
    team('dallara', 'BMS Scuderia Italia', 'ITA', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Team', 'ITA', TeamBudget.PRIVATEER),
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
        seat('ferrari-prost', 'ferrari', 'Alain Prost', 'FRA'),
        seat('benetton-piquet', 'benetton', 'Nelson Piquet', 'BRA'),
        seat('mclaren-berger', 'mclaren', 'Gerhard Berger', 'AUT'),
        seat('ferrari-mansell', 'ferrari', 'Nigel Mansell', 'GBR'),
        seat('williams-boutsen', 'williams', 'Thierry Boutsen', 'BEL'),
        seat('williams-patrese', 'williams', 'Riccardo Patrese', 'ITA'),
        seat('benetton-nannini', 'benetton', 'Alessandro Nannini', 'ITA'),
        seat('tyrrell-alesi', 'tyrrell', 'Jean Alesi', 'FRA'),
        seat('leyton-house-capelli', 'leyton-house', 'Ivan Capelli', 'ITA'),
        seat('larrousse-suzuki', 'larrousse', 'Aguri Suzuki', 'JPN'),
        seat('larrousse-bernard', 'larrousse', 'Éric Bernard', 'FRA'),
        seat('tyrrell-nakajima', 'tyrrell', 'Satoru Nakajima', 'JPN'),
        seat('brabham-modena', 'brabham', 'Stefano Modena', 'ITA'),
        seat('lotus-warwick', 'lotus', 'Derek Warwick', 'GBR'),
        seat('leyton-house-gugelmin', 'leyton-house', 'Maurício Gugelmin', 'BRA'),
        seat('lotus-donnelly', 'lotus', 'Martin Donnelly', 'GBR'),
        seat('dallara-cesaris', 'dallara', 'Andrea de Cesaris', 'ITA'),
        seat('dallara-pirro', 'dallara', 'Emanuele Pirro', 'ITA'),
        seat('minardi-martini', 'minardi', 'Pierluigi Martini', 'ITA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1990,
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
      name: 'Mexican Grand Prix 1990',
      track: {
        id: 'vrc_mexico',
        layout: 'fa_layout',
      },
      sessionLengths: [
        {
          session: 'grand-prix',
          laps: 71,
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
