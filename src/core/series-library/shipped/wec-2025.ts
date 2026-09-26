import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA World Endurance Championship, 2025 - the Hypercar class on RSS's MP-H
 * cars, and LMGT3 on LFM's.
 *
 * RSS's MP-H Bayer, Callahan, Lanzo and Protech stand for the BMW, Cadillac,
 * Lamborghini and Porsche hypercars that raced, and make up the spec. LMGT3 is
 * LFM's GT3s of the makes that entered it in 2025 - Aston Martin, BMW,
 * Corvette, Ferrari, Ford, Lexus, McLaren, Mercedes-AMG and Porsche - on the
 * LFM layouts of Imola and Spa, whose pit lanes hold both classes; the
 * Circuit of the Americas' thirty boxes cap the grid. Seven of eight rounds at
 * their real lengths - six hours at Imola, Spa, Interlagos,
 * the Circuit of the Americas and Fuji, the 24 Hours of Le Mans, and eight
 * hours in Bahrain. The Qatar 1812 km is not in Assetto Corsa.
 *
 * Every round runs one shape of qualifying, the top ten going through to
 * Hyperpole; Le Mans' own longer Hyperpole is simplified to it. Points are
 * 25-18-15-12-10-8-6-4-2-1 with a point for pole, Le Mans double and Bahrain's
 * eight hours one and a half times - the multipliers as understood for 2025,
 * not checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2025_FIA_World_Endurance_Championship
 */
export const WEC_2025: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2025',
  name: 'World Endurance Championship 2025',
  description: 'The 2025 World Endurance Championship on RSS\'s MP-H hypercars and LFM\'s LMGT3s: seven '
    + 'rounds at their real lengths, Le Mans at double points.',
  teams: [
    team('stellaris', 'Stellaris Endurance', 'ITA', TeamBudget.WORKS),
    team('cotswold', 'Cotswold Hypercar', 'GBR', TeamBudget.WORKS),
    team('isar', 'Isar Hybrid Racing', 'DEU', TeamBudget.WORKS),
    team('bretagne', 'Bretagne Endurance', 'FRA', TeamBudget.WORKS),
    team('great-lakes', 'Great Lakes Endurance', 'USA', TeamBudget.WORKS),
    team('chubu', 'Chubu Hybrid Racing', 'JPN', TeamBudget.WORKS),
    team('ardenne', 'Ardenne Endurance', 'BEL', TeamBudget.INDEPENDENT),
    team('atlantico', 'Atlântico Endurance', 'PRT', TeamBudget.INDEPENDENT),
    team('rennsport-eifel', 'Rennsport Eifel', 'DEU', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'ITA', TeamBudget.INDEPENDENT),
    team('lumiere', 'Garage Lumière', 'FRA', TeamBudget.INDEPENDENT),
    team('albion', 'Albion Endurance', 'GBR', TeamBudget.INDEPENDENT),
    team('lone-oak', 'Lone Oak Racing', 'USA', TeamBudget.PRIVATEER),
    team('dune', 'Dune Racing', 'ARE', TeamBudget.PRIVATEER),
    team('sakura', 'Sakura GT', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'hypercar',
      name: 'Hypercar',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('ste-1', 'stellaris', 'Niccolò Fantuzzi', 'ITA'),
        seat('ste-2', 'stellaris', 'Emiliano Scarabelli', 'ITA'),
        seat('cot-1', 'cotswold', 'Harry Blenkinsop', 'GBR'),
        seat('cot-2', 'cotswold', 'William Dunstable', 'GBR'),
        seat('isa-1', 'isar', 'Sebastian Wimmersberger', 'DEU'),
        seat('isa-2', 'isar', 'Moritz Echterhoff', 'DEU'),
        seat('bre-1', 'bretagne', 'Erwan Le Goff', 'FRA'),
        seat('bre-2', 'bretagne', 'Yann Kerbrat', 'FRA'),
        seat('grl-1', 'great-lakes', 'Tyler Vanderhoek', 'USA'),
        seat('grl-2', 'great-lakes', 'Jordan Ashcombe', 'USA'),
        seat('chu-1', 'chubu', 'Kenta Uozumi', 'JPN'),
        seat('chu-2', 'chubu', 'Shinnosuke Hiraga', 'JPN'),
        seat('ard-1', 'ardenne', 'Thomas Collignon', 'BEL'),
        seat('ard-2', 'ardenne', 'Nicolas Deprez', 'BEL'),
        seat('atl-1', 'atlantico', 'Rodrigo Amaral', 'PRT'),
        seat('atl-2', 'atlantico', 'Gonçalo Brandão', 'PRT'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMH_RSS, minModels: 2 },
    },
    {
      id: 'lmgt3',
      name: 'LMGT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('gt-ren-1', 'rennsport-eifel', 'Florian Wirtgen', 'DEU'),
        seat('gt-ren-2', 'rennsport-eifel', 'Matthias Lehnhoff', 'DEU'),
        seat('gt-lar-1', 'lario', 'Gabriele Tentori', 'ITA'),
        seat('gt-lar-2', 'lario', 'Luca Bonacina', 'ITA'),
        seat('gt-lum-1', 'lumiere', 'Hugo Delacourt', 'FRA'),
        seat('gt-lum-2', 'lumiere', 'Mathis Garrigue', 'FRA'),
        seat('gt-alb-1', 'albion', 'Oliver Kingswell', 'GBR'),
        seat('gt-alb-2', 'albion', 'James Parrington', 'GBR'),
        seat('gt-lon-1', 'lone-oak', 'Tucker Branscombe', 'USA'),
        seat('gt-lon-2', 'lone-oak', 'Evan Culpepper', 'USA'),
        seat('gt-dun-1', 'dune', 'Sultan Al Kaabi', 'ARE'),
        seat('gt-dun-2', 'dune', 'Rashed Al Shamsi', 'ARE'),
        seat('gt-sak-1', 'sakura', 'Naoki Sekiguchi', 'JPN'),
        seat('gt-sak-2', 'sakura', 'Tomoya Arakaki', 'JPN'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'porsche_992_gt3_r_2023',
          'ks_ferrari_296_gt3_2023',
          'ks_bmw_m4_gt3_2022',
          'corvette_z06_gt3_2024',
          'ford_mustang_gt3_2024',
          'ng_lexus_r_cf_gt3',
          'acf_aston_martin_vantage_gt3_evo',
          'mclaren_720s_gt3_evo',
          'bm_amg_evo_2020_gt3',
        ],
      },
      grid: { strength: -5 },
      prizes: {
        positions: [28800, 20150, 14400, 10950, 8350, 6350, 4600, 3450, 2300, 1450],
        standings: [230500, 144000, 92000, 60500, 37500],
      },
    },
  ],
  weekendFormats: [
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 12, day: 1 },
        {
          id: 'hyperpole',
          type: 'qualify',
          name: 'Hyperpole',
          minutes: 10,
          day: 1,
          inherit: { from: 'qualifying', top: 10 },
        },
        {
          id: 'race',
          type: 'race',
          name: '6 Hours',
          laps: 202,
          day: 2,
          inherit: { from: 'hyperpole' },
        },
      ],
    },
    {
      id: 'le-mans',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 180, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
        {
          id: 'hyperpole',
          type: 'qualify',
          name: 'Hyperpole',
          minutes: 10,
          day: 1,
          inherit: { from: 'qualifying', top: 10 },
        },
        {
          id: 'race',
          type: 'race',
          name: '24 Hours',
          laps: 387,
          day: 2,
          inherit: { from: 'hyperpole' },
          pointsSystem: 'le-mans',
        },
      ],
    },
    {
      id: 'eight-hours',
      name: 'Eight hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 12, day: 1 },
        {
          id: 'hyperpole',
          type: 'qualify',
          name: 'Hyperpole',
          minutes: 10,
          day: 1,
          inherit: { from: 'qualifying', top: 10 },
        },
        {
          id: 'race',
          type: 'race',
          name: '8 Hours',
          laps: 237,
          day: 2,
          inherit: { from: 'hyperpole' },
          pointsSystem: 'eight-hours',
        },
      ],
    },
  ],
  defaultWeekendFormat: 'six-hours',
  rounds: [
    {
      id: 'imola',
      name: '6 Hours of Imola',
      track: { id: 'fn_imola', layout: 'lfm' },
      sessionLengths: [{ session: 'race', laps: 212 }],
    },
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: { id: 'spa', layout: '2022_lfm_standing' },
      sessionLengths: [{ session: 'race', laps: 150 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'le-mans',
      name: '24 Hours of Le Mans',
      track: { id: 'sx_lemans_lfm', layout: 'chicane' },
      weekendFormat: 'le-mans',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sao-paulo',
      name: '6 Hours of Sao Paulo',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 242 }],
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'cota',
      name: 'Lone Star Le Mans',
      track: { id: 'acu_unitedstates' },
      sessionLengths: [{ session: 'race', laps: 183 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji',
      name: '6 Hours of Fuji',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: '8 Hours of Bahrain',
      track: { id: 'fn_bahrain', layout: 'gp' },
      weekendFormat: 'eight-hours',
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1] },
    {
      id: 'le-mans',
      name: 'Le Mans, double points',
      positions: [50, 36, 30, 24, 20, 16, 12, 8, 4, 2],
      qualifying: [1],
    },
    {
      id: 'eight-hours',
      name: 'Eight hours, points and a half',
      positions: [37.5, 27, 22.5, 18, 15, 12, 9, 6, 3, 1.5],
      qualifying: [1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 20000,
  prizes: {
    positions: [80000, 56000, 40000, 30400, 23200, 17600, 12800, 9600, 6400, 4000],
    standings: [640000, 400000, 256000, 168000, 104000],
  },
};
