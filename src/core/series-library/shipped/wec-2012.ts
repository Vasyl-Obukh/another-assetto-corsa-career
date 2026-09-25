import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA World Endurance Championship, 2012 - the first season, and the first
 * hybrid to win Le Mans.
 *
 * Three classes of the real four. LMP1 is Yezhrod's Audi R18 e-tron quattro
 * of 2012, the LMP1 (2012) spec; GTE Pro and GTE Am are both the GTE (2011)
 * spec, the base game's Ferrari 458 GT2 and BMW M3 GT2 - the Ferrari raced the
 * season, the M3 stands for the Porsche and Aston Martin that did. LMP2 is left
 * out: the catalogue has no LMP2 of the season. Silverstone's twenty-four boxes
 * cap the grid. All eight rounds at their real lengths - the
 * Sebring 12 Hours, six hours at Spa, Silverstone, Interlagos, Bahrain, Fuji
 * and Shanghai, and Le Mans at double points.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 with a point for pole. The field is
 * invented, and is the same paddock as the 2014 and 2016 seasons'.
 *
 * Source: https://en.wikipedia.org/wiki/2012_FIA_World_Endurance_Championship
 */
export const WEC_2012: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2012',
  name: 'World Endurance Championship 2012',
  description: 'The first World Endurance Championship on Yezhrod\'s R18 e-tron quattro and the base '
    + 'game\'s GTEs in GTE Pro and GTE Am: all eight rounds at their real lengths, Le Mans at double '
    + 'points.',
  teams: [
    team('ingolstadt-lmp', 'Neuburg Prototype Team', 'Germany', 'GER', TeamBudget.WORKS),
    team('higashi-fuji', 'Higashi-Fuji Racing', 'Japan', 'JPN', TeamBudget.WORKS),
    team('weissach-lmp', 'Leonberg Hybrid Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('gte-italia', 'Squadra Prancing Endurance', 'Italy', 'ITA', TeamBudget.WORKS),
    team('gte-usa', 'Bowling Green Racing', 'United States', 'USA', TeamBudget.WORKS),
    team('gte-uk', 'Gaydon Endurance', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('gte-fr', 'Sarthe Endurance', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('rennsport-eifel', 'Rennsport Eifel', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('lumiere', 'Garage Lumière', 'France', 'FRA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'lmp1',
      name: 'LMP1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('lmp-neu-1', 'ingolstadt-lmp', 'Martin Kesselring', 'Germany', 'GER'),
        seat('lmp-neu-2', 'ingolstadt-lmp', 'Loïc Dambreville', 'Germany', 'GER'),
        seat('lmp-hig-1', 'higashi-fuji', 'Kenta Murayoshi', 'Japan', 'JPN'),
        seat('lmp-hig-2', 'higashi-fuji', 'Adrian Wolstenholme', 'Japan', 'JPN'),
        seat('lmp-leo-1', 'weissach-lmp', 'Florian Hessenauer', 'Germany', 'GER'),
        seat('lmp-leo-2', 'weissach-lmp', 'Nick Halbrook', 'Germany', 'GER'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP1_2012, minModels: 1 },
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
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2011, minModels: 1 },
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
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2011, minModels: 1 },
      grid: { strength: -5 },
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
        { id: 'race', type: 'race', name: '6 Hours', laps: 191, day: 2 },
      ],
    },
    {
      id: 'twelve-hours',
      name: 'Twelve hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '12 Hours', laps: 325, day: 2 },
      ],
    },
    {
      id: 'le-mans',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 378, day: 2, pointsSystem: 'le-mans' },
      ],
    },
  ],
  defaultWeekendFormat: 'six-hours',
  rounds: [
    {
      id: 'sebring',
      name: '12 Hours of Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      weekendFormat: 'twelve-hours',
      climate: Climate.TEMPERATE,
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
      id: 'silverstone',
      name: '6 Hours of Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 194 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'sao-paulo',
      name: '6 Hours of Sao Paulo',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 247 }],
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'bahrain',
      name: '6 Hours of Bahrain',
      track: { id: 'fn_bahrain', layout: 'gp' },
      climate: Climate.ARID,
    },
    {
      id: 'fuji',
      name: '6 Hours of Fuji',
      track: { id: 'rt_fuji_speedway', layout: 'layout_gp' },
      sessionLengths: [{ session: 'race', laps: 233 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai',
      name: '6 Hours of Shanghai',
      track: { id: 'shanghai_v2', layout: 'gp' },
      climate: Climate.TEMPERATE,
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
  grid: { strength: 4 },
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
