import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * BPR Global GT Series, 1996 - the McLaren F1 GTR's championship.
 *
 * The F1 GTR dominated the BPR's GT1 class, and much of its grid was F1 GTRs;
 * Dream Pack 1 ships the car, and this is its one-make version of that season.
 * Seven of eleven rounds at their real lengths: four hours at Paul Ricard,
 * Monza, Silverstone, the Nurburgring, Brands Hatch and Spa, and the Suzuka
 * 1000 km. Jarama, Anderstorp, Nogaro and Zhuhai are not in Assetto Corsa.
 * The BPR's own points table was not found, so the 20-15-12 scale of the day
 * stands in. The field is invented, since the real crews were two and three
 * to a car.
 *
 * Source: https://en.wikipedia.org/wiki/1996_BPR_Global_GT_Series
 */
export const BPR_GLOBAL_GT_1996: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'bpr-global-gt-1996',
  name: 'BPR Global GT Series 1996',
  description: {
    en: 'The McLaren F1 GTR\'s championship: six of the 1996 season\'s four-hour races and the '
      + 'Suzuka 1000 km, on the car that dominated them.',
    uk: 'Чемпіонат McLaren F1 GTR: шість чотиригодинних гонок сезону 1996 року та 1000 км Сузуки '
      + 'на машині, яка в них домінувала.',
  },
  teams: [
    team('woking-gt', 'Albion GT', 'GBR', TeamBudget.WORKS),
    team('gulf-gt', 'Harrow Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('bigazzi-gt', 'Squadra Toscana', 'ITA', TeamBudget.INDEPENDENT),
    team('west-gt', 'Kölner Sportwagen', 'DEU', TeamBudget.INDEPENDENT),
    team('parabolica', 'Écurie Parabolique', 'FRA', TeamBudget.PRIVATEER),
    team('jacadi', 'Stoke Rochford Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt1',
      name: 'GT1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('alb-1', 'woking-gt', 'Nigel Ashcroft', 'GBR'),
        seat('alb-2', 'woking-gt', 'Simon Treloar', 'GBR'),
        seat('har-1', 'gulf-gt', 'Ray Lindholm', 'GBR'),
        seat('har-2', 'gulf-gt', 'Pete Waddington', 'GBR'),
        seat('tos-1', 'bigazzi-gt', 'Gabriele Nesti', 'ITA'),
        seat('tos-2', 'bigazzi-gt', 'Paolo Serafini', 'ITA'),
        seat('kol-1', 'west-gt', 'Thomas Gerlinger', 'DEU'),
        seat('kol-2', 'west-gt', 'Ulf Brenninkmeyer', 'DEU'),
        seat('par-1', 'parabolica', 'Jean-Luc Mauriac', 'FRA'),
        seat('par-2', 'parabolica', 'Yannick Berthollet', 'FRA'),
        seat('sto-1', 'jacadi', 'Andrew Pryor', 'GBR'),
        seat('sto-2', 'jacadi', 'Mark Pennington', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_mclaren_f1_gtr'] },
    },
  ],
  eventFormats: [
    {
      id: 'four-hours',
      name: 'Four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { id: 'race', type: 'race', name: '4 Hours', laps: 122, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'four-hours',
  rounds: [
    {
      id: 'paul-ricard',
      name: 'Paul Ricard',
      track: recommendedTrack('paul-ricard/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'monza',
      name: 'Monza 4 Hours',
      track: recommendedTrack('monza/gp'),
      sessionLengths: [{ session: 'race', laps: 126 }],
    },
    {
      id: 'silverstone',
      name: 'Silverstone 4 Hours',
      track: recommendedTrack('silverstone/gp'),
      sessionLengths: [{ session: 'race', laps: 108 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring 4 Hours',
      track: recommendedTrack('nurburgring/gp-gt'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'suzuka',
      name: 'Suzuka 1000 km',
      track: recommendedTrack('suzuka/gp'),
      sessionLengths: [{ session: 'race', laps: 173 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'brands-hatch',
      name: 'Brands Hatch 4 Hours',
      track: recommendedTrack('brands-hatch/gp'),
      sessionLengths: [{ session: 'race', laps: 178 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: 'Spa 4 Hours',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'race', laps: 100 }],
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 11000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
