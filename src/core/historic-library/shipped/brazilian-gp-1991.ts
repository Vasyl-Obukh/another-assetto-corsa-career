import { CarSpec, Climate, Discipline, Hemisphere, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Brazilian Grand Prix 1991, as a historic event of its own.
 */
export const BRAZILIAN_GP_1991: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'brazilian-gp-1991',
  name: 'Brazilian Grand Prix 1991',
  description: {
    en: 'Senna\'s first win at home, the last laps driven stuck in sixth gear.',
    uk: 'Перша перемога Сенни вдома - останні кола він проїхав, застрягши на шостій передачі.',
  },
  teams: [
    team('mclaren', 'Honda Marlboro McLaren', 'GBR', TeamBudget.WORKS),
    team('williams', 'Canon Williams Team', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('benetton', 'Camel Benetton Ford', 'GBR', TeamBudget.WORKS),
    team('tyrrell', 'Braun Tyrrell Honda', 'GBR', TeamBudget.INDEPENDENT),
    team('jordan', 'Team 7UP Jordan', 'IRL', TeamBudget.INDEPENDENT),
    team('dallara', 'BMS Scuderia Italia', 'ITA', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Team', 'ITA', TeamBudget.PRIVATEER),
    team('lotus', 'Team Lotus', 'GBR', TeamBudget.INDEPENDENT),
    team('larrousse', 'Larrousse F1', 'FRA', TeamBudget.PRIVATEER),
    team('leyton-house', 'Leyton House Racing', 'GBR', TeamBudget.PRIVATEER),
    team('brabham', 'Motor Racing Developments', 'GBR', TeamBudget.PRIVATEER),
    team('ligier', 'Ligier Gitanes', 'FRA', TeamBudget.INDEPENDENT),
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
        seat('williams-mansell', 'williams', 'Nigel Mansell', 'GBR'),
        seat('williams-patrese', 'williams', 'Riccardo Patrese', 'ITA'),
        seat('mclaren-berger', 'mclaren', 'Gerhard Berger', 'AUT'),
        seat('ferrari-prost', 'ferrari', 'Alain Prost', 'FRA'),
        seat('benetton-piquet', 'benetton', 'Nelson Piquet', 'BRA'),
        seat('ferrari-alesi', 'ferrari', 'Jean Alesi', 'FRA'),
        seat('tyrrell-modena', 'tyrrell', 'Stefano Modena', 'ITA'),
        seat('jordan-cesaris', 'jordan', 'Andrea de Cesaris', 'ITA'),
        seat('benetton-moreno', 'benetton', 'Roberto Moreno', 'BRA'),
        seat('jordan-gachot', 'jordan', 'Bertrand Gachot', 'BEL'),
        seat('dallara-lehto', 'dallara', 'JJ Lehto', 'FIN'),
        seat('minardi-martini', 'minardi', 'Pierluigi Martini', 'ITA'),
        seat('tyrrell-nakajima', 'tyrrell', 'Satoru Nakajima', 'JPN'),
        seat('lotus-hakkinen', 'lotus', 'Mika Häkkinen', 'FIN'),
        seat('larrousse-suzuki', 'larrousse', 'Aguri Suzuki', 'JPN'),
        seat('larrousse-bernard', 'larrousse', 'Éric Bernard', 'FRA'),
        seat('dallara-pirro', 'dallara', 'Emanuele Pirro', 'ITA'),
        seat('minardi-morbidelli', 'minardi', 'Gianni Morbidelli', 'ITA'),
        seat('leyton-house-capelli', 'leyton-house', 'Ivan Capelli', 'ITA'),
        seat('leyton-house-gugelmin', 'leyton-house', 'Maurício Gugelmin', 'BRA'),
        seat('brabham-brundle', 'brabham', 'Martin Brundle', 'GBR'),
        seat('brabham-blundell', 'brabham', 'Mark Blundell', 'GBR'),
        seat('ligier-boutsen', 'ligier', 'Thierry Boutsen', 'BEL'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1991,
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
      name: 'Brazilian Grand Prix 1991',
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
    strength: 5,
    aggression: 10,
  },
  generatedWeather: {
    climate: Climate.MEDITERRANEAN,
  },
  regulations: {
    assists: {
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
