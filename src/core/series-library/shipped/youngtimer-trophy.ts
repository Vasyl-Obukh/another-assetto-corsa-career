import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Youngtimer Trophy - today's club championship for the touring cars of the
 * seventies and eighties.
 *
 * Germany's Youngtimer Trophy races saloons from the late sixties to the late
 * eighties, the Escort RS1600 and the Group A BMW M3 among them, in two 30-minute
 * heats a meeting. The two cars race as two classes, which is how the series
 * separates eras, rather than being balanced against each other. It stands on
 * a real championship of now for cars of then, which is why it starts switched
 * off with the seasons those cars raced.
 *
 * The Nurburgring is its home and Zolder its other regular circuit; Spa and
 * Zandvoort round the season out, since no single year's calendar was found.
 * The field is invented, and the points are the 25-18-15 scale: the series' own
 * table was not found.
 *
 * Source: https://nuerburgringclassic.de/en/participate/youngtimer-trophy-en.html
 */
export const YOUNGTIMER_TROPHY: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'youngtimer-trophy',
  name: 'Youngtimer Trophy',
  description: 'Today\'s club championship for seventies and eighties saloons: the Escort RS1600 and the '
    + 'Group A M3 as two classes, in two 30-minute heats a meeting.',
  teams: [
    team('eifel', 'Eifel Youngtimer Team', 'DEU', TeamBudget.INDEPENDENT),
    team('rotterdam', 'Maasvlakte Classic Racing', 'NLD', TeamBudget.PRIVATEER),
    team('rs-heritage', 'RS Heritage', 'GBR', TeamBudget.PRIVATEER),
    team('bayern-classic', 'Isartal Classic Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('ardennes-classic', 'Ardennes Anciennes', 'BEL', TeamBudget.PRIVATEER),
    team('sauerland', 'Sauerland Tourenwagen', 'DEU', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-a',
      name: 'Group A',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('gra-bay-1', 'bayern-classic', 'Stefan Reichenbach', 'DEU'),
        seat('gra-bay-2', 'bayern-classic', 'Uwe Kirchgässner', 'DEU'),
        seat('gra-eif-1', 'eifel', 'Norbert Schallenberg', 'DEU'),
        seat('gra-sau-1', 'sauerland', 'Frank Heimbüchel', 'DEU'),
        seat('gra-rot-1', 'rotterdam', 'Hans Verkerk', 'NLD'),
        seat('gra-ard-1', 'ardennes-classic', 'Luc Gheysens', 'BEL'),
        seat('gra-rs-1', 'rs-heritage', 'Graham Tulloch', 'GBR'),
        seat('gra-sau-2', 'sauerland', 'Jürgen Plettenberg', 'DEU'),
        seat('gra-ard-2', 'ardennes-classic', 'Pierre Mottet', 'BEL'),
      ],
      eligibility: { kind: 'cars', cars: ['bmw_m3_e30_gra'] },
    },
    {
      id: 'escort',
      name: 'RS1600',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('rs-rs-1', 'rs-heritage', 'Colin Brabazon', 'GBR'),
        seat('rs-rs-2', 'rs-heritage', 'Derek Fenwick', 'GBR'),
        seat('rs-eif-1', 'eifel', 'Manfred Oberbach', 'DEU'),
        seat('rs-eif-2', 'eifel', 'Klaus-Dieter Wessel', 'DEU'),
        seat('rs-rot-1', 'rotterdam', 'Kees Brouwer', 'NLD'),
        seat('rs-rot-2', 'rotterdam', 'Wim Terpstra', 'NLD'),
        seat('rs-bay-1', 'bayern-classic', 'Sepp Ahammer', 'DEU'),
        seat('rs-ard-1', 'ardennes-classic', 'Freddy Lambotte', 'BEL'),
        seat('rs-sau-1', 'sauerland', 'Achim Brockhaus', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_ford_escort_mk1'] },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race meeting',
      sessions: [
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        {
          id: 'heat-1',
          type: 'race',
          name: 'Heat 1',
          distance: 65,
          day: 0,
          inherit: { from: 'qualifying' },
        },
        {
          type: 'race', name: 'Heat 2', distance: 65, day: 1, inherit: { from: 'heat-1' },
        },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'zolder',
      name: 'Zolder',
      track: { id: 'rt_zolder' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: 'Spa-Francorchamps',
      track: { id: 'spa' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'ks_zandvoort' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nurburgring-finale',
      name: 'Nurburgring Finale',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -3, aggression: 10 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1500,
  prizes: {
    positions: [4500, 3100, 2200, 1700, 1200, 900, 650, 450, 300, 150],
    standings: [32000, 19000, 13000, 8500, 5500],
  },
};
