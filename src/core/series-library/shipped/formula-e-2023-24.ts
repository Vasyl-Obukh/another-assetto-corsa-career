import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula E, season ten - the second on the Gen3 car.
 *
 * VRC's Formula Lithium 2023 is the Gen3 car. Three of sixteen races are at
 * venues Assetto Corsa has: Mexico City on the layout VRC made for it, and the
 * Shanghai double header on the circuit's own Formula E layout. Diriyah, Sao
 * Paulo, Tokyo, Misano, Monaco, Berlin, Portland and London are not in Assetto
 * Corsa.
 *
 * Qualifying is the group stage and the knockout duels, run here as a knockout
 * of the fastest eight, four and two. The E-Prix is 85 km, the distance 45
 * minutes covers at Gen3 pace and a stand-in twice over: a real Gen3 race is a
 * set number of laps, which were not checked, and Assetto Corsa could not run
 * a timed race anyway. Energy management and attack mode cannot be said. Points are
 * 25-18-15-12-10-8-6-4-2-1, three for pole and one for the fastest lap, which
 * the season paid only to a driver in the top ten. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2023%E2%80%9324_Formula_E_World_Championship
 */
export const FORMULA_E_2023_24: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-e-2023-24',
  name: 'Formula E 2023-24',
  description: 'Formula E\'s tenth season on VRC\'s Formula Lithium 2023, the Gen3 car: Mexico City and '
    + 'the Shanghai double header.',
  teams: [
    team('lumen-e', 'Lumen E-Racing', 'France', 'FRA', TeamBudget.WORKS),
    team('voltaic', 'Voltaic Racing', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('kinetica', 'Kinetica Formula E', 'Germany', 'GER', TeamBudget.WORKS),
    team('ampere', 'Ampère Motorsport', 'France', 'FRA', TeamBudget.WORKS),
    team('fjordvolt', 'Fjordvolt Racing', 'Norway', 'NOR', TeamBudget.INDEPENDENT),
    team('sparkline', 'Sparkline Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('shenzhou', 'Shenzhou E-Racing', 'China', 'CHN', TeamBudget.INDEPENDENT),
    team('arabian-sea', 'Arabian Sea E-Racing', 'India', 'IND', TeamBudget.INDEPENDENT),
    team('galvani', 'Scuderia Galvani', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('ohm', 'Ohm Racing', 'Switzerland', 'SUI', TeamBudget.PRIVATEER),
    team('kaizen', 'Kaizen E-Racing', 'Japan', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-e',
      name: 'Formula E',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('lum-1', 'lumen-e', 'Hector Vauclair', 'France', 'FRA'),
        seat('lum-2', 'lumen-e', 'Léo Mazerolles', 'France', 'FRA'),
        seat('vol-1', 'voltaic', 'Nathan Cheverell', 'Great Britain', 'GBR'),
        seat('vol-2', 'voltaic', 'Sam Pettifer', 'Great Britain', 'GBR'),
        seat('kin-1', 'kinetica', 'Jonas Rehbein', 'Germany', 'GER'),
        seat('kin-2', 'kinetica', 'Tim Klostermann', 'Germany', 'GER'),
        seat('amp-1', 'ampere', 'Arthur Denoyelle', 'France', 'FRA'),
        seat('amp-2', 'ampere', 'Baptiste Oudinot', 'France', 'FRA'),
        seat('fjo-1', 'fjordvolt', 'Henrik Solbakken', 'Norway', 'NOR'),
        seat('fjo-2', 'fjordvolt', 'Even Brekkestø', 'Norway', 'NOR'),
        seat('spa-1', 'sparkline', 'Cole Ridgeway', 'United States', 'USA'),
        seat('spa-2', 'sparkline', 'Austin Pembrook', 'United States', 'USA'),
        seat('she-1', 'shenzhou', 'Li Haoran', 'China', 'CHN'),
        seat('she-2', 'shenzhou', 'Zhang Weiqi', 'China', 'CHN'),
        seat('ara-1', 'arabian-sea', 'Kabir Saxena', 'India', 'IND'),
        seat('ara-2', 'arabian-sea', 'Rohan Mehtani', 'India', 'IND'),
        seat('gal-1', 'galvani', 'Samuele Arrighetti', 'Italy', 'ITA'),
        seat('gal-2', 'galvani', 'Edoardo Lucchesi', 'Italy', 'ITA'),
        seat('ohm-1', 'ohm', 'Yannick Bürki', 'Switzerland', 'SUI'),
        seat('ohm-2', 'ohm', 'Loris Gisler', 'Switzerland', 'SUI'),
        seat('kai-1', 'kaizen', 'Kazuto Hirayama', 'Japan', 'JPN'),
        seat('kai-2', 'kaizen', 'Sho Kawaguchi', 'Japan', 'JPN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_E_GEN_3, minModels: 1 },
    },
  ],
  weekendFormats: [
    {
      id: 'e-prix',
      name: 'E-Prix',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { id: 'groups', type: 'qualify', name: 'Group stage', minutes: 12, day: 0 },
        {
          id: 'quarter-finals',
          type: 'qualify',
          name: 'Quarter-finals',
          minutes: 6,
          day: 0,
          inherit: { from: 'groups', top: 8 },
        },
        {
          id: 'semi-finals',
          type: 'qualify',
          name: 'Semi-finals',
          minutes: 6,
          day: 0,
          inherit: { from: 'quarter-finals', top: 4 },
        },
        {
          id: 'final',
          type: 'qualify',
          name: 'Final',
          minutes: 6,
          day: 0,
          inherit: { from: 'semi-finals', top: 2 },
        },
        { type: 'race', name: 'E-Prix', distance: 85, day: 0, inherit: { from: 'final' } },
      ],
    },
  ],
  defaultWeekendFormat: 'e-prix',
  rounds: [
    {
      id: 'mexico-city',
      name: 'Mexico City E-Prix',
      track: { id: 'vrc_mexico', layout: 'fl_layout' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai-1',
      name: 'Shanghai E-Prix, race 1',
      track: { id: 'shanghai_v2', layout: 'fe' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai-2',
      name: 'Shanghai E-Prix, race 2',
      track: { id: 'shanghai_v2', layout: 'fe' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
      qualifying: [3],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 3, aggression: 20 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
