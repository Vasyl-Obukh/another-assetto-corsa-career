import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat, SeriesSession } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Every event's opening sessions: practice on Friday, qualifying on Saturday.
 */
const OPENING: readonly SeriesSession[] = [
  { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
  { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
];

/**
 * The first race, from qualifying.
 */
const RACE_1: SeriesSession = {
  id: 'race-1',
  type: 'race',
  name: 'Race 1',
  distance: 60,
  day: 1,
  inherit: { from: 'qualifying' },
};

/**
 * The second race, from the first.
 */
const RACE_2: SeriesSession = {
  id: 'race-2',
  type: 'race',
  name: 'Race 2',
  distance: 60,
  day: 2,
  inherit: { from: 'race-1' },
};

/**
 * A round of three races, the third from qualifying again.
 */
const EVENT: EventFormat = {
  id: 'standard',
  name: 'Three races',
  sessions: [
    ...OPENING,
    RACE_1,
    RACE_2,
    {
      id: 'race-3',
      type: 'race',
      name: 'Race 3',
      distance: 60,
      day: 2,
      inherit: { from: 'qualifying' },
    },
  ],
};

/**
 * The finale at the United States Grand Prix, two races.
 */
const FINALE: EventFormat = {
  id: 'two-races',
  name: 'Two races',
  sessions: [...OPENING, RACE_1, RACE_2],
};

/**
 * Formula 4 United States Championship, 2019 - SCCA Pro Racing's Formula 4,
 * on American road courses.
 *
 * The series raced the first-generation Ligier JS F4; RSS's Formula RSS 4,
 * the Tatuus of the same generation, stands in. All six rounds, Road America -
 * on the calendar from 2021 - in place of Pittsburgh International, which is
 * not in Assetto Corsa. Three races a round and two at the finale: the first
 * from qualifying, the second from the first, and the third from qualifying
 * again. The real second race lines up on the first's fastest laps, which
 * cannot be stated, so it takes the finishing order. The real season drew
 * over forty drivers; twenty-four make the grid.
 *
 * Races are 60 km, a judgement: the real lengths were not found. Points are
 * 25-18-15-12-10-8-6-4-2-1 in every race, with nothing for pole or the fastest
 * lap. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2019_Formula_4_United_States_Championship
 */
export const US_F4_2019: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'us-f4-2019',
  name: 'Formula 4 United States Championship 2019',
  description: {
    en: 'American Formula 4 on RSS\'s Formula RSS 4: three races a round on the country\'s road '
      + 'courses, ending at the United States Grand Prix.',
    uk: 'Американська Формула-4 на Formula RSS 4 від RSS: три гонки за етап на кільцевих трасах '
      + 'країни, з фіналом на Гран-прі США.',
  },
  teams: [
    team('lone-star', 'Lone Star Racing', 'USA', TeamBudget.INDEPENDENT),
    team('peachtree', 'Peachtree Motorsports', 'USA', TeamBudget.INDEPENDENT),
    team('cascade', 'Cascade Racing', 'USA', TeamBudget.PRIVATEER),
    team('great-lakes', 'Great Lakes Motorsport', 'USA', TeamBudget.PRIVATEER),
    team('gulf-coast', 'Gulf Coast Racing', 'USA', TeamBudget.PRIVATEER),
    team('blue-ridge', 'Blue Ridge Motorsports', 'USA', TeamBudget.PRIVATEER),
    team('north-star', 'North Star Racing', 'CAN', TeamBudget.PRIVATEER),
    team('sierra', 'Sierra Racing', 'MEX', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-4',
      name: 'Formula 4',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 5 },
      seats: [
        seat('lon-1', 'lone-star', 'Austin Kimbrough', 'USA'),
        seat('lon-2', 'lone-star', 'Brody Castellano', 'USA'),
        seat('lon-3', 'lone-star', 'Diego Saldívar', 'USA'),
        seat('pea-1', 'peachtree', 'Jackson Whitlock', 'USA'),
        seat('pea-2', 'peachtree', 'Tanner Holloway', 'USA'),
        seat('pea-3', 'peachtree', 'Miles Abernathy', 'USA'),
        seat('cas-1', 'cascade', 'Ethan Lindqvist', 'USA'),
        seat('cas-2', 'cascade', 'Kai Nakamura', 'USA'),
        seat('cas-3', 'cascade', 'Owen Pruitt', 'USA'),
        seat('gre-1', 'great-lakes', 'Grant Kowalczyk', 'USA'),
        seat('gre-2', 'great-lakes', 'Cody Vandermeer', 'USA'),
        seat('gre-3', 'great-lakes', 'Luke Brandvold', 'USA'),
        seat('gul-1', 'gulf-coast', 'Beau Thibodeaux', 'USA'),
        seat('gul-2', 'gulf-coast', 'Remy Fontenot', 'USA'),
        seat('gul-3', 'gulf-coast', 'Javier Montemayor', 'USA'),
        seat('blu-1', 'blue-ridge', 'Carson Ledbetter', 'USA'),
        seat('blu-2', 'blue-ridge', 'Wyatt Pendergrass', 'USA'),
        seat('blu-3', 'blue-ridge', 'Nolan Sizemore', 'USA'),
        seat('nor-1', 'north-star', 'Liam Tremblay', 'CAN'),
        seat('nor-2', 'north-star', 'Xavier Gauthier', 'CAN'),
        seat('nor-3', 'north-star', 'Ryan Kostiuk', 'CAN'),
        seat('sie-1', 'sierra', 'Emiliano Ibarra', 'MEX'),
        seat('sie-2', 'sierra', 'Santiago Villaseñor', 'MEX'),
        seat('sie-3', 'sierra', 'Rodrigo Anaya', 'MEX'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_4_GEN_1 },
    },
  ],
  eventFormats: [EVENT, FINALE],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'road-atlanta', name: 'Road Atlanta', track: recommendedTrack('road-atlanta/gp') },
    { id: 'road-america', name: 'Road America', track: recommendedTrack('road-america/full') },
    { id: 'vir', name: 'Virginia International Raceway', track: recommendedTrack('vir/full') },
    { id: 'mid-ohio', name: 'Mid-Ohio', track: recommendedTrack('mid-ohio/full') },
    { id: 'sebring', name: 'Sebring', track: recommendedTrack('sebring/full') },
    {
      id: 'cota',
      name: 'Circuit of the Americas',
      track: recommendedTrack('cota/gp'),
      eventFormat: 'two-races',
    },
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
  entryFee: 1500,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
