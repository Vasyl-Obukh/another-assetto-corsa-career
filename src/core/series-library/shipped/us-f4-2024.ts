import { US_F4_2019 } from './us-f4-2019.ts';
import { seat } from './utils.ts';
import {
  CarSpec, Climate, Discipline,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula 4 United States Championship, 2024 - SCCA Pro Racing's Formula 4,
 * in the first season of its second-generation car.
 *
 * The series raced the Ligier JS F422; RSS's Formula RSS 4 2024, the Tatuus of
 * the same generation, stands in. Road America, Mid-Ohio and the Circuit of
 * the Americas as raced, with circuits the series held rounds at in other
 * years in place of those not in Assetto Corsa: Sebring for NOLA, whose opener
 * was cancelled, Virginia International Raceway for New Jersey Motorsports
 * Park, and Road Atlanta for Canadian Tire Motorsport Park. Three races a
 * round: the first from qualifying, the second from the first, and the third
 * from qualifying again. The real season ran a grid of about ten; twenty-four
 * make it here.
 *
 * Races are 75 km, a judgement: the real lengths were not found, and the
 * second-generation car races a rung above the first, on the Bronze rung, so
 * they run about a quarter longer than 2019's 60 km. Points are
 * 25-18-15-12-10-8-6-4-2-1 in every race, with nothing for pole or the fastest
 * lap. The teams are those of the 2019 championship and the field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/2024_Formula_4_United_States_Championship
 */
export const US_F4_2024: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'us-f4-2024',
  name: 'Formula 4 United States Championship 2024',
  description: {
    en: 'American Formula 4 on RSS\'s Formula RSS 4 2024: three races a round on the country\'s road '
      + 'courses, ending at the Circuit of the Americas.',
    uk: 'Американська Формула-4 на Formula RSS 4 2024 від RSS: три гонки за етап на кільцевих трасах '
      + 'країни, з фіналом на Трасі Америк.',
  },
  teams: US_F4_2019.teams,
  entries: [
    {
      id: 'formula-4',
      name: 'Formula 4',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 4 },
      seats: [
        seat('lon-1', 'lone-star', 'Hudson Greer', 'USA'),
        seat('lon-2', 'lone-star', 'Mateo Garza', 'USA'),
        seat('lon-3', 'lone-star', 'Reid Calloway', 'USA'),
        seat('pea-1', 'peachtree', 'Bennett Ashford', 'USA'),
        seat('pea-2', 'peachtree', 'Colton Merriweather', 'USA'),
        seat('pea-3', 'peachtree', 'Eli Hargrove', 'USA'),
        seat('cas-1', 'cascade', 'Finnegan Rourke', 'USA'),
        seat('cas-2', 'cascade', 'Ryder Okamoto', 'USA'),
        seat('cas-3', 'cascade', 'Sawyer Lindahl', 'USA'),
        seat('gre-1', 'great-lakes', 'Dominic Wozniak', 'USA'),
        seat('gre-2', 'great-lakes', 'Parker Hollister', 'USA'),
        seat('gre-3', 'great-lakes', 'Gavin Strohmeyer', 'USA'),
        seat('gul-1', 'gulf-coast', 'Landry Broussard', 'USA'),
        seat('gul-2', 'gulf-coast', 'Julian Escamilla', 'USA'),
        seat('gul-3', 'gulf-coast', 'Tate Delacroix', 'USA'),
        seat('blu-1', 'blue-ridge', 'Asher Whitfield', 'USA'),
        seat('blu-2', 'blue-ridge', 'Grayson Tolliver', 'USA'),
        seat('blu-3', 'blue-ridge', 'Declan Mabry', 'USA'),
        seat('nor-1', 'north-star', 'Mathis Bélanger', 'CAN'),
        seat('nor-2', 'north-star', 'Owen MacPhail', 'CAN'),
        seat('nor-3', 'north-star', 'Ethan Dubreuil', 'CAN'),
        seat('sie-1', 'sierra', 'Leonardo Cázares', 'MEX'),
        seat('sie-2', 'sierra', 'Iker Valdivia', 'MEX'),
        seat('sie-3', 'sierra', 'Sebastián Olmedo', 'MEX'),
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
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 75,
          day: 1,
          inherit: { from: 'qualifying' },
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 75,
          day: 2,
          inherit: { from: 'race-1' },
        },
        {
          id: 'race-3',
          type: 'race',
          name: 'Race 3',
          distance: 75,
          day: 2,
          inherit: { from: 'qualifying' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'sebring', name: 'Sebring', track: recommendedTrack('sebring/full') },
    { id: 'road-america', name: 'Road America', track: recommendedTrack('road-america/full') },
    { id: 'mid-ohio', name: 'Mid-Ohio', track: recommendedTrack('mid-ohio/full') },
    { id: 'vir', name: 'Virginia International Raceway', track: recommendedTrack('vir/full') },
    { id: 'road-atlanta', name: 'Road Atlanta', track: recommendedTrack('road-atlanta/gp') },
    { id: 'cota', name: 'Circuit of the Americas', track: recommendedTrack('cota/gp') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.TEMPERATE },
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
