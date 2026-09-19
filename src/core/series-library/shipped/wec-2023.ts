import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA World Endurance Championship, 2023 - the Hypercar class fills out, and
 * GTE races its last season.
 *
 * Three classes. Hypercar is the Hypercar (Yezhrod) spec, the Cadillac
 * V-Series.R and the Vanwall Vandervell 680; LMP2 the LMP2 (2021) spec,
 * Yezhrod's Oreca 07s with LFM's and URD's; GTE Am the GTE (2017) spec,
 * Yezhrod's 488 GTE Evo, 911 RSR and Vantage among them. All seven rounds at
 * their real lengths, on large-box layouts - the 1000 Miles of Sebring as
 * eight hours, six hours at Portimao, Spa, Monza and Fuji, Le Mans at double
 * points and eight hours in Bahrain. The Bahrain eight hours and Sebring's
 * thousand miles pay one and a half times as understood, not checked.
 * Bahrain's thirty-six boxes cap the grid.
 *
 * Every round runs one shape of qualifying, the top ten going through to
 * Hyperpole, shared by all three classes. Points are 25-18-15-12-10-8-6-4-2-1
 * in each class with a point for pole. The field is invented, from the
 * paddocks of the other WEC seasons.
 *
 * Source: https://en.wikipedia.org/wiki/2023_FIA_World_Endurance_Championship
 */
export const WEC_2023: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2023',
  name: 'World Endurance Championship 2023',
  description: 'The World Endurance Championship of 2023 on Yezhrod\'s Cadillac and Vanwall, the Oreca 07'
    + ' and the GTEs\' last season: seven rounds at their real lengths.',
  teams: [
    team('stellaris', 'Stellaris Endurance', 'Italy', 'ITA', TeamBudget.WORKS),
    team('cotswold', 'Cotswold Hypercar', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('isar', 'Isar Hybrid Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('bretagne', 'Bretagne Endurance', 'France', 'FRA', TeamBudget.WORKS),
    team('rhone', 'Rhône Endurance', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'Portugal', 'POR', TeamBudget.INDEPENDENT),
    team('trent-valley', 'Trent Valley Prototypes', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('engadin', 'Engadin Racing', 'Switzerland', 'SUI', TeamBudget.PRIVATEER),
    team('warta', 'Warta Prototypes', 'Poland', 'POL', TeamBudget.PRIVATEER),
    team('rennsport-eifel', 'Rennsport Eifel', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('lumiere', 'Garage Lumière', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('albion', 'Albion Endurance', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('lone-oak', 'Lone Oak Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('dune', 'Dune Racing', 'United Arab Emirates', 'UAE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'hypercar',
      name: 'Hypercar',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('hy-ste-1', 'stellaris', 'Niccolò Fantuzzi', 'Italy', 'ITA'),
        seat('hy-ste-2', 'stellaris', 'Emiliano Scarabelli', 'Italy', 'ITA'),
        seat('hy-cot-1', 'cotswold', 'Harry Blenkinsop', 'Great Britain', 'GBR'),
        seat('hy-cot-2', 'cotswold', 'William Dunstable', 'Great Britain', 'GBR'),
        seat('hy-isa-1', 'isar', 'Sebastian Wimmersberger', 'Germany', 'GER'),
        seat('hy-isa-2', 'isar', 'Moritz Echterhoff', 'Germany', 'GER'),
        seat('hy-bre-1', 'bretagne', 'Erwan Le Goff', 'France', 'FRA'),
        seat('hy-bre-2', 'bretagne', 'Yann Kerbrat', 'France', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMH_YZD, minModels: 1 },
    },
    {
      id: 'lmp2',
      name: 'LMP2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('p2-rho-1', 'rhone', 'Bastien Lagarrigue', 'France', 'FRA'),
        seat('p2-rho-2', 'rhone', 'Mathéo Coudray', 'France', 'FRA'),
        seat('p2-alg-1', 'algarve', 'Diogo Ferrão', 'Portugal', 'POR'),
        seat('p2-alg-2', 'algarve', 'Henrique Salgueiro', 'Portugal', 'POR'),
        seat('p2-tre-1', 'trent-valley', 'Oscar Hazeldine', 'Great Britain', 'GBR'),
        seat('p2-tre-2', 'trent-valley', 'Ewan Pargeter', 'Great Britain', 'GBR'),
        seat('p2-eng-1', 'engadin', 'Gian Andri Salis', 'Switzerland', 'SUI'),
        seat('p2-eng-2', 'engadin', 'Fadri Clalüna', 'Switzerland', 'SUI'),
        seat('p2-war-1', 'warta', 'Bartosz Kędzierski', 'Poland', 'POL'),
        seat('p2-war-2', 'warta', 'Mikołaj Szczepanik', 'Poland', 'POL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP2_2021, minModels: 1 },
      grid: { aiLevel: 93, aiLevelMin: 86 },
      prizes: {
        positions: [48000, 33600, 24000, 18250, 13900, 10550, 7700, 5750, 3850, 2400],
        standings: [384000, 240000, 153500, 101000, 62500],
      },
    },
    {
      id: 'gte-am',
      name: 'GTE Am',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
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
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2017, minModels: 2 },
      grid: { aiLevel: 90, aiLevelMin: 83 },
      prizes: {
        positions: [36000, 25200, 18000, 13700, 10450, 7900, 5750, 4300, 2900, 1800],
        standings: [288000, 180000, 115000, 75500, 47000],
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
          laps: 222,
          day: 2,
          inherit: { from: 'hyperpole' },
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
          laps: 249,
          day: 2,
          inherit: { from: 'hyperpole' },
          pointsSystem: 'eight-hours',
        },
      ],
    },
    {
      id: 'le-mans',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
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
          name: '24 Hours',
          laps: 342,
          day: 2,
          inherit: { from: 'hyperpole' },
          pointsSystem: 'le-mans',
        },
      ],
    },
  ],
  defaultWeekendFormat: 'six-hours',
  rounds: [
    {
      id: 'sebring',
      name: '1000 Miles of Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      sessionLengths: [{ session: 'race', laps: 239 }],
      weekendFormat: 'eight-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'portimao',
      name: '6 Hours of Portimao',
      track: { id: 'algarve_portimao_2023', layout: 'lfm_nodrs' },
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: { id: 'spa', layout: '2022_lfm_standing' },
      sessionLengths: [{ session: 'race', laps: 148 }],
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
      id: 'monza',
      name: '6 Hours of Monza',
      track: { id: 'monza', layout: 'lfm' },
      sessionLengths: [{ session: 'race', laps: 200 }],
    },
    {
      id: 'fuji',
      name: '6 Hours of Fuji',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp_lfmv2' },
      sessionLengths: [{ session: 'race', laps: 229 }],
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
