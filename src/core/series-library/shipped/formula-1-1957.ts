import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix weekend of the fifties: practice, timed practice setting the
 * grid, and the race.
 */
const WEEKEND: WeekendFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 120, day: 0 },
    { type: 'qualify', name: 'Timed practice', minutes: 120, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 458, day: 2 },
  ],
};

/**
 * Formula 1, 1957 - Fangio's fifth title, and his last, in a Maserati 250F.
 *
 * The real entry list on the 1957 spec, which is the Tripl3 Pack's
 * twelve-cylinder 250F - the car Maserati tried alongside the six that won -
 * and nothing else, so every seat drives one. The Nordschleife, where Fangio
 * won the race of his life, and Monza are raced at their real distances;
 * Aintree's British Grand Prix is raced at Silverstone as it was, over its
 * distance, since Aintree is not in Assetto Corsa. Buenos Aires, Monaco,
 * Indianapolis, Rouen and Pescara are not either.
 *
 * Points are 8-6-4-3-2 with a point for fastest lap, over a driver's best five
 * results - the last of which a points system cannot say yet.
 *
 * Source: https://en.wikipedia.org/wiki/1957_Formula_One_World_Championship
 */
export const FORMULA_1_1957: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1957',
  name: 'Formula 1 1957',
  description: 'Fangio\'s last title, with the real entry list in the twelve-cylinder Maserati 250F, the '
    + 'Nordschleife and Monza at their real distances, and Aintree\'s British Grand Prix raced at '
    + 'Silverstone.',
  teams: [
    team('maserati', 'Officine Alfieri Maserati', 'Italy', 'ITA', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'Italy', 'ITA', TeamBudget.WORKS),
    team('vanwall', 'Vandervell Products', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('cooper', 'Cooper Car Company', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('centro-sud', 'Scuderia Centro Sud', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('bonnier', 'Joakim Bonnier', 'Sweden', 'SWE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('mas-fangio', 'maserati', 'Juan Manuel Fangio', 'Argentina', 'ARG'),
        seat('van-moss', 'vanwall', 'Stirling Moss', 'Great Britain', 'GBR'),
        seat('fer-musso', 'ferrari', 'Luigi Musso', 'Italy', 'ITA'),
        seat('fer-hawthorn', 'ferrari', 'Mike Hawthorn', 'Great Britain', 'GBR'),
        seat('van-brooks', 'vanwall', 'Tony Brooks', 'Great Britain', 'GBR'),
        seat('cen-gregory', 'centro-sud', 'Masten Gregory', 'United States', 'USA'),
        seat('mas-behra', 'maserati', 'Jean Behra', 'France', 'FRA'),
        seat('mas-schell', 'maserati', 'Harry Schell', 'United States', 'USA'),
        seat('fer-collins', 'ferrari', 'Peter Collins', 'Great Britain', 'GBR'),
        seat('van-lewis-evans', 'vanwall', 'Stuart Lewis-Evans', 'Great Britain', 'GBR'),
        seat('fer-trintignant', 'ferrari', 'Maurice Trintignant', 'France', 'FRA'),
        seat('mas-menditeguy', 'maserati', 'Carlos Menditéguy', 'Argentina', 'ARG'),
        seat('mas-scarlatti', 'maserati', 'Giorgio Scarlatti', 'Italy', 'ITA'),
        seat('coo-brabham', 'cooper', 'Jack Brabham', 'Australia', 'AUS'),
        seat('coo-salvadori', 'cooper', 'Roy Salvadori', 'Great Britain', 'GBR'),
        seat('bon-bonnier', 'bonnier', 'Jo Bonnier', 'Sweden', 'SWE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1957, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'grand-prix',
  rounds: [
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone1967' },
      sessionLengths: [{ session: 'grand-prix', laps: 92 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'germany',
      name: 'German Grand Prix',
      track: { id: 'ks_nordschleife', layout: 'nordschleife' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'italy',
      name: 'Italian Grand Prix',
      track: { id: 'ks_monza66', layout: 'road' },
      sessionLengths: [{ session: 'grand-prix', laps: 87 }],
    },
  ],
  pointsSystems: [
    {
      id: 'race', name: 'Championship points', positions: [8, 6, 4, 3, 2], fastestLap: 1,
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 96, aiLevelMin: 88, aiAggression: 25 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 0,
  prizes: {
    positions: [36000, 23000, 15500, 10500, 7500],
    standings: [270000, 165000, 110000, 72000, 46000],
  },
};
