import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * DTM, 2018 - the last season before Class 1, on URD's T5 cars.
 *
 * The DTM 2018 (URD) spec is URD's T5 2018 Aura, Bayro and Maures, standing
 * for the Audi RS 5, the BMW M4 and the Mercedes-AMG C 63 that raced, six of
 * each as the real field was. All ten events, each a qualifying and a race on
 * Saturday and again on Sunday: Hockenheim to open and close, the
 * Lausitzring, the Hungaroring, the Norisring, Zandvoort, Brands Hatch's
 * Grand Prix circuit, Misano, the Nurburgring's sprint circuit and the Red
 * Bull Ring.
 *
 * The real races run 55 minutes and a lap; Assetto Corsa times a race on a
 * server alone, so each is the 150 km that hour covers. Points are
 * 25-18-15-12-10-8-6-4-2-1, and each qualifying pays 3-2-1. The field is
 * invented, DTM 2021's.
 *
 * Source: https://en.wikipedia.org/wiki/2018_Deutsche_Tourenwagen_Masters
 */
export const DTM_2018: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'dtm-2018',
  name: 'DTM 2018',
  description: {
    en: 'The 2018 DTM season on URD\'s T5 2018 cars: two qualifyings and two races a round at all '
      + 'ten events, Brands Hatch and Misano among them.',
    uk: 'Сезон DTM 2018 року на машинах T5 2018 від URD: дві кваліфікації та дві гонки за етап на '
      + 'всіх десяти етапах, серед них Брендс-Гетч і Мізано.',
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
      ],
      eligibility: { kind: 'spec', spec: CarSpec.DTM_2018_URD },
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
    {
      id: 'hockenheim',
      name: 'Hockenheim',
      track: recommendedTrack('hockenheim/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'lausitzring',
      name: 'Lausitzring',
      track: recommendedTrack('lausitzring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hungaroring',
      name: 'Hungaroring',
      track: recommendedTrack('hungaroring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'norisring',
      name: 'Norisring',
      track: recommendedTrack('norisring/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: recommendedTrack('zandvoort/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: recommendedTrack('brands-hatch/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'misano',
      name: 'Misano',
      track: recommendedTrack('misano/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: recommendedTrack('nurburgring/sprint-gt'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'red-bull-ring',
      name: 'Red Bull Ring',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hockenheim-final',
      name: 'Hockenheim, finale',
      track: recommendedTrack('hockenheim/gp'),
      climate: Climate.TEMPERATE,
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
  grid: { aggression: 20 },
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
