import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Italian F4 Championship - the Formula 4 series most young drivers start in.
 *
 * RSS's Formula RSS 4 is the car of its first generation and its 2024 version
 * the second; either fields the grid. The calendar is the Italian circuits the
 * championship races, with the Red Bull Ring it visits; Misano and
 * Vallelunga's shorter configurations are not used. Three races a round: the
 * first from the first qualifying session, the second from the first race with
 * the top ten reversed, and the third from the second qualifying session. The
 * real grid runs to thirty-odd cars; the Kunos layouts' twenty-four boxes cap
 * it.
 *
 * The real races run 25 minutes and a lap; Assetto Corsa times a race on a
 * server alone, so each is the 65 km that covers at Formula 4 pace.
 * Points are 25-18-15-12-10-8-6-4-2-1 in every race - the series' own table
 * and its pole points were not checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/Italian_F4_Championship
 */
export const ITALIAN_F4: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'italian-f4',
  name: 'Italian F4 Championship',
  description: {
    en: 'The Italian Formula 4 championship on RSS\'s Formula RSS 4: three races a round, one of'
      + ' them from a reversed grid, on Italian circuits.',
    uk: 'Італійський чемпіонат Формули-4 на Formula RSS 4 від RSS: три гонки за етап, одна з них зі '
      + 'зворотної стартової решітки, на італійських трасах.',
  },
  teams: [
    team('adria', 'Adria Junior Team', 'ITA', TeamBudget.INDEPENDENT),
    team('romagna', 'Romagna Corse', 'ITA', TeamBudget.INDEPENDENT),
    team('tuscia', 'Tuscia Racing', 'ITA', TeamBudget.PRIVATEER),
    team('stelvio', 'Stelvio Motorsport', 'ITA', TeamBudget.PRIVATEER),
    team('alpenblick', 'Alpenblick Racing', 'CHE', TeamBudget.PRIVATEER),
    team('gulf-junior', 'Gulf Junior Racing', 'ARE', TeamBudget.INDEPENDENT),
    team('vistula', 'Vistula Racing', 'POL', TeamBudget.PRIVATEER),
    team('levante', 'Levante Racing', 'ESP', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-4',
      name: 'Formula 4',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 5 },
      seats: [
        seat('adr-1', 'adria', 'Gioele Bortolussi', 'ITA'),
        seat('adr-2', 'adria', 'Mattia Zamperlin', 'ITA'),
        seat('adr-3', 'adria', 'Kevin Piovesana', 'ITA'),
        seat('rom-1', 'romagna', 'Samuele Fabbrucci', 'ITA'),
        seat('rom-2', 'romagna', 'Denis Montanari', 'ITA'),
        seat('rom-3', 'romagna', 'Christian Ricciotti', 'ITA'),
        seat('tus-1', 'tuscia', 'Francesco Pallottelli', 'ITA'),
        seat('tus-2', 'tuscia', 'Brando Cardarelli', 'ITA'),
        seat('tus-3', 'tuscia', 'Giacomo Anselmetti', 'ITA'),
        seat('ste-1', 'stelvio', 'Nicola Tschurtschenthaler', 'ITA'),
        seat('ste-2', 'stelvio', 'Jonas Pircher', 'ITA'),
        seat('ste-3', 'stelvio', 'Luca Gufler', 'ITA'),
        seat('alp-1', 'alpenblick', 'Nico Bachofner', 'CHE'),
        seat('alp-2', 'alpenblick', 'Levin Zürcher', 'CHE'),
        seat('alp-3', 'alpenblick', 'Yanis Chappuis', 'CHE'),
        seat('gul-1', 'gulf-junior', 'Rashid Al Mansoori', 'ARE'),
        seat('gul-2', 'gulf-junior', 'Hamdan Al Suwaidi', 'ARE'),
        seat('gul-3', 'gulf-junior', 'Omar Al Falasi', 'ARE'),
        seat('vis-1', 'vistula', 'Szymon Wroblewicz', 'POL'),
        seat('vis-2', 'vistula', 'Kacper Dziedzic', 'POL'),
        seat('vis-3', 'vistula', 'Igor Stachurski', 'POL'),
        seat('lev-1', 'levante', 'Pablo Estellés', 'ESP'),
        seat('lev-2', 'levante', 'Marc Ferrús', 'ESP'),
        seat('lev-3', 'levante', 'Joel Sanchis', 'ESP'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_4 },
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
          distance: 65,
          day: 1,
          inherit: { from: 'qualifying-1' },
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 65,
          day: 2,
          inherit: { from: 'race-1', reverse: 10 },
        },
        {
          id: 'race-3',
          type: 'race',
          name: 'Race 3',
          distance: 65,
          day: 2,
          inherit: { from: 'qualifying-2' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'vallelunga', name: 'Vallelunga', track: { id: 'ks_vallelunga', layout: 'extended_circuit' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    {
      id: 'spielberg',
      name: 'Red Bull Ring',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -3, aggression: 25 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1500,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
