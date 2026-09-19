import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA World Endurance Championship, 2024 - Hypercar and the first LMGT3
 * season, on LFM's cars.
 *
 * LFM's hypercars are the Toyota, Ferrari, Porsche, Cadillac, BMW, Alpine,
 * Peugeot and Lamborghini that raced, and make up the Hypercar spec; its GT3s
 * are the season's LMGT3 field car for car, which the class names. The same
 * season on VRC's Prototype H cars is a championship of its own. Seven of
 * eight rounds at their real lengths - six hours at Imola, Spa, Interlagos,
 * the Circuit of the Americas and Fuji, the 24 Hours of Le Mans, and eight
 * hours in Bahrain - on LFM's large-box layouts. The Qatar 1812 km is not in
 * Assetto Corsa. The Circuit of the Americas' thirty boxes cap a grid that ran
 * thirty-seven.
 *
 * Qualifying and Hyperpole are run for the whole grid together, where the real
 * ones are per class. Points are 25-18-15-12-10-8-6-4-2-1 in each class with a
 * point for pole, Le Mans double and Bahrain's eight hours one and a half
 * times - the multipliers as understood, not checked for 2024. The field is
 * invented; the Hypercar paddock is the same invented one as the other WEC
 * seasons'.
 *
 * Source: https://en.wikipedia.org/wiki/2024_FIA_World_Endurance_Championship
 */
export const WEC_2024_LFM: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2024-lfm',
  name: 'World Endurance Championship 2024 (LFM)',
  description: 'The 2024 World Endurance Championship on LFM\'s cars: Hypercar and LMGT3, seven rounds at'
    + ' their real lengths, Le Mans at double points.',
  teams: [
    team('stellaris', 'Stellaris Endurance', 'Italy', 'ITA', TeamBudget.WORKS),
    team('cotswold', 'Cotswold Hypercar', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('isar', 'Isar Hybrid Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('bretagne', 'Bretagne Endurance', 'France', 'FRA', TeamBudget.WORKS),
    team('great-lakes', 'Great Lakes Endurance', 'United States', 'USA', TeamBudget.WORKS),
    team('chubu', 'Chubu Hybrid Racing', 'Japan', 'JPN', TeamBudget.WORKS),
    team('ardenne', 'Ardenne Endurance', 'Belgium', 'BEL', TeamBudget.INDEPENDENT),
    team('rennsport-eifel', 'Rennsport Eifel', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('lumiere', 'Garage Lumière', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('albion', 'Albion Endurance', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('lone-oak', 'Lone Oak Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('dune', 'Dune Racing', 'United Arab Emirates', 'UAE', TeamBudget.PRIVATEER),
    team('sakura', 'Sakura GT', 'Japan', 'JPN', TeamBudget.PRIVATEER),
    team('oranje-leeuw', 'Oranje Leeuw Racing', 'Netherlands', 'NED', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'hypercar',
      name: 'Hypercar',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('ste-1', 'stellaris', 'Niccolò Fantuzzi', 'Italy', 'ITA'),
        seat('ste-2', 'stellaris', 'Emiliano Scarabelli', 'Italy', 'ITA'),
        seat('cot-1', 'cotswold', 'Harry Blenkinsop', 'Great Britain', 'GBR'),
        seat('cot-2', 'cotswold', 'William Dunstable', 'Great Britain', 'GBR'),
        seat('isa-1', 'isar', 'Sebastian Wimmersberger', 'Germany', 'GER'),
        seat('isa-2', 'isar', 'Moritz Echterhoff', 'Germany', 'GER'),
        seat('bre-1', 'bretagne', 'Erwan Le Goff', 'France', 'FRA'),
        seat('bre-2', 'bretagne', 'Yann Kerbrat', 'France', 'FRA'),
        seat('grl-1', 'great-lakes', 'Tyler Vanderhoek', 'United States', 'USA'),
        seat('grl-2', 'great-lakes', 'Jordan Ashcombe', 'United States', 'USA'),
        seat('chu-1', 'chubu', 'Kenta Uozumi', 'Japan', 'JPN'),
        seat('chu-2', 'chubu', 'Shinnosuke Hiraga', 'Japan', 'JPN'),
        seat('ard-1', 'ardenne', 'Thomas Collignon', 'Belgium', 'BEL'),
        seat('ard-2', 'ardenne', 'Nicolas Deprez', 'Belgium', 'BEL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMH_LFM, minModels: 2 },
    },
    {
      id: 'lmgt3',
      name: 'LMGT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('gt-ren-1', 'rennsport-eifel', 'Florian Wirtgen', 'Germany', 'GER'),
        seat('gt-ren-2', 'rennsport-eifel', 'Matthias Lehnhoff', 'Germany', 'GER'),
        seat('gt-lar-1', 'lario', 'Gabriele Tentori', 'Italy', 'ITA'),
        seat('gt-lar-2', 'lario', 'Luca Bonacina', 'Italy', 'ITA'),
        seat('gt-lum-1', 'lumiere', 'Hugo Delacourt', 'France', 'FRA'),
        seat('gt-lum-2', 'lumiere', 'Mathis Garrigue', 'France', 'FRA'),
        seat('gt-alb-1', 'albion', 'Oliver Kingswell', 'Great Britain', 'GBR'),
        seat('gt-alb-2', 'albion', 'James Parrington', 'Great Britain', 'GBR'),
        seat('gt-lon-1', 'lone-oak', 'Tucker Branscombe', 'United States', 'USA'),
        seat('gt-lon-2', 'lone-oak', 'Evan Culpepper', 'United States', 'USA'),
        seat('gt-dun-1', 'dune', 'Sultan Al Kaabi', 'United Arab Emirates', 'UAE'),
        seat('gt-dun-2', 'dune', 'Rashed Al Shamsi', 'United Arab Emirates', 'UAE'),
        seat('gt-sak-1', 'sakura', 'Naoki Sekiguchi', 'Japan', 'JPN'),
        seat('gt-sak-2', 'sakura', 'Tomoya Arakaki', 'Japan', 'JPN'),
        seat('gt-ora-1', 'oranje-leeuw', 'Bram Hoekstra', 'Netherlands', 'NED'),
        seat('gt-ora-2', 'oranje-leeuw', 'Niels Verbeek', 'Netherlands', 'NED'),
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
          'lamborghini_huracan_evo2_gt3',
        ],
      },
      grid: { aiLevel: 92, aiLevelMin: 84 },
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
          laps: 205,
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
          laps: 311,
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
          laps: 235,
          day: 2,
          inherit: { from: 'hyperpole' },
          pointsSystem: 'eight-hours',
        },
      ],
    },
  ],
  defaultWeekendFormat: 'six-hours',
  rounds: [
    { id: 'imola', name: '6 Hours of Imola', track: { id: 'fn_imola', layout: 'lfm' } },
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: { id: 'spa', layout: '2022_lfm_standing' },
      sessionLengths: [{ session: 'race', laps: 141 }],
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
      track: { id: 'vhe_interlagos', layout: 'acf_gp_lfm' },
      sessionLengths: [{ session: 'race', laps: 236 }],
      climate: Climate.TEMPERATE,
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
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp_lfmv2' },
      sessionLengths: [{ session: 'race', laps: 213 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: '8 Hours of Bahrain',
      track: { id: 'fn_bahrain', layout: 'gp_lfm' },
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
  grid: { aiLevel: 97, aiLevelMin: 89, aiAggression: 30 },
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
