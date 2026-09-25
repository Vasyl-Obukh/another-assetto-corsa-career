import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Unlimited Invitational - invented, for RSS's cars that no rulebook contains.
 *
 * The LMP1 Protech P91 Hybrid Evo is an LMP1 after the rules ran out, the GT-
 * MX Macca and Protech P92 Renn are GTs past any class, and the Hyperion 2020
 * is a road hypercar. Nothing real races them, so this is made up and says so:
 * three classes, the two GT-MX cars balanced on the install's figures, at
 * circuits with room for them.
 */
export const UNLIMITED_INVITATIONAL: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'unlimited-invitational',
  name: 'Unlimited Invitational',
  description: 'Invented: RSS\'s rule-free cars - the P91 Evo prototype, the GT-MX pair and the Hyperion '
    + '2020 - in three classes.',
  teams: [
    team('black-arrow', 'Black Arrow Racing', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('furia', 'Squadra Furia', 'Italy', 'ITA', TeamBudget.WORKS),
    team('nordlicht', 'Nordlicht Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('hyperdrive', 'Hyperdrive Collective', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('mirage', 'Mirage Racing', 'United Arab Emirates', 'UAE', TeamBudget.INDEPENDENT),
    team('kitsune', 'Kitsune Racing', 'Japan', 'JPN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'prototype',
      name: 'Prototype',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('pro-bla-1', 'black-arrow', 'Conrad Ellesmere', 'Great Britain', 'GBR'),
        seat('pro-fur-1', 'furia', 'Paride Scaglione', 'Italy', 'ITA'),
        seat('pro-nor-1', 'nordlicht', 'Jörn Hellwege', 'Germany', 'GER'),
        seat('pro-hyp-1', 'hyperdrive', 'Brock Stanfield', 'United States', 'USA'),
        seat('pro-mir-1', 'mirage', 'Faisal Al Ketbi', 'United Arab Emirates', 'UAE'),
        seat('pro-kit-1', 'kitsune', 'Shota Kiriyama', 'Japan', 'JPN'),
      ],
      eligibility: { kind: 'cars', cars: ['rss_lmp1_protech_p91_evo'] },
    },
    {
      id: 'gt-mx',
      name: 'GT-MX',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('gtx-bla-1', 'black-arrow', 'Miles Haverford', 'Great Britain', 'GBR'),
        seat('gtx-fur-1', 'furia', 'Ettore Canavesi', 'Italy', 'ITA'),
        seat('gtx-nor-1', 'nordlicht', 'Timo Wendeborn', 'Germany', 'GER'),
        seat('gtx-hyp-1', 'hyperdrive', 'Chase Holbrook', 'United States', 'USA'),
        seat('gtx-hyp-2', 'hyperdrive', 'Dean Kessling', 'United States', 'USA'),
        seat('gtx-mir-1', 'mirage', 'Hamad Al Blooshi', 'United Arab Emirates', 'UAE'),
        seat('gtx-kit-1', 'kitsune', 'Ryo Amemiya', 'Japan', 'JPN'),
        seat('gtx-kit-2', 'kitsune', 'Kaito Sugino', 'Japan', 'JPN'),
      ],
      eligibility: { kind: 'cars', cars: ['rss_gtmx_macca_v8', 'rss_gtmx_protech_p92_f6_renn'] },
      // The Macca is a hundred horsepower up on the Renn and lighter.
      bop: [
        { car: 'rss_gtmx_macca_v8', restrictor: 15 },
      ],
      grid: { strength: -2 },
      prizes: {
        positions: [54000, 37800, 27000, 20500, 15650, 11900, 8650, 6500, 4300, 2700],
        standings: [432000, 270000, 173000, 113500, 70000],
      },
    },
    {
      id: 'hypercar',
      name: 'Hypercar',
      ladder: { discipline: Discipline.ROAD, tier: 1 },
      seats: [
        seat('hyp-bla-1', 'black-arrow', 'Piers Wolverton', 'Great Britain', 'GBR'),
        seat('hyp-fur-1', 'furia', 'Carlo Guicciardi', 'Italy', 'ITA'),
        seat('hyp-nor-1', 'nordlicht', 'Henrik Stolzenberg', 'Germany', 'GER'),
        seat('hyp-hyp-1', 'hyperdrive', 'Grayson Whitfield', 'United States', 'USA'),
        seat('hyp-mir-1', 'mirage', 'Majid Al Hammadi', 'United Arab Emirates', 'UAE'),
        seat('hyp-kit-1', 'kitsune', 'Naoya Kurobe', 'Japan', 'JPN'),
      ],
      eligibility: { kind: 'cars', cars: ['rss_hyperion_2020'] },
      grid: { strength: -4 },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Invitational',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 210, day: 1 },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    { id: 'bahrain', name: 'Bahrain', track: { id: 'fn_bahrain', layout: 'gp' }, climate: Climate.ARID },
    {
      id: 'yas-marina',
      name: 'Yas Marina',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [90000, 63000, 45000, 34200, 26100, 19800, 14400, 10800, 7200, 4500],
    standings: [720000, 450000, 288000, 189000, 117000],
  },
};
