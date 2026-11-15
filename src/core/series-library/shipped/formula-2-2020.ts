import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A Formula 2 event of the era: practice and qualifying on Friday, the
 * feature race on Saturday, and on Sunday a sprint with the feature race's top
 * eight reversed.
 */
const EVENT: EventFormat = {
  id: 'standard',
  name: 'Feature and sprint',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
    { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
    {
      id: 'feature',
      type: 'race',
      name: 'Feature race',
      distance: 170,
      day: 1,
      inherit: { from: 'qualifying' },
      pointsSystem: 'feature',
    },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint race',
      distance: 120,
      day: 2,
      inherit: { from: 'feature', reverse: 8 },
      pointsSystem: 'sprint',
    },
  ],
};

/**
 * FIA Formula 2, 2020 - the pandemic season, run alongside Formula 1's
 * reshuffled calendar.
 *
 * RSS's Formula RSS 2 V6 2020 is that year's car. Eleven of twelve rounds,
 * each a feature race and a sprint - the sprint from the feature race's result
 * with the top eight reversed - at the lengths the series ran: two rounds at
 * the Red Bull Ring and two at Silverstone, Mugello, and Bahrain's outer loop
 * for the finale. The outer loop's laps are worked out from the series' usual
 * distances rather than checked. Sochi is not in Assetto Corsa. The feature
 * race's compulsory pit stop cannot be stated yet.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in the feature race, with 4 for pole and
 * 2 for the fastest lap, and 15-12-10-8-6-4-2-1 in the sprint, with 2 for the
 * fastest lap. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2020_FIA_Formula_2_Championship
 */
export const FORMULA_2_2020: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-2-2020',
  name: 'FIA Formula 2 2020',
  description: {
    en: 'Formula 2\'s pandemic season on RSS\'s 2020 car: eleven rounds of a feature race and a '
      + 'reverse-grid sprint, doubled up at the Red Bull Ring, Silverstone and Bahrain.',
    uk: 'Пандемічний сезон Formula 2 на машині 2020 року від RSS: одинадцять етапів з основною гонкою та '
      + 'спринтом за зворотною стартовою решіткою, зі здвоєними етапами на Ред Булл Рінгу, у '
      + 'Сільверстоуні та Бахрейні.',
  },
  teams: [
    team('solent', 'Solent Racing', 'GBR', TeamBudget.WORKS),
    team('caspian', 'Caspian Motorsport', 'AZE', TeamBudget.INDEPENDENT),
    team('aurelia', 'Scuderia Aurelia', 'ITA', TeamBudget.INDEPENDENT),
    team('gironde', 'Gironde Sport', 'FRA', TeamBudget.INDEPENDENT),
    team('taurus', 'Taurus Grand Prix', 'DEU', TeamBudget.INDEPENDENT),
    team('fjord', 'Fjord Racing', 'NOR', TeamBudget.PRIVATEER),
    team('iberica', 'Ibérica Competición', 'ESP', TeamBudget.PRIVATEER),
    team('pampas', 'Pampas Racing', 'ARG', TeamBudget.PRIVATEER),
    team('kanazawa', 'Kanazawa Racing', 'JPN', TeamBudget.PRIVATEER),
    team('maple', 'Maple Leaf Motorsport', 'CAN', TeamBudget.PRIVATEER),
    team('danube', 'Danube Racing', 'AUT', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-2',
      name: 'Formula 2',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('sol-1', 'solent', 'Harvey Colquhoun', 'GBR'),
        seat('sol-2', 'solent', 'Finn Aldersey', 'GBR'),
        seat('cas-1', 'caspian', 'Elvin Mammadli', 'AZE'),
        seat('cas-2', 'caspian', 'Farid Qasimzade', 'AZE'),
        seat('aur-1', 'aurelia', 'Edoardo Tagliaferri', 'ITA'),
        seat('aur-2', 'aurelia', 'Guglielmo Sartorelli', 'ITA'),
        seat('gir-1', 'gironde', 'Baptiste Lavergne', 'FRA'),
        seat('gir-2', 'gironde', 'Côme Ribérac', 'FRA'),
        seat('tau-1', 'taurus', 'Felix Rautenberg', 'DEU'),
        seat('tau-2', 'taurus', 'Maximilian Oberdorf', 'DEU'),
        seat('fjo-1', 'fjord', 'Sindre Holmgaard', 'NOR'),
        seat('fjo-2', 'fjord', 'Eskil Tveitan', 'NOR'),
        seat('ibe-1', 'iberica', 'Álvaro Echarri', 'ESP'),
        seat('ibe-2', 'iberica', 'Marcos Peñalver', 'ESP'),
        seat('pam-1', 'pampas', 'Santino Arrieta', 'ARG'),
        seat('pam-2', 'pampas', 'Bautista Irigoyen', 'ARG'),
        seat('kan-1', 'kanazawa', 'Haruki Tsukamoto', 'JPN'),
        seat('kan-2', 'kanazawa', 'Ren Shiozawa', 'JPN'),
        seat('map-1', 'maple', 'Owen Lachapelle', 'CAN'),
        seat('map-2', 'maple', 'Declan Morrissette', 'CAN'),
        seat('dan-1', 'danube', 'Lorenz Pichlmayr', 'AUT'),
        seat('dan-2', 'danube', 'Valentin Grabner', 'AUT'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_2_2020 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'spielberg',
      name: 'Spielberg',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spielberg-2',
      name: 'Spielberg, second round',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'budapest',
      name: 'Budapest',
      track: recommendedTrack('hungaroring/gp'),
      sessionLengths: [{ session: 'feature', laps: 37 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-2',
      name: 'Silverstone, second round',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    { id: 'barcelona', name: 'Barcelona', track: recommendedTrack('barcelona/gp-2007') },
    { id: 'spa', name: 'Spa-Francorchamps', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC },
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
    {
      id: 'mugello',
      name: 'Mugello',
      track: recommendedTrack('mugello/gp'),
      sessionLengths: [{ session: 'sprint', laps: 22 }],
    },
    { id: 'bahrain', name: 'Sakhir', track: recommendedTrack('bahrain/gp'), climate: Climate.ARID },
    {
      id: 'bahrain-outer',
      name: 'Sakhir outer circuit',
      track: recommendedTrack('bahrain/outer'),
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    {
      id: 'feature',
      name: 'Feature race',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 2,
      qualifying: [4],
    },
    { id: 'sprint', name: 'Sprint race', positions: [15, 12, 10, 8, 6, 4, 2, 1], fastestLap: 2 },
  ],
  defaultPointsSystem: 'feature',
  grid: { aggression: 15 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
