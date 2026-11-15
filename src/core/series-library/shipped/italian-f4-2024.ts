import { ITALIAN_F4_2019 } from './italian-f4-2019.ts';
import { seat } from './utils.ts';
import {
  CarSpec, Climate, Discipline,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Italian F4 Championship, 2024 - the Formula 4 series most young drivers
 * start in, on the second-generation car.
 *
 * RSS's Formula RSS 4 2024 is that car, the Tatuus F4-T421 the series has run
 * since 2022; the first-generation car races Italian F4 2019. All seven
 * rounds, three races each: the first from the first qualifying session, the
 * second from the first race with the top ten reversed, and the third from the
 * second qualifying session. The real grid runs to thirty-odd cars; the Kunos
 * layouts' twenty-four boxes cap it.
 *
 * The real races run 25 minutes and a lap; Assetto Corsa times a race on a
 * server alone, so each would be the 65 km that covers at Formula 4 pace. The
 * second-generation car races a rung above the first, on the Bronze rung, so
 * each is 80 km, about a quarter longer. Points are
 * 25-18-15-12-10-8-6-4-2-1 in every race, with nothing for pole or the fastest
 * lap; the best sixteen results counted, which is not modelled. The teams are
 * those of the 2019 championship and the field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2024_Italian_F4_Championship
 */
export const ITALIAN_F4_2024: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'italian-f4-2024',
  name: 'Italian F4 Championship 2024',
  description: {
    en: 'The Italian Formula 4 championship on RSS\'s Formula RSS 4 2024: three races a round, one'
      + ' of them from a reversed grid, on Italian circuits and two abroad.',
    uk: 'Італійський чемпіонат Формули-4 на Formula RSS 4 2024 від RSS: три гонки за етап, одна з них '
      + 'зі зворотної стартової решітки, на італійських трасах і двох закордонних.',
  },
  teams: ITALIAN_F4_2019.teams,
  entries: [
    {
      id: 'formula-4',
      name: 'Formula 4',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 4 },
      seats: [
        seat('adr-1', 'adria', 'Tommaso Bellotto', 'ITA'),
        seat('adr-2', 'adria', 'Edoardo Zanchetta', 'ITA'),
        seat('adr-3', 'adria', 'Lorenzo Pavanello', 'ITA'),
        seat('rom-1', 'romagna', 'Elia Casadei', 'ITA'),
        seat('rom-2', 'romagna', 'Matteo Battistini', 'ITA'),
        seat('rom-3', 'romagna', 'Riccardo Golinucci', 'ITA'),
        seat('tus-1', 'tuscia', 'Leonardo Ceccarelli', 'ITA'),
        seat('tus-2', 'tuscia', 'Federico Pierantozzi', 'ITA'),
        seat('tus-3', 'tuscia', 'Alessio Mecarelli', 'ITA'),
        seat('ste-1', 'stelvio', 'Simon Oberhofer', 'ITA'),
        seat('ste-2', 'stelvio', 'Manuel Kofler', 'ITA'),
        seat('ste-3', 'stelvio', 'Lukas Thaler', 'ITA'),
        seat('alp-1', 'alpenblick', 'Noah Wüthrich', 'CHE'),
        seat('alp-2', 'alpenblick', 'Luca Ammann', 'CHE'),
        seat('alp-3', 'alpenblick', 'Théo Rochat', 'CHE'),
        seat('gul-1', 'gulf-junior', 'Khalid Al Ketbi', 'ARE'),
        seat('gul-2', 'gulf-junior', 'Saif Al Nuaimi', 'ARE'),
        seat('gul-3', 'gulf-junior', 'Zayed Al Hammadi', 'ARE'),
        seat('vis-1', 'vistula', 'Bartosz Wierzbicki', 'POL'),
        seat('vis-2', 'vistula', 'Mikołaj Szczepaniak', 'POL'),
        seat('vis-3', 'vistula', 'Antoni Grabowiecki', 'POL'),
        seat('lev-1', 'levante', 'Álvaro Llorens', 'ESP'),
        seat('lev-2', 'levante', 'Hugo Climent', 'ESP'),
        seat('lev-3', 'levante', 'Iker Belda', 'ESP'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_4_GEN_2 },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Three races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 15, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 15, day: 0 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 80,
          day: 1,
          inherit: { from: 'qualifying-1' },
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 80,
          day: 2,
          inherit: { from: 'race-1', reverse: 10 },
        },
        {
          id: 'race-3',
          type: 'race',
          name: 'Race 3',
          distance: 80,
          day: 2,
          inherit: { from: 'qualifying-2' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'misano',
      name: 'Misano',
      track: recommendedTrack('misano/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'imola', name: 'Imola', track: recommendedTrack('imola/gp') },
    { id: 'vallelunga', name: 'Vallelunga', track: recommendedTrack('vallelunga/full') },
    { id: 'mugello', name: 'Mugello', track: recommendedTrack('mugello/gp') },
    { id: 'paul-ricard', name: 'Paul Ricard', track: recommendedTrack('paul-ricard/gp') },
    { id: 'barcelona', name: 'Barcelona', track: recommendedTrack('barcelona/gp') },
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2250,
  prizes: {
    positions: [12000, 8400, 6000, 4600, 3450, 2650, 1950, 1450, 1000, 600],
    standings: [96000, 60000, 38250, 25500, 15750],
  },
};
