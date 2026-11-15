import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget, Weekday,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula E, season seven - the first to carry world championship status, on
 * the Gen2 car.
 *
 * VRC's Formula Lithium 2019 is the Gen2 car. The season ran almost entirely
 * on city streets. Its Valencia double header at the Ricardo Tormo circuit and
 * its Puebla double header on the Formula E layout of the Autodromo Miguel E.
 * Abed are raced, each as two rounds, with Monaco between them over the real
 * race's 26 laps; Monaco needs monaco_2020's layouts, the older monaco mod having
 * twenty-two boxes for a grid of twenty-four. Diriyah, Rome, New York, London
 * and Berlin are not in Assetto Corsa.
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
  description: {
    en: 'Formula E\'s first world championship season on VRC\'s Formula Lithium 2019, the Gen2 car:'
      + ' its Valencia and Puebla double headers and Monaco.',
    uk: 'Перший сезон Formula E у статусі чемпіонату світу на Formula Lithium 2019 від VRC, машині Gen2: '
      + 'здвоєні етапи у Валенсії та Пуеблі і Монако.',
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
    team('helios', 'Helios Electric', 'ESP', TeamBudget.PRIVATEER),
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
        seat('hel-1', 'helios', 'Diego Carrasquer', 'ESP'),
        seat('hel-2', 'helios', 'Unai Beristain', 'ESP'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_E_GEN_2 },
    },
  ],
  eventFormats: [
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
        { id: 'race', type: 'race', name: 'E-Prix', distance: 75, day: 0, inherit: { from: 'super-pole' } },
      ],
    },
  ],
  defaultEventFormat: 'e-prix',
  // Raced on a Saturday, as the real series is.
  raceWeekday: Weekday.SATURDAY,
  rounds: [
    { id: 'valencia-1', name: 'Valencia E-Prix, race 1', track: recommendedTrack('valencia/gp') },
    { id: 'valencia-2', name: 'Valencia E-Prix, race 2', track: recommendedTrack('valencia/gp') },
    {
      id: 'monaco',
      name: 'Monaco E-Prix',
      track: recommendedTrack('monaco/gp'),
      sessionLengths: [{ session: 'race', laps: 26 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'puebla-1',
      name: 'Puebla E-Prix, race 1',
      track: recommendedTrack('puebla/fe'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'puebla-2',
      name: 'Puebla E-Prix, race 2',
      track: recommendedTrack('puebla/fe'),
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
  grid: { aggression: 20 },
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
