import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA World Endurance Championship, 2014 - the first season of the hybrid
 * LMP1s.
 *
 * All four classes. LMP1 is the 2014 spec - Ready to Race's Audi R18 e-tron
 * quattro and Toyota TS040, the two that won that year. LMP2 is Yezhrod's
 * Ligier JS P2, which raced the season. GTE Pro and GTE Am are the base game's
 * Ferrari 458 GT2 and Dream Pack 1's Corvette C7.R. Silverstone's twenty-four
 * boxes cap the grid. All eight rounds
 * at their real lengths: six hours at Silverstone, Spa, the Circuit of the
 * Americas, Fuji, Shanghai, Bahrain and Interlagos, and Le Mans at double
 * points.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 with a point for pole. The field is
 * invented: a car was crewed by three.
 *
 * Source: https://en.wikipedia.org/wiki/2014_FIA_World_Endurance_Championship
 */
export const WEC_2014: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2014',
  name: 'World Endurance Championship 2014',
  description: {
    en: 'The first season of the hybrid LMP1s, R18 against TS040, with Yezhrod\'s Ligier in LMP2'
      + ' and the 458 and the Corvette in GTE Pro and GTE Am: all eight rounds at their real lengths, Le'
      + ' Mans at double points.',
    uk: 'Перший сезон гібридних LMP1, R18 проти TS040, з Ligier від Yezhrod в LMP2 та 458 і Corvette в '
      + 'GTE Pro та GTE Am: усі вісім етапів у реальній тривалості, Ле-Ман із подвійними очками.',
  },
  teams: [
    team('ingolstadt-lmp', 'Neuburg Prototype Team', 'DEU', TeamBudget.WORKS),
    team('higashi-fuji', 'Higashi-Fuji Racing', 'JPN', TeamBudget.WORKS),
    team('weissach-lmp', 'Leonberg Hybrid Racing', 'DEU', TeamBudget.WORKS),
    team('gte-italia', 'Squadra Prancing Endurance', 'ITA', TeamBudget.WORKS),
    team('gte-usa', 'Bowling Green Racing', 'USA', TeamBudget.WORKS),
    team('gte-uk', 'Gaydon Endurance', 'GBR', TeamBudget.INDEPENDENT),
    team('gte-fr', 'Sarthe Endurance', 'FRA', TeamBudget.PRIVATEER),
    team('rhone', 'Rhône Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'PRT', TeamBudget.INDEPENDENT),
    team('rennsport-eifel', 'Rennsport Eifel', 'DEU', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'ITA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'lmp1',
      name: 'LMP1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('lmp-neu-1', 'ingolstadt-lmp', 'Martin Kesselring', 'DEU'),
        seat('lmp-neu-2', 'ingolstadt-lmp', 'Loïc Dambreville', 'DEU'),
        seat('lmp-hig-1', 'higashi-fuji', 'Kenta Murayoshi', 'JPN'),
        seat('lmp-hig-2', 'higashi-fuji', 'Adrian Wolstenholme', 'JPN'),
        seat('lmp-leo-1', 'weissach-lmp', 'Florian Hessenauer', 'DEU'),
        seat('lmp-leo-2', 'weissach-lmp', 'Nick Halbrook', 'DEU'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP1_2014 },
    },
    {
      id: 'lmp2',
      name: 'LMP2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('p2-rho-1', 'rhone', 'Bastien Lagarrigue', 'FRA'),
        seat('p2-rho-2', 'rhone', 'Mathéo Coudray', 'FRA'),
        seat('p2-alg-1', 'algarve', 'Diogo Ferrão', 'PRT'),
        seat('p2-alg-2', 'algarve', 'Henrique Salgueiro', 'PRT'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'yzd_ligier_jsp2',
        ],
      },
      grid: { strength: -4 },
      entryFee: 12000,
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
        seat('gte-ita-1', 'gte-italia', 'Davide Rinaldini', 'ITA'),
        seat('gte-ita-2', 'gte-italia', 'Tommaso Scarpelli', 'ITA'),
        seat('gte-usa-1', 'gte-usa', 'Garrett Fairbanks', 'USA'),
        seat('gte-usa-2', 'gte-usa', 'Jordan Tollefson', 'USA'),
        seat('gte-uk-1', 'gte-uk', 'Harry Wickstead', 'GBR'),
        seat('gte-uk-2', 'gte-uk', 'Toby Carrow', 'GBR'),
        seat('gte-fr-1', 'gte-fr', 'Romain Lebreton', 'FRA'),
        seat('gte-fr-2', 'gte-fr', 'Hugo Chassagne', 'FRA'),
        seat('gte-fr-3', 'gte-fr', 'Clément Voisard', 'FRA'),
      ],
      eligibility: { kind: 'cars', cars: ['ferrari_458_gt2', 'ks_corvette_c7r'] },
      entryFee: 12000,
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
        seat('gt-ren-1', 'rennsport-eifel', 'Florian Wirtgen', 'DEU'),
        seat('gt-ren-2', 'rennsport-eifel', 'Matthias Lehnhoff', 'DEU'),
        seat('gt-lar-1', 'lario', 'Gabriele Tentori', 'ITA'),
        seat('gt-lar-2', 'lario', 'Luca Bonacina', 'ITA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ferrari_458_gt2',
          'ks_corvette_c7r',
        ],
      },
      grid: { strength: -6 },
      entryFee: 9000,
      prizes: {
        positions: [36000, 25200, 18000, 13700, 10450, 7900, 5750, 4300, 2900, 1800],
        standings: [288000, 180000, 115000, 75500, 47000],
      },
    },
  ],
  eventFormats: [
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 188, day: 2 },
      ],
    },
    {
      id: 'le-mans',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 120, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 379, day: 2, pointsSystem: 'le-mans' },
      ],
    },
  ],
  defaultEventFormat: 'six-hours',
  rounds: [
    {
      id: 'silverstone',
      name: '6 Hours of Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 167 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: { id: 'spa' },
      sessionLengths: [{ session: 'race', laps: 171 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'le-mans',
      name: '24 Hours of Le Mans',
      track: { id: 'sx_lemans_lfm', layout: 'chicane' },
      eventFormat: 'le-mans',
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
      sessionLengths: [{ session: 'race', laps: 236 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai',
      name: '6 Hours of Shanghai',
      track: { id: 'shanghai_v2', layout: 'gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: '6 Hours of Bahrain',
      track: { id: 'fn_bahrain', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 195 }],
      climate: Climate.ARID,
    },
    {
      id: 'sao-paulo',
      name: '6 Hours of Sao Paulo',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 249 }],
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
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
