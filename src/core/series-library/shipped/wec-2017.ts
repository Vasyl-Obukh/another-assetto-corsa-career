import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA World Endurance Championship, 2017 - the first season of the current
 * LMP2 cars.
 *
 * Three classes of the real four. LMP1 is the LMP1 (2016) spec, Porsche Packs
 * 2 and 3's 919 Hybrids standing in for the 2017 919 and the TS050, neither of
 * which the catalogue has. LMP2 is the LMP2 (2017) spec - Yezhrod's Oreca 07 in
 * its WEC and IMSA forms and LFM's Ligier JS P217 - and GTE Pro the GTE (2017)
 * spec, Yezhrod's 488 GTEs, 911 RSR and Vantage with Dream Pack 1's Corvette
 * and Porsche Pack 3's RSR. GTE Am is left out, and the other classes run a
 * little short of their real fields: Silverstone's and the Nurburgring's
 * twenty-four boxes cap the grid. All nine rounds at their real lengths -
 * six hours at Silverstone, Spa, the Nurburgring, Mexico City, the Circuit of
 * the Americas, Fuji, Shanghai and Bahrain, and Le Mans at double points;
 * Mexico City on VRC's circuit.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in each class with a point for pole. The
 * field is invented: the LMP1 and GTE paddocks of the 2014 and 2016 seasons and
 * five LMP2 teams.
 *
 * Source: https://en.wikipedia.org/wiki/2017_FIA_World_Endurance_Championship
 */
export const WEC_2017: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2017',
  name: 'World Endurance Championship 2017',
  description: 'The World Endurance Championship of 2017 on the 919 Hybrids and Yezhrod\'s Oreca 07s and '
    + 'GTEs: LMP1, LMP2 and GTE Pro, all nine rounds at their real lengths.',
  teams: [
    team('weissach-lmp', 'Leonberg Hybrid Racing', 'DEU', TeamBudget.WORKS),
    team('higashi-fuji', 'Higashi-Fuji Racing', 'JPN', TeamBudget.WORKS),
    team('gte-italia', 'Squadra Prancing Endurance', 'ITA', TeamBudget.WORKS),
    team('gte-usa', 'Bowling Green Racing', 'USA', TeamBudget.WORKS),
    team('gte-uk', 'Gaydon Endurance', 'GBR', TeamBudget.INDEPENDENT),
    team('gte-fr', 'Sarthe Endurance', 'FRA', TeamBudget.PRIVATEER),
    team('rhone', 'Rhône Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'PRT', TeamBudget.INDEPENDENT),
    team('trent-valley', 'Trent Valley Prototypes', 'GBR', TeamBudget.INDEPENDENT),
    team('engadin', 'Engadin Racing', 'CHE', TeamBudget.PRIVATEER),
    team('warta', 'Warta Prototypes', 'POL', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'lmp1',
      name: 'LMP1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('lmp-leo-1', 'weissach-lmp', 'Florian Hessenauer', 'DEU'),
        seat('lmp-leo-2', 'weissach-lmp', 'Nick Halbrook', 'DEU'),
        seat('lmp-hig-1', 'higashi-fuji', 'Kenta Murayoshi', 'JPN'),
        seat('lmp-hig-2', 'higashi-fuji', 'Adrian Wolstenholme', 'JPN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP1_2016 },
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
        seat('p2-tre-1', 'trent-valley', 'Oscar Hazeldine', 'GBR'),
        seat('p2-tre-2', 'trent-valley', 'Ewan Pargeter', 'GBR'),
        seat('p2-eng-1', 'engadin', 'Gian Andri Salis', 'CHE'),
        seat('p2-eng-2', 'engadin', 'Fadri Clalüna', 'CHE'),
        seat('p2-war-1', 'warta', 'Bartosz Kędzierski', 'POL'),
        seat('p2-war-2', 'warta', 'Mikołaj Szczepanik', 'POL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP2_2017 },
      entryFee: 10800,
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
        seat('gte-ita-b-1', 'gte-italia', 'Valerio Castelnuovo', 'ITA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2017 },
      grid: { strength: -1 },
      entryFee: 10800,
      prizes: {
        positions: [48000, 33600, 24000, 18250, 13900, 10550, 7700, 5750, 3850, 2400],
        standings: [384000, 240000, 153500, 101000, 62500],
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
        { id: 'race', type: 'race', name: '6 Hours', laps: 199, day: 2 },
      ],
    },
    {
      id: 'le-mans',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 367, day: 2, pointsSystem: 'le-mans' },
      ],
    },
  ],
  defaultEventFormat: 'six-hours',
  rounds: [
    {
      id: 'silverstone',
      name: '6 Hours of Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 197 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: { id: 'spa' },
      sessionLengths: [{ session: 'race', laps: 173 }],
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
      id: 'nurburgring',
      name: '6 Hours of the Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      sessionLengths: [{ session: 'race', laps: 204 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico',
      name: '6 Hours of Mexico',
      track: { id: 'vrc_mexico', layout: 'fa_layout' },
      sessionLengths: [{ session: 'race', laps: 240 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'cota',
      name: '6 Hours of the Circuit of the Americas',
      track: { id: 'acu_unitedstates' },
      sessionLengths: [{ session: 'race', laps: 192 }],
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
  grid: { strength: 3 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 18000,
  prizes: {
    positions: [80000, 56000, 40000, 30400, 23200, 17600, 12800, 9600, 6400, 4000],
    standings: [640000, 400000, 256000, 168000, 104000],
  },
};
