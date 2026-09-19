import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * DTM, 2021 - the first season on GT3 cars.
 *
 * RSS's GT-M Bayer V8, Lanzo V10 and Mercer V8 stand for the BMW, Lamborghini
 * and Mercedes that raced, and make up the spec. Five of eight weekends, each
 * a qualifying and a race on Saturday and again on Sunday: Monza, Zolder, the
 * Nurburgring's sprint circuit, the Red Bull Ring and Assen. The Lausitzring,
 * Hockenheim and the Norisring are not in Assetto Corsa.
 *
 * The real races run 55 minutes and a lap; Assetto Corsa times a race on a
 * server alone, so each is the 150 km that hour covers at GT3 pace.
 * Points are 25-18-15-12-10-8-6-4-2-1, and each qualifying pays 3-2-1. The
 * field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2021_Deutsche_Tourenwagen_Masters
 */
export const DTM_2021: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'dtm-2021',
  name: 'DTM 2021',
  description: 'The DTM\'s first GT3 season on RSS\'s GT-M cars: two qualifyings and two races a weekend '
    + 'at Monza, Zolder, the Nurburgring, the Red Bull Ring and Assen.',
  teams: [
    team('lausitz', 'Lausitz Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('franken', 'Frankenland Motorsport', 'Germany', 'GER', TeamBudget.WORKS),
    team('bodensee', 'Bodensee Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('allgaeu', 'Allgäu Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('tirol', 'Team Tirol', 'Austria', 'AUT', TeamBudget.INDEPENDENT),
    team('limburg', 'Limburg Racing', 'Netherlands', 'NED', TeamBudget.INDEPENDENT),
    team('ruhrpott', 'Ruhrpott Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('zuerichsee', 'Zürichsee Motorsport', 'Switzerland', 'SUI', TeamBudget.PRIVATEER),
    team('mosel', 'Mosel Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('nordsee', 'Nordsee Motorsport', 'Germany', 'GER', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'dtm',
      name: 'DTM',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('lau-1', 'lausitz', 'Marvin Kretschmar', 'Germany', 'GER'),
        seat('lau-2', 'lausitz', 'Luis Tempelhoff', 'Germany', 'GER'),
        seat('fra-1', 'franken', 'Dominik Schwertfeger', 'Germany', 'GER'),
        seat('fra-2', 'franken', 'Julian Obermaier', 'Germany', 'GER'),
        seat('bod-1', 'bodensee', 'Sandro Hepting', 'Germany', 'GER'),
        seat('bod-2', 'bodensee', 'Nils Wiedenmann', 'Germany', 'GER'),
        seat('all-1', 'allgaeu', 'Benedikt Zollhöfer', 'Germany', 'GER'),
        seat('all-2', 'allgaeu', 'Korbinian Rauscher', 'Germany', 'GER'),
        seat('tir-1', 'tirol', 'Lukas Hörtnagl', 'Austria', 'AUT'),
        seat('tir-2', 'tirol', 'Simon Kathrein', 'Austria', 'AUT'),
        seat('lim-1', 'limburg', 'Stijn Hendrikx', 'Netherlands', 'NED'),
        seat('lim-2', 'limburg', 'Luuk Ramaekers', 'Netherlands', 'NED'),
        seat('ruh-1', 'ruhrpott', 'Kai Brüninghaus', 'Germany', 'GER'),
        seat('ruh-2', 'ruhrpott', 'Dennis Kalwitz', 'Germany', 'GER'),
        seat('zue-1', 'zuerichsee', 'Reto Stutz', 'Switzerland', 'SUI'),
        seat('zue-2', 'zuerichsee', 'Cyrill Wettstein', 'Switzerland', 'SUI'),
        seat('mos-1', 'mosel', 'Philipp Trierweiler', 'Germany', 'GER'),
        seat('mos-2', 'mosel', 'Jan Reichertz', 'Germany', 'GER'),
        seat('nor-1', 'nordsee', 'Hauke Johannsen', 'Germany', 'GER'),
        seat('nor-2', 'nordsee', 'Ole Feddersen', 'Germany', 'GER'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.DTM_2021_RSS, minModels: 1 },
    },
  ],
  weekendFormats: [
    {
      id: 'race-weekend',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 45, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 1 },
        { type: 'race', name: 'Race 1', distance: 150, day: 1, inherit: { from: 'qualifying-1' } },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 2 },
        { type: 'race', name: 'Race 2', distance: 150, day: 2, inherit: { from: 'qualifying-2' } },
      ],
    },
  ],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    { id: 'zolder', name: 'Zolder', track: { id: 'rt_zolder' }, climate: Climate.TEMPERATE },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_sprint_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'red-bull-ring',
      name: 'Red Bull Ring',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'assen',
      name: 'Assen',
      track: { id: 'ne_ttassen', layout: 'autosport' },
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      qualifying: [3, 2, 1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 94, aiLevelMin: 86, aiAggression: 50 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 12000,
  prizes: {
    positions: [45000, 31500, 22500, 17100, 13050, 9900, 7200, 5400, 3600, 2250],
    standings: [360000, 225000, 144000, 94500, 58500],
  },
};
