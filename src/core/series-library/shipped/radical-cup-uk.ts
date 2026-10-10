import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Radical Cup UK - Radical's own club series for its sports prototypes.
 *
 * URD's SR10 XXR and SR3 XXR race as two classes on one grid, the way the
 * series splits its field. The calendar is the British circuits it races that
 * Assetto Corsa has - Silverstone, Brands Hatch, Oulton Park and Croft -
 * rather than one season's, which was not checked; Donington Park and
 * Snetterton are not in Assetto Corsa. Two 25-minute races a meeting, the
 * second from the first's result.
 *
 * The 25-18-15 scale scores each class, a stand-in: the series' own table and
 * race lengths were not checked. The field is invented.
 *
 * Source: https://www.radicalsportscars.com/racing/radical-cup-uk/
 */
export const RADICAL_CUP_UK: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'radical-cup-uk',
  name: 'Radical Cup UK',
  description: 'Radical\'s own club series on URD\'s SR10 XXR and SR3 XXR: two classes, two short races a '
    + 'meeting at British circuits.',
  teams: [
    team('grampian', 'Grampian Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('wolds', 'Wolds Racing', 'GBR', TeamBudget.PRIVATEER),
    team('peak', 'Peak District Racing', 'GBR', TeamBudget.PRIVATEER),
    team('broads', 'Broads Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('downs', 'South Downs Racing', 'GBR', TeamBudget.PRIVATEER),
    team('marches', 'Welsh Marches Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'sr10',
      name: 'SR10',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('sr10-gra-1', 'grampian', 'Callum Ferrier', 'GBR'),
        seat('sr10-gra-2', 'grampian', 'Ross Dunbar', 'GBR'),
        seat('sr10-wol-1', 'wolds', 'Thomas Hebden', 'GBR'),
        seat('sr10-wol-2', 'wolds', 'Jack Rudston', 'GBR'),
        seat('sr10-pea-1', 'peak', 'Oliver Bamford', 'GBR'),
        seat('sr10-pea-2', 'peak', 'Liam Froggatt', 'GBR'),
        seat('sr10-bro-1', 'broads', 'George Pettingale', 'GBR'),
        seat('sr10-bro-2', 'broads', 'Alfie Loddon', 'GBR'),
        seat('sr10-dow-1', 'downs', 'Freddie Amberley', 'GBR'),
        seat('sr10-dow-2', 'downs', 'Toby Ditchling', 'GBR'),
        seat('sr10-mar-1', 'marches', 'Owain Prothero', 'GBR'),
        seat('sr10-mar-2', 'marches', 'Dylan Meredith', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['urd_radical_sr10xxr_2023'] },
    },
    {
      id: 'sr3',
      name: 'SR3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 5 },
      seats: [
        seat('sr3-gra-1', 'grampian', 'Euan Cowie', 'GBR'),
        seat('sr3-gra-2', 'grampian', 'Scott Lindores', 'GBR'),
        seat('sr3-wol-1', 'wolds', 'Ben Holderness', 'GBR'),
        seat('sr3-wol-2', 'wolds', 'Matty Scarr', 'GBR'),
        seat('sr3-pea-1', 'peak', 'Josh Kinder', 'GBR'),
        seat('sr3-pea-2', 'peak', 'Adam Birchover', 'GBR'),
        seat('sr3-bro-1', 'broads', 'Sam Hickling', 'GBR'),
        seat('sr3-bro-2', 'broads', 'Joe Stalham', 'GBR'),
        seat('sr3-dow-1', 'downs', 'Charlie Findon', 'GBR'),
        seat('sr3-dow-2', 'downs', 'Will Storrington', 'GBR'),
        seat('sr3-mar-1', 'marches', 'Rhys Madoc', 'GBR'),
        seat('sr3-mar-2', 'marches', 'Iwan Probert', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['urd_radical_sr3xxr_2023'] },
      grid: { strength: -2 },
      prizes: {
        positions: [6000, 4200, 3000, 2300, 1750, 1300, 950, 700, 500, 300],
        standings: [48000, 30000, 19000, 12500, 8000],
      },
    },
  ],
  eventFormats: [
    {
      id: 'race-meeting',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { id: 'race-1', type: 'race', name: 'Race 1', distance: 65, day: 1, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 65, day: 1, inherit: { from: 'race-1' } },
      ],
    },
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'international' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: { id: 'ks_brands_hatch', layout: 'indy' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: { id: 'rt_oulton_park', layout: 'international' },
      climate: Climate.OCEANIC,
    },
    { id: 'croft', name: 'Croft', track: { id: 'zw_croft', layout: 'full' }, climate: Climate.OCEANIC },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -3, aggression: 20 },
  generatedWeather: { climate: Climate.OCEANIC },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2500,
  prizes: {
    positions: [10000, 7000, 5000, 3800, 2900, 2200, 1600, 1200, 800, 500],
    standings: [80000, 50000, 32000, 21000, 13000],
  },
};
