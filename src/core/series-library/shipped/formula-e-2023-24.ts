import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget, Weekday,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula E, season ten - the second on the Gen3 car.
 *
 * VRC's Formula Lithium 2023 is the Gen3 car. Eight of sixteen races are at
 * venues Assetto Corsa has: Mexico City on the layout VRC made for it, the
 * Misano double header, Monaco on the Grand Prix circuit, and the Shanghai and
 * Portland double headers on those circuits' own Formula E layouts. Diriyah,
 * Sao Paulo, Tokyo, Berlin and London are not in Assetto Corsa.
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
  description: {
    en: 'Formula E\'s tenth season on VRC\'s Formula Lithium 2023, the Gen3 car: Mexico City, '
      + 'Misano, Monaco, Shanghai and Portland.',
    uk: 'Десятий сезон Formula E на Formula Lithium 2023 від VRC, машині Gen3: Мехіко, Мізано, '
      + 'Монако, Шанхай і Портленд.',
  },
  teams: [
    team('lumen-e', 'Lumen E-Racing', 'FRA', TeamBudget.WORKS),
    team('voltaic', 'Voltaic Racing', 'GBR', TeamBudget.WORKS),
    team('kinetica', 'Kinetica Formula E', 'DEU', TeamBudget.WORKS),
    team('ampere', 'Ampère Motorsport', 'FRA', TeamBudget.WORKS),
    team('fjordvolt', 'Fjordvolt Racing', 'NOR', TeamBudget.INDEPENDENT),
    team('sparkline', 'Sparkline Racing', 'USA', TeamBudget.INDEPENDENT),
    team('shenzhou', 'Shenzhou E-Racing', 'CHN', TeamBudget.INDEPENDENT),
    team('arabian-sea', 'Arabian Sea E-Racing', 'IND', TeamBudget.INDEPENDENT),
    team('galvani', 'Scuderia Galvani', 'ITA', TeamBudget.INDEPENDENT),
    team('ohm', 'Ohm Racing', 'CHE', TeamBudget.PRIVATEER),
    team('kaizen', 'Kaizen E-Racing', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-e',
      name: 'Formula E',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('lum-1', 'lumen-e', 'Hector Vauclair', 'FRA'),
        seat('lum-2', 'lumen-e', 'Léo Mazerolles', 'FRA'),
        seat('vol-1', 'voltaic', 'Nathan Cheverell', 'GBR'),
        seat('vol-2', 'voltaic', 'Sam Pettifer', 'GBR'),
        seat('kin-1', 'kinetica', 'Jonas Rehbein', 'DEU'),
        seat('kin-2', 'kinetica', 'Tim Klostermann', 'DEU'),
        seat('amp-1', 'ampere', 'Arthur Denoyelle', 'FRA'),
        seat('amp-2', 'ampere', 'Baptiste Oudinot', 'FRA'),
        seat('fjo-1', 'fjordvolt', 'Henrik Solbakken', 'NOR'),
        seat('fjo-2', 'fjordvolt', 'Even Brekkestø', 'NOR'),
        seat('spa-1', 'sparkline', 'Cole Ridgeway', 'USA'),
        seat('spa-2', 'sparkline', 'Austin Pembrook', 'USA'),
        seat('she-1', 'shenzhou', 'Li Haoran', 'CHN'),
        seat('she-2', 'shenzhou', 'Zhang Weiqi', 'CHN'),
        seat('ara-1', 'arabian-sea', 'Kabir Saxena', 'IND'),
        seat('ara-2', 'arabian-sea', 'Rohan Mehtani', 'IND'),
        seat('gal-1', 'galvani', 'Samuele Arrighetti', 'ITA'),
        seat('gal-2', 'galvani', 'Edoardo Lucchesi', 'ITA'),
        seat('ohm-1', 'ohm', 'Yannick Bürki', 'CHE'),
        seat('ohm-2', 'ohm', 'Loris Gisler', 'CHE'),
        seat('kai-1', 'kaizen', 'Kazuto Hirayama', 'JPN'),
        seat('kai-2', 'kaizen', 'Sho Kawaguchi', 'JPN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_E_GEN_3 },
    },
  ],
  eventFormats: [
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
        { id: 'race', type: 'race', name: 'E-Prix', distance: 85, day: 0, inherit: { from: 'final' } },
      ],
    },
  ],
  defaultEventFormat: 'e-prix',
  // Raced on a Saturday, as the real series is.
  raceWeekday: Weekday.SATURDAY,
  rounds: [
    {
      id: 'mexico-city',
      name: 'Mexico City E-Prix',
      track: recommendedTrack('mexico-city/fe'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'misano-1',
      name: 'Misano E-Prix, race 1',
      track: recommendedTrack('misano/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'misano-2',
      name: 'Misano E-Prix, race 2',
      track: recommendedTrack('misano/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'monaco',
      name: 'Monaco E-Prix',
      track: recommendedTrack('monaco/gp'),
      sessionLengths: [{ session: 'race', laps: 29 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'shanghai-1',
      name: 'Shanghai E-Prix, race 1',
      track: recommendedTrack('shanghai/fe'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai-2',
      name: 'Shanghai E-Prix, race 2',
      track: recommendedTrack('shanghai/fe'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'portland-1',
      name: 'Portland E-Prix, race 1',
      track: recommendedTrack('portland/fe'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'portland-2',
      name: 'Portland E-Prix, race 2',
      track: recommendedTrack('portland/fe'),
      climate: Climate.OCEANIC,
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
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.TEMPERATE },
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
