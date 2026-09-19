import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * VLN Langstreckenmeisterschaft, 2004 - the Nordschleife's endurance series,
 * and the 24 Hours it builds to.
 *
 * Three of its classes on the cars of the era the catalogue has: SP8 for the
 * big GTs, the GT1 (2000s) spec; SP7 for Guerilla's E46 GTR with RSS's 911 and
 * 360; and Guerilla's Skyline R34 built for the 24 Hours, on its own. The
 * class names follow the VLN's scheme but the cars' placing in it is
 * approximate. Nine four-hour races and the six-hour Ruhr-Pokal-Rennen at
 * round seven, where the real season ran it, on the endurance-cup layout, with
 * the 24 Hours on the full endurance layout between the third and fourth - the
 * calendar's shape as the modern series runs it, not 2004's checked dates.
 * Each race runs its own round's real 2004 lap count. Dream Pack 1's Nordschleife only has twenty-four boxes, which
 * cap a grid that ran past two hundred.
 *
 * The VLN scores by class and class size, which a points system cannot say;
 * the 25-18-15 scale stands in, by class. The field is invented, and is the
 * same Nordschleife paddock as the modern series'.
 *
 * Source: https://en.wikipedia.org/wiki/Nurburgring_Langstrecken-Serie
 */
export const VLN_2004: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'vln-2004',
  name: 'VLN 2004',
  description: 'The Nordschleife\'s endurance series of 2004 on RSS\'s and Guerilla\'s cars: the big GTs, '
    + 'the E46 GTR\'s class and the N24 Skyline, ten VLN races and the 24 Hours.',
  teams: [
    team('eifel-gt', 'Eifelwind Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('hohe-acht', 'Hohe Acht Motorsport', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('brunnchen', 'Brünnchen Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('pflanzgarten', 'Team Pflanzgarten', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('karussell', 'Karussell Motorsport', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('adenau', 'Adenau Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('flemish-ring', 'Vlaamse Ring Racing', 'Belgium', 'BEL', TeamBudget.PRIVATEER),
    team('ring-nl', 'Groene Hel Racing', 'Netherlands', 'NED', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'sp8',
      name: 'SP8',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('sp8-eif-1', 'eifel-gt', 'Sven Mertesacker', 'Germany', 'GER'),
        seat('sp8-eif-2', 'eifel-gt', 'Jan Kowalewski', 'Germany', 'GER'),
        seat('sp8-hoh-1', 'hohe-acht', 'Patrick Welzbacher', 'Germany', 'GER'),
        seat('sp8-hoh-2', 'hohe-acht', 'Robin Assmann', 'Germany', 'GER'),
        seat('sp8-bru-1', 'brunnchen', 'Tobias Leiendecker', 'Germany', 'GER'),
        seat('sp8-vla-1', 'flemish-ring', 'Kobe Verstraeten', 'Belgium', 'BEL'),
        seat('sp8-eif-b-1', 'eifel-gt', 'Benno Rathmann', 'Germany', 'GER'),
        seat('sp8-hoh-b-1', 'hohe-acht', 'Christoph Linnartz', 'Germany', 'GER'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT1_2000S, minModels: 2 },
    },
    {
      id: 'sp7',
      name: 'SP7',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('sp7-pfl-1', 'pflanzgarten', 'Marcel Lüthje', 'Germany', 'GER'),
        seat('sp7-pfl-2', 'pflanzgarten', 'Kevin Dreesen', 'Germany', 'GER'),
        seat('sp7-kar-1', 'karussell', 'Dennis Olbrich', 'Germany', 'GER'),
        seat('sp7-kar-2', 'karussell', 'Philipp Koenen', 'Germany', 'GER'),
        seat('sp7-ade-1', 'adenau', 'Jens Bleidorn', 'Germany', 'GER'),
        seat('sp7-ade-2', 'adenau', 'Anika Schroers', 'Germany', 'GER'),
        seat('sp7-grn-1', 'ring-nl', 'Wessel Ruijters', 'Netherlands', 'NED'),
        seat('sp7-grn-2', 'ring-nl', 'Bart Hendriksen', 'Netherlands', 'NED'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'gue_bmw_m3_e46_gtr',
          'rss_gtn_protech_96',
          'rss_gtn_ferruccio_36',
          'rss_gtn_furiano_36',
        ],
      },
      grid: { aiLevel: 90, aiLevelMin: 83 },
      prizes: {
        positions: [15000, 10500, 7500, 5700, 4350, 3300, 2400, 1800, 1200, 750],
        standings: [120000, 75000, 48000, 31500, 19500],
      },
    },
    {
      id: 'skyline',
      name: 'Skyline R34',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('sky-kar-1', 'karussell', 'Lennart Dahmen', 'Germany', 'GER'),
        seat('sky-kar-2', 'karussell', 'Yannik Stöckl', 'Germany', 'GER'),
        seat('sky-ade-1', 'adenau', 'Rolf Heinen', 'Germany', 'GER'),
        seat('sky-ade-2', 'adenau', 'Tim Schwadorf', 'Germany', 'GER'),
        seat('sky-vla-1', 'flemish-ring', 'Jens De Wulf', 'Belgium', 'BEL'),
        seat('sky-pfl-1', 'pflanzgarten', 'Ralf Bleckmann', 'Germany', 'GER'),
        seat('sky-grn-1', 'ring-nl', 'Stijn Molenaar', 'Netherlands', 'NED'),
        seat('sky-bru-1', 'brunnchen', 'Heiko Gehlen', 'Germany', 'GER'),
      ],
      eligibility: { kind: 'cars', cars: ['gue_nissan_skyline_r34_24h'] },
      grid: { aiLevel: 87, aiLevelMin: 80 },
      prizes: {
        positions: [9000, 6300, 4500, 3400, 2600, 2000, 1450, 1100, 700, 450],
        standings: [72000, 45000, 29000, 19000, 11500],
      },
    },
  ],
  weekendFormats: [
    {
      id: 'four-hours',
      name: 'Four hours',
      sessions: [
        { type: 'practice', name: 'Qualifying practice', minutes: 90, day: 0 },
        { id: 'race', type: 'race', name: '4 Hours', laps: 24, day: 0 },
      ],
    },
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Qualifying practice', minutes: 90, day: 0 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 39, day: 0 },
      ],
    },
    {
      id: 'twenty-four-hours',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 180, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 120, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 137, day: 2 },
      ],
    },
  ],
  defaultWeekendFormat: 'four-hours',
  rounds: [
    {
      id: 'vln-1',
      name: 'VLN 1',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-2',
      name: 'VLN 2',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      sessionLengths: [{ session: 'race', laps: 26 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-3',
      name: 'VLN 3',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      sessionLengths: [{ session: 'race', laps: 27 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'n24',
      name: 'Nurburgring 24 Hours',
      track: { id: 'ks_nordschleife', layout: 'endurance' },
      weekendFormat: 'twenty-four-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-4',
      name: 'VLN 4',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-5',
      name: 'VLN 5',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      sessionLengths: [{ session: 'race', laps: 25 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-6',
      name: 'VLN 6',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-7',
      name: 'VLN 6 Hours',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      weekendFormat: 'six-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-8',
      name: 'VLN 8',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-9',
      name: 'VLN 9',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vln-10',
      name: 'VLN 10',
      track: { id: 'ks_nordschleife', layout: 'endurance_cup' },
      sessionLengths: [{ session: 'race', laps: 27 }],
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 92, aiLevelMin: 84, aiAggression: 40 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 6000,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
    standings: [200000, 125000, 80000, 52500, 32500],
  },
};
