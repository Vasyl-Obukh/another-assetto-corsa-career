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
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 503, day: 2 },
  ],
};

/**
 * Formula 1, 1954 - the first season of the two-and-a-half litre formula, and
 * the Maserati 250F's first.
 *
 * The real entry list on the 1954 spec, which is the Red Pack's six-cylinder
 * 250F and nothing else, so every seat drives one - Fangio included, who won
 * two rounds in a 250F before Mercedes' W196 was ready. Four of the nine rounds
 * at their real distances: Spa, on its modern circuit over the old one's
 * distance; Silverstone, as it was; the Nordschleife; and Monza over the road
 * course's distance. Buenos Aires, Indianapolis, Reims, Bremgarten and Pedralbes
 * are not in Assetto Corsa.
 *
 * Points are 8-6-4-3-2 with a point for fastest lap, over a driver's best five
 * results - the last of which a points system cannot say yet.
 *
 * Source: https://en.wikipedia.org/wiki/1954_Formula_One_World_Championship
 */
export const FORMULA_1_1954: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1954',
  name: 'Formula 1 1954',
  description: 'The first season of the Maserati 250F, with the real entry list in the six-cylinder car '
    + 'and four of its grands prix at their real distances.',
  teams: [
    team('mercedes', 'Daimler-Benz AG', 'DEU', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('maserati', 'Officine Alfieri Maserati', 'ITA', TeamBudget.WORKS),
    team('gordini', 'Equipe Gordini', 'FRA', TeamBudget.INDEPENDENT),
    team('moss', 'A.E. Moss', 'GBR', TeamBudget.PRIVATEER),
    team('bira', 'Prince Bira', 'THA', TeamBudget.PRIVATEER),
    team('ecurie-schell', 'Harry Schell', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('mer-fangio', 'mercedes', 'Juan Manuel Fangio', 'ARG'),
        seat('fer-gonzalez', 'ferrari', 'José Froilán González', 'ARG'),
        seat('fer-hawthorn', 'ferrari', 'Mike Hawthorn', 'GBR'),
        seat('fer-trintignant', 'ferrari', 'Maurice Trintignant', 'FRA'),
        seat('mer-kling', 'mercedes', 'Karl Kling', 'DEU'),
        seat('mer-herrmann', 'mercedes', 'Hans Herrmann', 'DEU'),
        seat('mos-moss', 'moss', 'Stirling Moss', 'GBR'),
        seat('fer-farina', 'ferrari', 'Giuseppe Farina', 'ITA'),
        seat('mas-marimon', 'maserati', 'Onofre Marimón', 'ARG'),
        seat('mas-mieres', 'maserati', 'Roberto Mieres', 'ARG'),
        seat('mas-villoresi', 'maserati', 'Luigi Villoresi', 'ITA'),
        seat('mas-mantovani', 'maserati', 'Sergio Mantovani', 'ITA'),
        seat('fer-maglioli', 'ferrari', 'Umberto Maglioli', 'ITA'),
        seat('mas-musso', 'maserati', 'Luigi Musso', 'ITA'),
        seat('gor-behra', 'gordini', 'Jean Behra', 'FRA'),
        seat('bir-bira', 'bira', 'Prince Bira', 'THA'),
        seat('sch-schell', 'ecurie-schell', 'Harry Schell', 'USA'),
        seat('gor-pilette', 'gordini', 'André Pilette', 'BEL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1954, minModels: 1 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'belgium',
      name: 'Belgian Grand Prix',
      track: { id: 'spa' },
      sessionLengths: [{ session: 'grand-prix', laps: 73 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone1967' },
      sessionLengths: [{ session: 'grand-prix', laps: 90 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'germany',
      name: 'German Grand Prix',
      track: { id: 'ks_nordschleife', layout: 'nordschleife' },
      sessionLengths: [{ session: 'grand-prix', laps: 22 }],
      climate: Climate.TEMPERATE,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'ks_monza66', layout: 'road' } },
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
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 0,
  prizes: {
    positions: [35000, 22000, 15000, 10000, 7000],
    standings: [260000, 160000, 105000, 70000, 45000],
  },
};
