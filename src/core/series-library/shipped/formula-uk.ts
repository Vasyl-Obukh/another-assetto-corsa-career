import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula UK - the one-make Lotus T125 series that was announced and never
 * ran.
 *
 * In 2016 Rodin Cars and Chadwick Motorsport announced a one-make championship
 * for the T125 - the car the base game ships as the Exos 125 - pitched as the
 * United Kingdom's answer to Super Formula, to start as a winter series at the
 * end of 2017. It never raced, and no calendar or format was ever published,
 * so everything here but the car and the country is invented, and the
 * description says so.
 *
 * An invented calendar of British circuits, Silverstone in three of its
 * layouts among them, and a club weekend of one qualifying and two races, the
 * second with the first's top six reversed. The Stage 1 upgrade is balanced to
 * the standard car, as BOSS GP Open does.
 *
 * Source: http://www.racetechmag.com/2016/09/formula-uk-super-formula-uk
 */
export const FORMULA_UK: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-uk',
  name: 'Formula UK',
  description: 'The one-make Lotus T125 series announced in 2016 and never raced: everything but the car'
    + ' and the country is invented, on a calendar of British circuits.',
  teams: [
    team('chadwell', 'Chadwell Racing', 'GBR', TeamBudget.WORKS),
    team('pennine-f', 'Pennine Formula', 'GBR', TeamBudget.INDEPENDENT),
    team('solway', 'Solway Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('mercia', 'Mercia Grand Prix', 'GBR', TeamBudget.PRIVATEER),
    team('fenwick', 'Fenwick Racing', 'GBR', TeamBudget.PRIVATEER),
    team('lomond', 'Lomond Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-uk',
      name: 'Formula UK',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('cha-1', 'chadwell', 'Oliver Tremayne', 'GBR'),
        seat('cha-2', 'chadwell', 'Harriet Colbeck', 'GBR'),
        seat('pen-1', 'pennine-f', 'Joe Staveley', 'GBR'),
        seat('pen-2', 'pennine-f', 'Aaron Blakiston', 'GBR'),
        seat('sol-1', 'solway', 'Fraser Mackintyre', 'GBR'),
        seat('sol-2', 'solway', 'Isla Bannerman', 'GBR'),
        seat('mer-1', 'mercia', 'Kieran Oldroyd', 'GBR'),
        seat('mer-2', 'mercia', 'Dev Kapoor', 'GBR'),
        seat('fen-1', 'fenwick', 'Lewis Harcombe', 'GBR'),
        seat('fen-2', 'fenwick', 'Tom Scarisbrick', 'GBR'),
        seat('lom-1', 'lomond', 'Euan Drummond', 'GBR'),
        seat('lom-2', 'lomond', 'Callum Strachan', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['lotus_exos_125', 'lotus_exos_125_s1'] },
      bop: [
        { car: 'lotus_exos_125_s1', ballast: 40, restrictor: 12 },
      ],
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        { id: 'race-1', type: 'race', name: 'Race 1', distance: 70, day: 0, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 70, day: 1, inherit: { from: 'race-1', reverse: 6 } },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-gp',
      name: 'Silverstone GP',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: { id: 'rt_oulton_park', layout: 'international' },
      climate: Climate.OCEANIC,
    },
    { id: 'croft', name: 'Croft', track: { id: 'zw_croft', layout: 'full' }, climate: Climate.OCEANIC },
    {
      id: 'silverstone-international',
      name: 'Silverstone International',
      track: { id: 'ks_silverstone', layout: 'international' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'thruxton',
      name: 'Thruxton',
      track: { id: 'js_thruxton', layout: 'lfm' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-national',
      name: 'Silverstone National',
      track: { id: 'ks_silverstone', layout: 'national' },
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 3, aggression: 5 },
  generatedWeather: { climate: Climate.OCEANIC },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5500,
  prizes: {
    positions: [21000, 14700, 10500, 8000, 6100, 4600, 3350, 2500, 1700, 1050],
    standings: [168000, 105000, 67000, 44000, 27500],
  },
};
