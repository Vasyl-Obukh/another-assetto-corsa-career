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
 * and Mercedes that raced, and make up the spec. Five of eight events, each
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
  description: {
    en: 'The DTM\'s first GT3 season on RSS\'s GT-M cars: two qualifyings and two races a round '
      + 'at Monza, Zolder, the Nurburgring, the Red Bull Ring and Assen.',
    uk: 'Перший сезон DTM у класі GT3 на машинах GT-M від RSS: дві кваліфікації та дві гонки '
      + 'за етап у Монці, Золдері, на Нюрбургринзі, Ред Булл Рінгу та в Ассені.',
  },
  teams: [
    team('lausitz', 'Lausitz Racing', 'DEU', TeamBudget.WORKS),
    team('franken', 'Frankenland Motorsport', 'DEU', TeamBudget.WORKS),
    team('bodensee', 'Bodensee Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('allgaeu', 'Allgäu Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('tirol', 'Team Tirol', 'AUT', TeamBudget.INDEPENDENT),
    team('limburg', 'Limburg Racing', 'NLD', TeamBudget.INDEPENDENT),
    team('ruhrpott', 'Ruhrpott Racing', 'DEU', TeamBudget.PRIVATEER),
    team('zuerichsee', 'Zürichsee Motorsport', 'CHE', TeamBudget.PRIVATEER),
    team('mosel', 'Mosel Racing', 'DEU', TeamBudget.PRIVATEER),
    team('nordsee', 'Nordsee Motorsport', 'DEU', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'dtm',
      name: 'DTM',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('lau-1', 'lausitz', 'Marvin Kretschmar', 'DEU'),
        seat('lau-2', 'lausitz', 'Luis Tempelhoff', 'DEU'),
        seat('fra-1', 'franken', 'Dominik Schwertfeger', 'DEU'),
        seat('fra-2', 'franken', 'Julian Obermaier', 'DEU'),
        seat('bod-1', 'bodensee', 'Sandro Hepting', 'DEU'),
        seat('bod-2', 'bodensee', 'Nils Wiedenmann', 'DEU'),
        seat('all-1', 'allgaeu', 'Benedikt Zollhöfer', 'DEU'),
        seat('all-2', 'allgaeu', 'Korbinian Rauscher', 'DEU'),
        seat('tir-1', 'tirol', 'Lukas Hörtnagl', 'AUT'),
        seat('tir-2', 'tirol', 'Simon Kathrein', 'AUT'),
        seat('lim-1', 'limburg', 'Stijn Hendrikx', 'NLD'),
        seat('lim-2', 'limburg', 'Luuk Ramaekers', 'NLD'),
        seat('ruh-1', 'ruhrpott', 'Kai Brüninghaus', 'DEU'),
        seat('ruh-2', 'ruhrpott', 'Dennis Kalwitz', 'DEU'),
        seat('zue-1', 'zuerichsee', 'Reto Stutz', 'CHE'),
        seat('zue-2', 'zuerichsee', 'Cyrill Wettstein', 'CHE'),
        seat('mos-1', 'mosel', 'Philipp Trierweiler', 'DEU'),
        seat('mos-2', 'mosel', 'Jan Reichertz', 'DEU'),
        seat('nor-1', 'nordsee', 'Hauke Johannsen', 'DEU'),
        seat('nor-2', 'nordsee', 'Ole Feddersen', 'DEU'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.DTM_2021_RSS },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
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
  defaultEventFormat: 'standard',
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
  grid: { strength: 2, aggression: 20 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 12000,
  prizes: {
    positions: [45000, 31500, 22500, 17100, 13050, 9900, 7200, 5400, 3600, 2250],
    standings: [360000, 225000, 144000, 94500, 58500],
  },
};
