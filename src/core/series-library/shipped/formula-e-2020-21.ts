import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula E, season seven - the first to carry world championship status, on
 * the Gen2 car.
 *
 * VRC's Formula Lithium 2019 is the Gen2 car. The season ran almost entirely
 * on city streets, and the only venue Assetto Corsa has is Valencia's Ricardo
 * Tormo circuit, where it held a double header - raced here as two rounds.
 * Diriyah, Rome, Monaco, Puebla, New York, London and Berlin are not in
 * Assetto Corsa.
 *
 * Qualifying is one session for everyone and a Super Pole for the fastest six;
 * the real group stage ran four groups in championship order. The real races
 * run 45 minutes and a lap, which Assetto Corsa cannot time offline, so the
 * E-Prix is the 75 km that covers at Gen2 pace; energy management and attack
 * mode cannot be said either.
 * Points are 25-18-15-12-10-8-6-4-2-1, three for pole and one for the fastest
 * lap, which the season paid only to a driver in the top ten. The field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/2020%E2%80%9321_Formula_E_World_Championship
 */
export const FORMULA_E_2020_21: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-e-2020-21',
  name: 'Formula E 2020-21',
  description: 'Formula E\'s first world championship season on VRC\'s Formula Lithium 2019, the Gen2 car:'
    + ' its Valencia double header, the only venue of the season Assetto Corsa has.',
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
    team('helios', 'Helios Electric', 'Spain', 'ESP', TeamBudget.PRIVATEER),
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
        seat('hel-1', 'helios', 'Diego Carrasquer', 'Spain', 'ESP'),
        seat('hel-2', 'helios', 'Unai Beristain', 'Spain', 'ESP'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_E_GEN_2, minModels: 1 },
    },
  ],
  weekendFormats: [
    {
      id: 'e-prix',
      name: 'E-Prix',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 45, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        {
          id: 'super-pole',
          type: 'qualify',
          name: 'Super Pole',
          minutes: 6,
          day: 0,
          inherit: { from: 'qualifying', top: 6 },
        },
        { type: 'race', name: 'E-Prix', distance: 75, day: 0, inherit: { from: 'super-pole' } },
      ],
    },
  ],
  defaultWeekendFormat: 'e-prix',
  rounds: [
    { id: 'valencia-1', name: 'Valencia E-Prix, race 1', track: { id: 'fn_valencia', layout: 'gp' } },
    { id: 'valencia-2', name: 'Valencia E-Prix, race 2', track: { id: 'fn_valencia', layout: 'gp' } },
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
  generatedWeather: { climate: Climate.MEDITERRANEAN },
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
