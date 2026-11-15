import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Malaysian Grand Prix 2000, as a historic event of its own.
 */
export const MALAYSIAN_GP_2000: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'malaysian-gp-2000',
  name: 'Malaysian Grand Prix 2000',
  description: {
    en: 'Sepang at the end of the season, Schumacher already champion and Ferrari chasing the constructors\' title.',
    uk: 'Сепанг наприкінці сезону: Шумахер уже чемпіон, а Ferrari б\'ється за Кубок конструкторів.',
  },
  teams: [
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('williams', 'BMW WilliamsF1 Team', 'GBR', TeamBudget.WORKS),
    team('benetton', 'Mild Seven Benetton Playlife', 'GBR', TeamBudget.INDEPENDENT),
    team('bar', 'Lucky Strike BAR Honda', 'GBR', TeamBudget.WORKS),
    team('jordan', 'Benson & Hedges Jordan', 'IRL', TeamBudget.INDEPENDENT),
    team('arrows', 'Arrows F1 Team', 'GBR', TeamBudget.PRIVATEER),
    team('sauber', 'Red Bull Sauber Petronas', 'CHE', TeamBudget.INDEPENDENT),
    team('jaguar', 'Jaguar Racing', 'GBR', TeamBudget.WORKS),
    team('minardi', 'Telefonica Minardi Fondmetal', 'ITA', TeamBudget.PRIVATEER),
    team('prost', 'Gauloises Prost Peugeot', 'FRA', TeamBudget.INDEPENDENT),
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
        seat('ferrari-schumacher', 'ferrari', 'Michael Schumacher', 'DEU'),
        seat('mclaren-hakkinen', 'mclaren', 'Mika Häkkinen', 'FIN'),
        seat('mclaren-coulthard', 'mclaren', 'David Coulthard', 'GBR'),
        seat('ferrari-barrichello', 'ferrari', 'Rubens Barrichello', 'BRA'),
        seat('williams-schumacher', 'williams', 'Ralf Schumacher', 'DEU'),
        seat('benetton-fisichella', 'benetton', 'Giancarlo Fisichella', 'ITA'),
        seat('bar-villeneuve', 'bar', 'Jacques Villeneuve', 'CAN'),
        seat('williams-button', 'williams', 'Jenson Button', 'GBR'),
        seat('jordan-frentzen', 'jordan', 'Heinz-Harald Frentzen', 'DEU'),
        seat('jordan-trulli', 'jordan', 'Jarno Trulli', 'ITA'),
        seat('sauber-salo', 'sauber', 'Mika Salo', 'FIN'),
        seat('arrows-verstappen', 'arrows', 'Jos Verstappen', 'NLD'),
        seat('prost-heidfeld', 'prost', 'Nick Heidfeld', 'DEU'),
        seat('bar-zonta', 'bar', 'Ricardo Zonta', 'BRA'),
        seat('jaguar-irvine', 'jaguar', 'Eddie Irvine', 'GBR'),
        seat('arrows-rosa', 'arrows', 'Pedro de la Rosa', 'ESP'),
        seat('benetton-wurz', 'benetton', 'Alexander Wurz', 'AUT'),
        seat('sauber-diniz', 'sauber', 'Pedro Diniz', 'BRA'),
        seat('jaguar-herbert', 'jaguar', 'Johnny Herbert', 'GBR'),
        seat('prost-alesi', 'prost', 'Jean Alesi', 'FRA'),
        seat('minardi-gene', 'minardi', 'Marc Gené', 'ESP'),
        seat('minardi-mazzacane', 'minardi', 'Gastón Mazzacane', 'ARG'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_2000,
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
      name: 'Malaysian Grand Prix 2000',
      track: recommendedTrack('sepang/gp'),
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
