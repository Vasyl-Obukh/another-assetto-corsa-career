import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Turkish Grand Prix 2005, as a historic event of its own.
 */
export const TURKISH_GP_2005: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'turkish-gp-2005',
  name: 'Turkish Grand Prix 2005',
  description: 'Istanbul Park\'s first Grand Prix, and the first time anyone took Turn 8 flat out in anger.',
  teams: [
    team('renault', 'Mild Seven Renault F1 Team', 'FRA', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('toyota', 'Panasonic Toyota Racing', 'JPN', TeamBudget.WORKS),
    team('williams', 'BMW WilliamsF1 Team', 'GBR', TeamBudget.WORKS),
    team('bar', 'Lucky Strike BAR Honda', 'GBR', TeamBudget.WORKS),
    team('red-bull', 'Red Bull Racing', 'AUT', TeamBudget.INDEPENDENT),
    team('sauber', 'Sauber Petronas', 'CHE', TeamBudget.INDEPENDENT),
    team('jordan', 'Jordan Toyota', 'IRL', TeamBudget.PRIVATEER),
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
        seat('renault-alonso', 'renault', 'Fernando Alonso', 'ESP'),
        seat('mclaren-raikkonen', 'mclaren', 'Kimi Räikkönen', 'FIN'),
        seat('ferrari-schumacher', 'ferrari', 'Michael Schumacher', 'DEU'),
        seat('mclaren-montoya', 'mclaren', 'Juan Pablo Montoya', 'COL'),
        seat('renault-fisichella', 'renault', 'Giancarlo Fisichella', 'ITA'),
        seat('toyota-schumacher', 'toyota', 'Ralf Schumacher', 'DEU'),
        seat('toyota-trulli', 'toyota', 'Jarno Trulli', 'ITA'),
        seat('ferrari-barrichello', 'ferrari', 'Rubens Barrichello', 'BRA'),
        seat('bar-button', 'bar', 'Jenson Button', 'GBR'),
        seat('williams-webber', 'williams', 'Mark Webber', 'AUS'),
        seat('williams-heidfeld', 'williams', 'Nick Heidfeld', 'DEU'),
        seat('red-bull-coulthard', 'red-bull', 'David Coulthard', 'GBR'),
        seat('sauber-massa', 'sauber', 'Felipe Massa', 'BRA'),
        seat('sauber-villeneuve', 'sauber', 'Jacques Villeneuve', 'CAN'),
        seat('bar-sato', 'bar', 'Takuma Sato', 'JPN'),
        seat('red-bull-klien', 'red-bull', 'Christian Klien', 'AUT'),
        seat('jordan-monteiro', 'jordan', 'Tiago Monteiro', 'PRT'),
        seat('jordan-karthikeyan', 'jordan', 'Narain Karthikeyan', 'IND'),
        seat('minardi-albers', 'minardi', 'Christijan Albers', 'NLD'),
        seat('minardi-friesacher', 'minardi', 'Patrick Friesacher', 'AUT'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_2005,
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
      name: 'Turkish Grand Prix 2005',
      track: {
        id: 'rj_istanbul_park',
        layout: 'layout_f1_2005',
      },
      climate: Climate.MEDITERRANEAN,
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
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
  },
};
