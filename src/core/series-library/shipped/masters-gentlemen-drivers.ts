import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Masters Gentlemen Drivers and Pre-66 Touring - today's historic races for
 * pre-1966 GT and touring cars, which share a grid.
 *
 * Masters Gentlemen Drivers races GT and sports cars from before 1966 over an
 * hour with a mandatory stop, and Masters has run its Pre-66 Touring Cars on
 * the same grid. The base game has one car for each: the Shelby Cobra 427 S/C in
 * GT, and the Abarth 595 SS in Touring, its tuning stages among it, the
 * Step 2 restricted back to the others. The Cobra 427 was homologated from
 * 1966, so it runs as an invited car, as Masters' own grids take it. The
 * Ferrari 250 GTO and Alfa GTA of the Ferrari 70th pack and Dream Pack 1 were
 * the grid's other stars, and are not named, since a car list is a
 * requirement and naming them would make this a DLC championship.
 *
 * The 2026 calendar: Brands Hatch, Zandvoort and Monza, where the road course
 * without its chicanes is raced. The field is invented, and the points are the
 * 25-18-15 scale: Masters' own table was not found. Zandvoort's eighteen boxes
 * cap the grid.
 *
 * Sources: https://www.mastershistoricracing.com/en/race-serie/masters-gentlemen-drivers/,
 * https://automotivehistory.org/shelby-cobra-fia-4-rules/
 */
export const MASTERS_GENTLEMEN_DRIVERS: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'masters-gentlemen-drivers',
  name: 'Masters Gentlemen Drivers',
  description: 'Today\'s historic hour for pre-1966 GT and touring cars on one grid: the Shelby Cobra in '
    + 'GT and the Abarth 595 SS in Touring, with a mandatory stop.',
  teams: [
    team('carroll', 'Venice Beach Racing', 'USA', TeamBudget.INDEPENDENT),
    team('goodwood', 'Lavant Historic', 'GBR', TeamBudget.INDEPENDENT),
    team('scorpione-storico', 'Scorpione Storico', 'ITA', TeamBudget.PRIVATEER),
    team('tulip', 'Tulip Historic Racing', 'NLD', TeamBudget.PRIVATEER),
    team('montlhery', 'Écurie Montlhéry', 'FRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt',
      name: 'GT',
      ladder: { discipline: Discipline.ROAD, tier: 3 },
      seats: [
        seat('gt-car-1', 'carroll', 'Buck Whitfield', 'USA'),
        seat('gt-car-2', 'carroll', 'Randall Pike', 'USA'),
        seat('gt-goo-1', 'goodwood', 'Crispin Hollingworth', 'GBR'),
        seat('gt-goo-2', 'goodwood', 'Archibald Fenwick', 'GBR'),
        seat('gt-tul-1', 'tulip', 'Maurits van Rhijn', 'NLD'),
        seat('gt-mon-1', 'montlhery', 'Bertrand Chaussier', 'FRA'),
        seat('gt-mon-2', 'montlhery', 'Laurent Péquignot', 'FRA'),
        seat('gt-sco-1', 'scorpione-storico', 'Tullio Amadei', 'ITA'),
        seat('gt-tul-2', 'tulip', 'Joris Koolhoven', 'NLD'),
        seat('gt-goo-3', 'goodwood', 'Freddie Pemberton', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['shelby_cobra_427sc'] },
    },
    {
      id: 'touring',
      name: 'Pre-66 Touring',
      ladder: { discipline: Discipline.TOURING, tier: 5 },
      seats: [
        seat('tc-sco-1', 'scorpione-storico', 'Giuseppe Mancinelli', 'ITA'),
        seat('tc-sco-2', 'scorpione-storico', 'Franco Bertolazzi', 'ITA'),
        seat('tc-sco-3', 'scorpione-storico', 'Livia Castaldi', 'ITA'),
        seat('tc-tul-1', 'tulip', 'Henk Wagenaar', 'NLD'),
        seat('tc-mon-1', 'montlhery', 'Yves Fourcade', 'FRA'),
        seat('tc-goo-1', 'goodwood', 'Nigel Ormsby', 'GBR'),
        seat('tc-car-1', 'carroll', 'Lyle Dorsey', 'USA'),
        seat('tc-mon-2', 'montlhery', 'Paul Rivasseau', 'FRA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['ks_abarth_595ss', 'ks_abarth_595ss_s1', 'ks_abarth_595ss_s2'],
      },
      // The Step 2 has twice the others' power.
      bop: [{ car: 'ks_abarth_595ss_s2', restrictor: 45 }],
      grid: { strength: -4 },
      entryFee: 1800,
      prizes: {
        positions: [5400, 3800, 2700, 2000, 1450, 1100, 800, 600, 400, 200],
        standings: [36000, 21500, 14500, 9500, 6000],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'One hour', distance: 140, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'ks_zandvoort' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'monza',
      name: 'Monza Road Course',
      track: { id: 'ks_monza66', layout: 'road' },
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -2, aggression: -5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5000,
  prizes: {
    positions: [15000, 10500, 7500, 5500, 4000, 3000, 2200, 1600, 1100, 600],
    standings: [100000, 60000, 40000, 26000, 16000],
  },
};
