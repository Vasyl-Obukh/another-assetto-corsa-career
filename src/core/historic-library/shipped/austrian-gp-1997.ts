import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Austrian Grand Prix 1997, as a historic event of its own.
 */
export const AUSTRIAN_GP_1997: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'austrian-gp-1997',
  name: 'Austrian Grand Prix 1997',
  description: 'Formula 1 back at the A1-Ring after ten years away.',
  teams: [
    team('williams', 'Rothmans Williams Renault', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('benetton', 'Mild Seven Benetton Renault', 'GBR', TeamBudget.WORKS),
    team('jordan', 'B&H Total Jordan Peugeot', 'IRL', TeamBudget.INDEPENDENT),
    team('prost', 'Prost Gauloises Blondes', 'FRA', TeamBudget.INDEPENDENT),
    team('sauber', 'Red Bull Sauber Petronas', 'CHE', TeamBudget.INDEPENDENT),
    team('arrows', 'Danka Arrows Yamaha', 'GBR', TeamBudget.INDEPENDENT),
    team('stewart', 'Stewart Ford', 'GBR', TeamBudget.INDEPENDENT),
    team('tyrrell', 'Tyrrell', 'GBR', TeamBudget.PRIVATEER),
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
        seat('williams-villeneuve', 'williams', 'Jacques Villeneuve', 'CAN'),
        seat('ferrari-schumacher', 'ferrari', 'Michael Schumacher', 'DEU'),
        seat('williams-frentzen', 'williams', 'Heinz-Harald Frentzen', 'DEU'),
        seat('mclaren-coulthard', 'mclaren', 'David Coulthard', 'GBR'),
        seat('benetton-alesi', 'benetton', 'Jean Alesi', 'FRA'),
        seat('benetton-berger', 'benetton', 'Gerhard Berger', 'AUT'),
        seat('mclaren-hakkinen', 'mclaren', 'Mika Häkkinen', 'FIN'),
        seat('ferrari-irvine', 'ferrari', 'Eddie Irvine', 'GBR'),
        seat('jordan-fisichella', 'jordan', 'Giancarlo Fisichella', 'ITA'),
        seat('prost-panis', 'prost', 'Olivier Panis', 'FRA'),
        seat('sauber-herbert', 'sauber', 'Johnny Herbert', 'GBR'),
        seat('jordan-schumacher', 'jordan', 'Ralf Schumacher', 'DEU'),
        seat('arrows-hill', 'arrows', 'Damon Hill', 'GBR'),
        seat('stewart-barrichello', 'stewart', 'Rubens Barrichello', 'BRA'),
        seat('tyrrell-salo', 'tyrrell', 'Mika Salo', 'FIN'),
        seat('stewart-magnussen', 'stewart', 'Jan Magnussen', 'DNK'),
        seat('arrows-diniz', 'arrows', 'Pedro Diniz', 'BRA'),
        seat('prost-nakano', 'prost', 'Shinji Nakano', 'JPN'),
        seat('tyrrell-verstappen', 'tyrrell', 'Jos Verstappen', 'NLD'),
        seat('minardi-katayama', 'minardi', 'Ukyo Katayama', 'JPN'),
        seat('minardi-trulli', 'minardi', 'Jarno Trulli', 'ITA'),
        seat('sauber-larini', 'sauber', 'Nicola Larini', 'ITA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1997,
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
      name: 'Austrian Grand Prix 1997',
      track: {
        id: 'ks_red_bull_ring',
        layout: 'layout_gp',
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
