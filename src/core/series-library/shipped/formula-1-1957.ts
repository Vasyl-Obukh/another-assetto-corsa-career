import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of the fifties: practice, timed practice setting the
 * grid, and the race.
 */
const EVENT: EventFormat = {
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
 * The real entry list on the 1957 spec, which is the Red Pack's
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
  description: {
    en: 'Fangio\'s last title, with the real entry list in the twelve-cylinder Maserati 250F, the '
      + 'Nordschleife and Monza at their real distances, and Aintree\'s British Grand Prix raced at '
      + 'Silverstone.',
    uk: 'Останній титул Фанхіо зі справжнім списком учасників на дванадцятициліндровому Maserati '
      + '250F, Нордшляйфе та Монца на справжніх дистанціях, а Гран-прі Великої Британії з Ейнтрі '
      + 'проходить у Сільверстоуні.',
  },
  teams: [
    team('maserati', 'Officine Alfieri Maserati', 'ITA', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('vanwall', 'Vandervell Products', 'GBR', TeamBudget.WORKS),
    team('cooper', 'Cooper Car Company', 'GBR', TeamBudget.INDEPENDENT),
    team('centro-sud', 'Scuderia Centro Sud', 'ITA', TeamBudget.PRIVATEER),
    team('bonnier', 'Joakim Bonnier', 'SWE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('mas-fangio', 'maserati', 'Juan Manuel Fangio', 'ARG'),
        seat('van-moss', 'vanwall', 'Stirling Moss', 'GBR'),
        seat('fer-musso', 'ferrari', 'Luigi Musso', 'ITA'),
        seat('fer-hawthorn', 'ferrari', 'Mike Hawthorn', 'GBR'),
        seat('van-brooks', 'vanwall', 'Tony Brooks', 'GBR'),
        seat('cen-gregory', 'centro-sud', 'Masten Gregory', 'USA'),
        seat('mas-behra', 'maserati', 'Jean Behra', 'FRA'),
        seat('mas-schell', 'maserati', 'Harry Schell', 'USA'),
        seat('fer-collins', 'ferrari', 'Peter Collins', 'GBR'),
        seat('van-lewis-evans', 'vanwall', 'Stuart Lewis-Evans', 'GBR'),
        seat('fer-trintignant', 'ferrari', 'Maurice Trintignant', 'FRA'),
        seat('mas-menditeguy', 'maserati', 'Carlos Menditéguy', 'ARG'),
        seat('mas-scarlatti', 'maserati', 'Giorgio Scarlatti', 'ITA'),
        seat('coo-brabham', 'cooper', 'Jack Brabham', 'AUS'),
        seat('coo-salvadori', 'cooper', 'Roy Salvadori', 'GBR'),
        seat('bon-bonnier', 'bonnier', 'Jo Bonnier', 'SWE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1957 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
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
  grid: { strength: 4, aggression: -5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 9000,
  prizes: {
    positions: [36000, 23000, 15500, 10500, 7500],
    standings: [270000, 165000, 110000, 72000, 46000],
  },
};
