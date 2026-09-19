import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA World Endurance Championship, 2016 - Porsche's second title with the 919
 * Hybrid.
 *
 * All four classes. LMP1 is the 2016 spec - the Porsche 919 Hybrid of Porsche
 * Packs 2 and 3. LMP2 is Yezhrod's 2014 Ligier JS P2, which a team still raced
 * that season beside the Oreca 05s it stands in for. GTE Pro and GTE Am are
 * the 2017 spec that holds Dream Pack 1's Corvette C7.R, Porsche Pack 3's 911
 * RSR and the Yezhrod GTEs for anyone who has them. Silverstone's twenty-four
 * boxes cap the grid. Eight of the nine rounds at their real lengths: six hours at
 * Silverstone, Spa, the Nurburgring, the Circuit of the Americas, Fuji,
 * Shanghai and Bahrain, and Le Mans at double points. Mexico City is not in
 * Assetto Corsa.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 with a point for pole. The field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/2016_FIA_World_Endurance_Championship
 */
export const WEC_2016: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2016',
  name: 'World Endurance Championship 2016',
  description: 'Porsche\'s 919 Hybrid season, with Yezhrod\'s Ligier in LMP2 and GTE Pro and GTE Am from '
    + 'Corvette, Porsche and whatever GTE mods you own: eight rounds at their real lengths, Le Mans at '
    + 'double points.',
  teams: [
    team('ingolstadt-lmp', 'Neuburg Prototype Team', 'Germany', 'GER', TeamBudget.WORKS),
    team('higashi-fuji', 'Higashi-Fuji Racing', 'Japan', 'JPN', TeamBudget.WORKS),
    team('weissach-lmp', 'Leonberg Hybrid Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('gte-italia', 'Squadra Prancing Endurance', 'Italy', 'ITA', TeamBudget.WORKS),
    team('gte-usa', 'Bowling Green Racing', 'United States', 'USA', TeamBudget.WORKS),
    team('gte-uk', 'Gaydon Endurance', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('gte-fr', 'Sarthe Endurance', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('rhone', 'Rhône Endurance', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'Portugal', 'POR', TeamBudget.INDEPENDENT),
    team('rennsport-eifel', 'Rennsport Eifel', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'lmp1',
      name: 'LMP1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('lmp-leo-1', 'weissach-lmp', 'Florian Hessenauer', 'Germany', 'GER'),
        seat('lmp-leo-2', 'weissach-lmp', 'Nick Halbrook', 'Germany', 'GER'),
        seat('lmp-leo-3', 'weissach-lmp', 'Timo Reichenbach', 'Germany', 'GER'),
        seat('lmp-neu-1', 'ingolstadt-lmp', 'Martin Kesselring', 'Germany', 'GER'),
        seat('lmp-neu-2', 'ingolstadt-lmp', 'Loïc Dambreville', 'Germany', 'GER'),
        seat('lmp-hig-1', 'higashi-fuji', 'Kenta Murayoshi', 'Japan', 'JPN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP1_2016, minModels: 1 },
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
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'yzd_ligier_jsp2',
        ],
      },
      grid: { aiLevel: 92, aiLevelMin: 85 },
      prizes: {
        positions: [48000, 33600, 24000, 18250, 13900, 10550, 7700, 5750, 3850, 2400],
        standings: [384000, 240000, 153500, 101000, 62500],
      },
    },
    {
      id: 'gte',
      name: 'GTE Pro',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('gte-ita-1', 'gte-italia', 'Davide Rinaldini', 'Italy', 'ITA'),
        seat('gte-ita-2', 'gte-italia', 'Tommaso Scarpelli', 'Italy', 'ITA'),
        seat('gte-usa-1', 'gte-usa', 'Garrett Fairbanks', 'United States', 'USA'),
        seat('gte-usa-2', 'gte-usa', 'Jordan Tollefson', 'United States', 'USA'),
        seat('gte-uk-1', 'gte-uk', 'Harry Wickstead', 'Great Britain', 'GBR'),
        seat('gte-uk-2', 'gte-uk', 'Toby Carrow', 'Great Britain', 'GBR'),
        seat('gte-fr-1', 'gte-fr', 'Romain Lebreton', 'France', 'FRA'),
        seat('gte-fr-2', 'gte-fr', 'Hugo Chassagne', 'France', 'FRA'),
        seat('gte-fr-3', 'gte-fr', 'Clément Voisard', 'France', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2017, minModels: 1 },
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
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2017, minModels: 1 },
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
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 194, day: 2 },
      ],
    },
    {
      id: 'le-mans',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 120, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 384, day: 2, pointsSystem: 'le-mans' },
      ],
    },
  ],
  defaultWeekendFormat: 'six-hours',
  rounds: [
    {
      id: 'silverstone',
      name: '6 Hours of Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: { id: 'spa' },
      sessionLengths: [{ session: 'race', laps: 160 }],
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
      id: 'nurburgring',
      name: '6 Hours of the Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'cota',
      name: '6 Hours of the Circuit of the Americas',
      track: { id: 'acu_unitedstates' },
      sessionLengths: [{ session: 'race', laps: 186 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji',
      name: '6 Hours of Fuji',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      sessionLengths: [{ session: 'race', laps: 244 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai',
      name: '6 Hours of Shanghai',
      track: { id: 'shanghai_v2', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 195 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: '6 Hours of Bahrain',
      track: { id: 'fn_bahrain', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 201 }],
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
