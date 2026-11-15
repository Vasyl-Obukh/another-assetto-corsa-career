import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA World Endurance Championship, 2016 - Porsche's second title with the 919
 * Hybrid.
 *
 * LMP1, LMP2 and GTE. LMP1 is the 2016 spec - the Porsche 919 Hybrid of
 * Porsche Packs 2 and 3. LMP2 is Yezhrod's 2014 Ligier JS P2, which a team
 * still raced that season beside the Oreca 05s it stands in for. GTE is the
 * 2017 spec that holds Dream Pack 1's Corvette C7.R, Porsche Pack 3's 911 RSR
 * and the Yezhrod GTEs for anyone who has them; one class where the real
 * season split GTE Pro from GTE Am, since a split by driver means nothing to
 * AI drivers. Silverstone's twenty-four boxes cap the grid. All nine rounds
 * at their real lengths: six hours at Silverstone, Spa, the Nurburgring,
 * Mexico City, the Circuit of the Americas, Fuji, Shanghai and Bahrain, and Le
 * Mans at double points.
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
  description: {
    en: 'Porsche\'s 919 Hybrid season, with Yezhrod\'s Ligier in LMP2 and GTE from Corvette, Porsche '
      + 'and whatever GTE mods you own: all nine rounds at their real lengths, Le Mans at double points.',
    uk: 'Сезон Porsche 919 Hybrid з Ligier від Yezhrod в LMP2, а в GTE - Corvette, Porsche і будь-які '
      + 'ваші моди GTE: усі дев\'ять етапів у реальній тривалості, Ле-Ман із подвійними очками.',
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
        seat('lmp-leo-1', 'weissach-lmp', 'Florian Hessenauer', 'DEU'),
        seat('lmp-leo-2', 'weissach-lmp', 'Nick Halbrook', 'DEU'),
        seat('lmp-leo-3', 'weissach-lmp', 'Timo Reichenbach', 'DEU'),
        seat('lmp-neu-1', 'ingolstadt-lmp', 'Martin Kesselring', 'DEU'),
        seat('lmp-neu-2', 'ingolstadt-lmp', 'Loïc Dambreville', 'DEU'),
        seat('lmp-hig-1', 'higashi-fuji', 'Kenta Murayoshi', 'JPN'),
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
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'yzd_ligier_jsp2',
        ],
      },
      entryFee: 12000,
      prizes: {
        positions: [48000, 33600, 24000, 18250, 13900, 10550, 7700, 5750, 3850, 2400],
        standings: [384000, 240000, 153500, 101000, 62500],
      },
    },
    {
      id: 'gte',
      name: 'GTE',
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
        seat('gt-ren-1', 'rennsport-eifel', 'Florian Wirtgen', 'DEU'),
        seat('gt-ren-2', 'rennsport-eifel', 'Matthias Lehnhoff', 'DEU'),
        seat('gt-lar-1', 'lario', 'Gabriele Tentori', 'ITA'),
        seat('gt-lar-2', 'lario', 'Luca Bonacina', 'ITA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2017 },
      entryFee: 12000,
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
  defaultEventFormat: 'six-hours',
  rounds: [
    {
      id: 'silverstone',
      name: '6 Hours of Silverstone',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'race', laps: 160 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'le-mans',
      name: '24 Hours of Le Mans',
      track: recommendedTrack('le-mans/24h'),
      eventFormat: 'le-mans',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nurburgring',
      name: '6 Hours of the Nurburgring',
      track: recommendedTrack('nurburgring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico-city',
      name: '6 Hours of Mexico',
      track: recommendedTrack('mexico-city/gp'),
      sessionLengths: [{ session: 'race', laps: 230 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'cota',
      name: '6 Hours of the Circuit of the Americas',
      track: recommendedTrack('cota/gp'),
      sessionLengths: [{ session: 'race', laps: 186 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji',
      name: '6 Hours of Fuji',
      track: recommendedTrack('fuji/gp'),
      sessionLengths: [{ session: 'race', laps: 244 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai',
      name: '6 Hours of Shanghai',
      track: recommendedTrack('shanghai/gp'),
      sessionLengths: [{ session: 'race', laps: 195 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: '6 Hours of Bahrain',
      track: recommendedTrack('bahrain/gp'),
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
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 20000,
  prizes: {
    positions: [80000, 56000, 40000, 30400, 23200, 17600, 12800, 9600, 6400, 4000],
    standings: [640000, 400000, 256000, 168000, 104000],
  },
};
