import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Ginetta GT4 Supercup - Ginetta's one-make series on the BTCC support bill,
 * on Guerilla's G55 GT4.
 *
 * Three races a meeting. The calendar is the circuits of the BTCC weekends it
 * supports that Assetto Corsa has - Brands Hatch in both layouts, Thruxton,
 * Oulton Park, Croft, Knockhill and Silverstone - rather than one season's,
 * which was not checked; Donington Park and Snetterton are not in Assetto
 * Corsa. The first race lines up on qualifying and the second on the first's
 * result; the third reverses the second's top six, a stand-in for the series'
 * own rule, which was not checked, as were its 20-minute races and its points
 * - the 25-18-15 scale stands in. The field is invented, and is the same club
 * paddock as Radical Cup UK's.
 *
 * Source: https://en.wikipedia.org/wiki/Ginetta_GT4_Supercup
 */
export const GINETTA_GT4_SUPERCUP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'ginetta-gt4-supercup',
  name: 'Ginetta GT4 Supercup',
  description: 'Ginetta\'s one-make series on the BTCC support bill, on Guerilla\'s G55 GT4: three races a'
    + ' meeting at British circuits.',
  teams: [
    team('grampian', 'Grampian Motorsport', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('wolds', 'Wolds Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('peak', 'Peak District Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('broads', 'Broads Motorsport', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('downs', 'South Downs Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('marches', 'Welsh Marches Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'g55',
      name: 'G55 GT4',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('gra-1', 'grampian', 'Callum Ferrier', 'Great Britain', 'GBR'),
        seat('gra-2', 'grampian', 'Ross Dunbar', 'Great Britain', 'GBR'),
        seat('gra-3', 'grampian', 'Euan Cowie', 'Great Britain', 'GBR'),
        seat('gra-4', 'grampian', 'Scott Lindores', 'Great Britain', 'GBR'),
        seat('wol-1', 'wolds', 'Thomas Hebden', 'Great Britain', 'GBR'),
        seat('wol-2', 'wolds', 'Jack Rudston', 'Great Britain', 'GBR'),
        seat('wol-3', 'wolds', 'Ben Holderness', 'Great Britain', 'GBR'),
        seat('wol-4', 'wolds', 'Matty Scarr', 'Great Britain', 'GBR'),
        seat('pea-1', 'peak', 'Oliver Bamford', 'Great Britain', 'GBR'),
        seat('pea-2', 'peak', 'Liam Froggatt', 'Great Britain', 'GBR'),
        seat('pea-3', 'peak', 'Josh Kinder', 'Great Britain', 'GBR'),
        seat('pea-4', 'peak', 'Adam Birchover', 'Great Britain', 'GBR'),
        seat('bro-1', 'broads', 'George Pettingale', 'Great Britain', 'GBR'),
        seat('bro-2', 'broads', 'Alfie Loddon', 'Great Britain', 'GBR'),
        seat('bro-3', 'broads', 'Sam Hickling', 'Great Britain', 'GBR'),
        seat('bro-4', 'broads', 'Joe Stalham', 'Great Britain', 'GBR'),
        seat('dow-1', 'downs', 'Freddie Amberley', 'Great Britain', 'GBR'),
        seat('dow-2', 'downs', 'Toby Ditchling', 'Great Britain', 'GBR'),
        seat('dow-3', 'downs', 'Charlie Findon', 'Great Britain', 'GBR'),
        seat('dow-4', 'downs', 'Will Storrington', 'Great Britain', 'GBR'),
        seat('mar-1', 'marches', 'Owain Prothero', 'Great Britain', 'GBR'),
        seat('mar-2', 'marches', 'Dylan Meredith', 'Great Britain', 'GBR'),
        seat('mar-3', 'marches', 'Rhys Madoc', 'Great Britain', 'GBR'),
        seat('mar-4', 'marches', 'Iwan Probert', 'Great Britain', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['gt4_ginetta_g55'] },
    },
  ],
  weekendFormats: [
    {
      id: 'race-meeting',
      name: 'Three races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { id: 'race-1', type: 'race', name: 'Race 1', distance: 45, day: 1, inherit: { from: 'qualifying' } },
        { id: 'race-2', type: 'race', name: 'Race 2', distance: 45, day: 2, inherit: { from: 'race-1' } },
        { type: 'race', name: 'Race 3', distance: 45, day: 2, inherit: { from: 'race-2', reverse: 6 } },
      ],
    },
  ],
  defaultWeekendFormat: 'race-meeting',
  rounds: [
    {
      id: 'brands-hatch-indy',
      name: 'Brands Hatch Indy',
      track: { id: 'ks_brands_hatch', layout: 'indy' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'thruxton',
      name: 'Thruxton',
      track: { id: 'js_thruxton', layout: 'lfm' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: { id: 'rt_oulton_park', layout: 'island' },
      climate: Climate.OCEANIC,
    },
    { id: 'croft', name: 'Croft', track: { id: 'zw_croft', layout: 'full' }, climate: Climate.OCEANIC },
    {
      id: 'knockhill',
      name: 'Knockhill',
      track: { id: 'knockhill2017', layout: 'knockhill' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone',
      name: 'Silverstone National',
      track: { id: 'ks_silverstone', layout: 'national' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch-gp',
      name: 'Brands Hatch GP',
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -2, aggression: 25 },
  generatedWeather: { climate: Climate.OCEANIC },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 3000,
  prizes: {
    positions: [12000, 8400, 6000, 4550, 3500, 2650, 1900, 1450, 950, 600],
    standings: [96000, 60000, 38500, 25000, 15500],
  },
};
