import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget, Weekday,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Nurburgring Langstrecken-Serie - the endurance series of the Nordschleife,
 * and its 24 Hours.
 *
 * The NLS runs a hundred and more cars of every class on the Nordschleife in
 * four-hour races, and scores drivers on where they finish in their class. Six
 * of its classes are here, each a class entry of its own: SP9 for GT3s, on the
 * base game's 2010s GT3 spec; SP-X for the specials, the P4/5 Competizione and
 * the SCG 003 that took pole at the 24 Hours; Cup 2 for Porsche Pack 3's 911
 * GT3 Cup; Cup 3 for Porsche Pack 1's Cayman GT4 Clubsport; the BMW Cup for
 * Dream Pack 1's M235i Racing; and SP3T for Ready to Race's Audi TT RS.
 *
 * Six four-hour races on the endurance-cup layout, one of six hours, and the
 * Nurburgring 24 Hours on its own full layout - all Dream Pack 1's
 * Nordschleife, which the base game does not have. The layout's twenty-four
 * boxes cap the grid. The points are the common 25-18-15 scale, by class; the
 * NLS table was not found.
 *
 * Source: https://en.wikipedia.org/wiki/2024_N%C3%BCrburgring_Langstrecken-Serie
 */
export const NURBURGRING_LANGSTRECKEN_SERIE: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'nurburgring-langstrecken-serie',
  name: 'Nurburgring Langstrecken-Serie',
  description: 'The Nordschleife\'s endurance series: six classes from GT3 to the BMW Cup on one grid, '
    + 'six four-hour races, a six-hour round and the Nurburgring 24 Hours.',
  teams: [
    team('eifel-gt', 'Eifelwind Racing', 'DEU', TeamBudget.WORKS),
    team('hohe-acht', 'Hohe Acht Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('brunnchen', 'Brünnchen Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('pflanzgarten', 'Team Pflanzgarten', 'DEU', TeamBudget.PRIVATEER),
    team('karussell', 'Karussell Motorsport', 'DEU', TeamBudget.PRIVATEER),
    team('adenau', 'Adenau Racing', 'DEU', TeamBudget.PRIVATEER),
    team('flemish-ring', 'Vlaamse Ring Racing', 'BEL', TeamBudget.PRIVATEER),
    team('ring-nl', 'Groene Hel Racing', 'NLD', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'sp9',
      name: 'SP9',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('sp9-eif-1', 'eifel-gt', 'Sven Mertesacker', 'DEU'),
        seat('sp9-eif-2', 'eifel-gt', 'Jan Kowalewski', 'DEU'),
        seat('sp9-hoh-1', 'hohe-acht', 'Patrick Welzbacher', 'DEU'),
        seat('sp9-hoh-2', 'hohe-acht', 'Robin Assmann', 'DEU'),
        seat('sp9-bru-1', 'brunnchen', 'Tobias Leiendecker', 'DEU'),
        seat('sp9-vla-1', 'flemish-ring', 'Kobe Verstraeten', 'BEL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_2010S, minModels: 3 },
    },
    {
      id: 'sp-x',
      name: 'SP-X',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('spx-eif-1', 'eifel-gt', 'Benno Rathmann', 'DEU'),
        seat('spx-hoh-1', 'hohe-acht', 'Christoph Linnartz', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['p4-5_2011', 'ks_glickenhaus_scg003'] },
    },
    {
      id: 'cup-2',
      name: 'Cup 2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('cup2-pfl-1', 'pflanzgarten', 'Marcel Lüthje', 'DEU'),
        seat('cup2-pfl-2', 'pflanzgarten', 'Kevin Dreesen', 'DEU'),
        seat('cup2-kar-1', 'karussell', 'Dennis Olbrich', 'DEU'),
        seat('cup2-kar-2', 'karussell', 'Philipp Koenen', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_porsche_911_gt3_cup_2017'] },
      entryFee: 3000,
      prizes: {
        positions: [12000, 8400, 6000, 4550, 3500, 2650, 1900, 1450, 950, 600],
        standings: [96000, 60000, 38500, 25000, 15500],
      },
    },
    {
      id: 'cup-3',
      name: 'Cup 3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('cup3-ade-1', 'adenau', 'Jens Bleidorn', 'DEU'),
        seat('cup3-ade-2', 'adenau', 'Anika Schroers', 'DEU'),
        seat('cup3-grn-1', 'ring-nl', 'Wessel Ruijters', 'NLD'),
        seat('cup3-grn-2', 'ring-nl', 'Bart Hendriksen', 'NLD'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_porsche_cayman_gt4_clubsport'] },
      entryFee: 3000,
      prizes: {
        positions: [12000, 8400, 6000, 4550, 3500, 2650, 1900, 1450, 950, 600],
        standings: [96000, 60000, 38500, 25000, 15500],
      },
    },
    {
      id: 'bmw-cup',
      name: 'BMW Cup',
      ladder: { discipline: Discipline.TOURING, tier: 5 },
      seats: [
        seat('bmw-kar-1', 'karussell', 'Lennart Dahmen', 'DEU'),
        seat('bmw-kar-2', 'karussell', 'Yannik Stöckl', 'DEU'),
        seat('bmw-ade-1', 'adenau', 'Rolf Heinen', 'DEU'),
        seat('bmw-ade-2', 'adenau', 'Tim Schwadorf', 'DEU'),
        seat('bmw-vla-1', 'flemish-ring', 'Jens De Wulf', 'BEL'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_bmw_m235i_racing'] },
      entryFee: 1800,
      prizes: {
        positions: [7200, 5050, 3600, 2750, 2100, 1600, 1150, 850, 600, 350],
        standings: [57500, 36000, 23000, 15000, 9500],
      },
    },
    {
      id: 'sp3t',
      name: 'SP3T',
      ladder: { discipline: Discipline.TOURING, tier: 5 },
      seats: [
        seat('sp3t-pfl-1', 'pflanzgarten', 'Ralf Bleckmann', 'DEU'),
        seat('sp3t-grn-1', 'ring-nl', 'Stijn Molenaar', 'NLD'),
        seat('sp3t-bru-1', 'brunnchen', 'Heiko Gehlen', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_audi_tt_vln'] },
      entryFee: 1800,
      prizes: {
        positions: [7200, 5050, 3600, 2750, 2100, 1600, 1150, 850, 600, 350],
        standings: [57500, 36000, 23000, 15000, 9500],
      },
    },
  ],
  eventFormats: [
    {
      id: 'four-hours',
      name: 'Four hours',
      sessions: [
        { type: 'qualify', name: 'Qualifying', minutes: 90, day: 0 },
        { id: 'race', type: 'race', classGrid: 'mixed', name: '4 Hours', laps: 27, day: 0 },
      ],
    },
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'qualify', name: 'Qualifying', minutes: 90, day: 0 },
        { id: 'race', type: 'race', classGrid: 'mixed', name: '6 Hours', laps: 35, day: 0 },
      ],
    },
    {
      id: 'twenty-four-hours',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 120, day: 1 },
        { id: 'race', type: 'race', classGrid: 'mixed', name: '24 Hours', laps: 159, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'four-hours',
  // Raced on a Saturday, as the real series is.
  raceWeekday: Weekday.SATURDAY,
  rounds: [
    {
      id: 'nls-1',
      name: 'NLS 1',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nls-2',
      name: 'NLS 2',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nls-3',
      name: 'NLS 3',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'n24',
      name: 'Nurburgring 24 Hours',
      track: { id: 'ks_nordschleife', layout: 'endurance' },
      eventFormat: 'twenty-four-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nls-4',
      name: 'NLS 4',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nls-6h',
      name: 'NLS 6 Hours',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      eventFormat: 'six-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nls-5',
      name: 'NLS 5',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nls-6',
      name: 'NLS 6',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Class points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 5 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5000,
  prizes: {
    positions: [20000, 14000, 10000, 7600, 5800, 4400, 3200, 2400, 1600, 1000],
    standings: [160000, 100000, 64000, 42000, 26000],
  },
};
