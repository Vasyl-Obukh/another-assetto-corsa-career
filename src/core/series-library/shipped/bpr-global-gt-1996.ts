import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * BPR Global GT Series, 1996 - the McLaren F1 GTR's championship.
 *
 * The F1 GTR dominated the BPR's GT1 class, and much of its grid was F1 GTRs;
 * Dream Pack 1 ships the car, and this is its one-make version of that season.
 * Five of eleven rounds at their real four hours: Monza, Silverstone, the
 * Nurburgring, Brands Hatch and Spa. Paul Ricard, Jarama, Anderstorp, Suzuka,
 * Nogaro and Zhuhai are not in Assetto Corsa. The BPR's own points table was
 * not found, so the 20-15-12 scale of the day stands in. The field is
 * invented, since the real crews were two and three to a car.
 *
 * Source: https://en.wikipedia.org/wiki/1996_BPR_Global_GT_Series
 */
export const BPR_GLOBAL_GT_1996: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'bpr-global-gt-1996',
  name: 'BPR Global GT Series 1996',
  description: 'The McLaren F1 GTR\'s championship: five of the 1996 season\'s four-hour races, on the car'
    + ' that dominated them.',
  teams: [
    team('woking-gt', 'Albion GT', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('gulf-gt', 'Harrow Racing', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('bigazzi-gt', 'Squadra Toscana', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('west-gt', 'Kölner Sportwagen', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('parabolica', 'Écurie Parabolique', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('jacadi', 'Stoke Rochford Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt1',
      name: 'GT1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('alb-1', 'woking-gt', 'Nigel Ashcroft', 'Great Britain', 'GBR'),
        seat('alb-2', 'woking-gt', 'Simon Treloar', 'Great Britain', 'GBR'),
        seat('har-1', 'gulf-gt', 'Ray Lindholm', 'Great Britain', 'GBR'),
        seat('har-2', 'gulf-gt', 'Pete Waddington', 'Great Britain', 'GBR'),
        seat('tos-1', 'bigazzi-gt', 'Gabriele Nesti', 'Italy', 'ITA'),
        seat('tos-2', 'bigazzi-gt', 'Paolo Serafini', 'Italy', 'ITA'),
        seat('kol-1', 'west-gt', 'Thomas Gerlinger', 'Germany', 'GER'),
        seat('kol-2', 'west-gt', 'Ulf Brenninkmeyer', 'Germany', 'GER'),
        seat('par-1', 'parabolica', 'Jean-Luc Mauriac', 'France', 'FRA'),
        seat('par-2', 'parabolica', 'Yannick Berthollet', 'France', 'FRA'),
        seat('sto-1', 'jacadi', 'Andrew Pryor', 'Great Britain', 'GBR'),
        seat('sto-2', 'jacadi', 'Mark Pennington', 'Great Britain', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_mclaren_f1_gtr'] },
    },
  ],
  weekendFormats: [
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
  defaultWeekendFormat: 'four-hours',
  rounds: [
    {
      id: 'monza',
      name: 'Monza 4 Hours',
      track: { id: 'monza' },
      sessionLengths: [{ session: 'race', laps: 126 }],
    },
    {
      id: 'silverstone',
      name: 'Silverstone 4 Hours',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 108 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring 4 Hours',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'brands-hatch',
      name: 'Brands Hatch 4 Hours',
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 178 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: 'Spa 4 Hours',
      track: { id: 'spa' },
      sessionLengths: [{ session: 'race', laps: 100 }],
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 4 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 11000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
