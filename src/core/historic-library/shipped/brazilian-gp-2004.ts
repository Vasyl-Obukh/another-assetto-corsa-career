import { CarSpec, Climate, Discipline, Hemisphere, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Brazilian Grand Prix 2004, as a historic event of its own.
 */
export const BRAZILIAN_GP_2004: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'brazilian-gp-2004',
  name: 'Brazilian Grand Prix 2004',
  description: 'The season\'s end at Interlagos on a damp track, and Montoya\'s last win for Williams.',
  teams: [
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('bar', 'Lucky Strike BAR Honda', 'GBR', TeamBudget.WORKS),
    team('renault', 'Mild Seven Renault F1 Team', 'FRA', TeamBudget.WORKS),
    team('williams', 'BMW WilliamsF1 Team', 'GBR', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('sauber', 'Sauber Petronas', 'CHE', TeamBudget.INDEPENDENT),
    team('jaguar', 'Jaguar Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('toyota', 'Panasonic Toyota Racing', 'JPN', TeamBudget.WORKS),
    team('jordan', 'Jordan Ford', 'IRL', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Cosworth', 'ITA', TeamBudget.PRIVATEER),
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
        seat('fer-schumacher', 'ferrari', 'Michael Schumacher', 'DEU'),
        seat('fer-barrichello', 'ferrari', 'Rubens Barrichello', 'BRA'),
        seat('bar-button', 'bar', 'Jenson Button', 'GBR'),
        seat('ren-alonso', 'renault', 'Fernando Alonso', 'ESP'),
        seat('wil-montoya', 'williams', 'Juan Pablo Montoya', 'COL'),
        seat('ren-trulli', 'renault', 'Jarno Trulli', 'ITA'),
        seat('mcl-raikkonen', 'mclaren', 'Kimi Räikkönen', 'FIN'),
        seat('bar-sato', 'bar', 'Takuma Sato', 'JPN'),
        seat('wil-schumacher', 'williams', 'Ralf Schumacher', 'DEU'),
        seat('mcl-coulthard', 'mclaren', 'David Coulthard', 'GBR'),
        seat('sau-fisichella', 'sauber', 'Giancarlo Fisichella', 'ITA'),
        seat('sau-massa', 'sauber', 'Felipe Massa', 'BRA'),
        seat('jag-webber', 'jaguar', 'Mark Webber', 'AUS'),
        seat('toy-panis', 'toyota', 'Olivier Panis', 'FRA'),
        seat('toy-da-matta', 'toyota', 'Cristiano da Matta', 'BRA'),
        seat('jag-klien', 'jaguar', 'Christian Klien', 'AUT'),
        seat('jor-heidfeld', 'jordan', 'Nick Heidfeld', 'DEU'),
        seat('jor-pantano', 'jordan', 'Giorgio Pantano', 'ITA'),
        seat('min-baumgartner', 'minardi', 'Zsolt Baumgartner', 'HUN'),
        seat('min-bruni', 'minardi', 'Gianmaria Bruni', 'ITA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_2004,
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
          name: 'Free practice 1',
          minutes: 60,
          day: 0,
        },
        {
          type: 'practice',
          name: 'Free practice 2',
          minutes: 60,
          day: 0,
        },
        {
          type: 'practice',
          name: 'Free practice 3',
          minutes: 45,
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
      name: 'Brazilian Grand Prix 2004',
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
    aggression: 5,
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
  prizes: {
    positions: [90000, 60000, 42000, 30000, 22000, 16000, 12000, 8000],
  },
};
