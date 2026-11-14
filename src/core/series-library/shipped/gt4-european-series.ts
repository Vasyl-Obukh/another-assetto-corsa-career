import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * GT4 European Series - the GT4 championship that supports GT World Challenge
 * Europe, on Guerilla's GT4 cars.
 *
 * The GT4 spec: Guerilla's seventeen GT4s, Kunos' Maserati and LFM's Supra,
 * any three to a grid. Two hour-long races a round, each from a qualifying
 * of its own, with a compulsory stop and driver change that cannot be said
 * yet. The calendar is the circuits the series races that Assetto Corsa has -
 * Brands Hatch, Monza, Spa, the Nurburgring, Zandvoort and Barcelona - rather
 * than one season's, which was not checked; Paul Ricard, Misano and Hockenheim
 * are not in Assetto Corsa. The Silver, Pro-Am and Am cups share one grid and
 * one class here, on LFM's large-box layouts; Brands Hatch's thirty-two boxes
 * cap a grid that runs past forty.
 *
 * The 25-18-15 scale scores each race, a stand-in: the series' own table was
 * not checked. The field is invented: the ADAC GT Masters paddock and four
 * more teams.
 *
 * Source: https://en.wikipedia.org/wiki/GT4_European_Series
 */
export const GT4_EUROPEAN_SERIES: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt4-european-series',
  name: 'GT4 European Series',
  description: {
    en: 'Europe\'s GT4 championship on Guerilla\'s GT4 cars: two one-hour races a round at six of'
      + ' the GT World Challenge circuits.',
    uk: 'Європейський чемпіонат GT4 на машинах GT4 від Guerilla: дві годинні гонки за етап на шести '
      + 'трасах GT World Challenge.',
  },
  teams: [
    team('hanse', 'Hanse Motorsport', 'DEU', TeamBudget.WORKS),
    team('westfalen', 'Westfalen Racing', 'DEU', TeamBudget.WORKS),
    team('sauerland', 'Sauerland GT', 'DEU', TeamBudget.INDEPENDENT),
    team('niederrhein', 'Niederrhein Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('frankenwald', 'Frankenwald GT', 'DEU', TeamBudget.INDEPENDENT),
    team('rhoen', 'Rhön Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('ostsee', 'Ostsee Motorsport', 'DEU', TeamBudget.PRIVATEER),
    team('uckermark', 'Uckermark Racing', 'DEU', TeamBudget.PRIVATEER),
    team('breisgau', 'Breisgau Racing', 'DEU', TeamBudget.PRIVATEER),
    team('chiemgau', 'Chiemgau Motorsport', 'DEU', TeamBudget.PRIVATEER),
    team('vorarlberg', 'Vorarlberg Racing', 'AUT', TeamBudget.PRIVATEER),
    team('limmat', 'Limmat Racing', 'CHE', TeamBudget.PRIVATEER),
    team('brabant', 'Brabant GT4', 'BEL', TeamBudget.PRIVATEER),
    team('costa-brava', 'Costa Brava Racing', 'ESP', TeamBudget.PRIVATEER),
    team('highland-gt', 'Highland GT', 'GBR', TeamBudget.PRIVATEER),
    team('provence-gt', 'Provence GT', 'FRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt4',
      name: 'GT4',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('han-1', 'hanse', 'Jannis Brocksieper', 'DEU'),
        seat('han-2', 'hanse', 'Lukas Heinsohn', 'DEU'),
        seat('wes-1', 'westfalen', 'Marco Tenhagen', 'DEU'),
        seat('wes-2', 'westfalen', 'Felix Brüggemeier', 'DEU'),
        seat('sau-1', 'sauerland', 'Tim Plettenberg', 'DEU'),
        seat('sau-2', 'sauerland', 'Robin Kückelhaus', 'DEU'),
        seat('nie-1', 'niederrhein', 'Kevin Terhorst', 'DEU'),
        seat('nie-2', 'niederrhein', 'Nils Verhoeven', 'DEU'),
        seat('fra-1', 'frankenwald', 'Simon Kraußer', 'DEU'),
        seat('fra-2', 'frankenwald', 'Jonas Pfeufer', 'DEU'),
        seat('rho-1', 'rhoen', 'Florian Gensler', 'DEU'),
        seat('rho-2', 'rhoen', 'Max Hohmeier', 'DEU'),
        seat('ost-1', 'ostsee', 'Arne Kleinfeldt', 'DEU'),
        seat('ost-2', 'ostsee', 'Torben Wendorf', 'DEU'),
        seat('uck-1', 'uckermark', 'Erik Lindenau', 'DEU'),
        seat('uck-2', 'uckermark', 'Paul Warnecke', 'DEU'),
        seat('bre-1', 'breisgau', 'Dominik Hugenschmidt', 'DEU'),
        seat('bre-2', 'breisgau', 'Fabian Zängerle', 'DEU'),
        seat('chi-1', 'chiemgau', 'Anton Seidlmeier', 'DEU'),
        seat('chi-2', 'chiemgau', 'Georg Winkelhofer', 'DEU'),
        seat('vor-1', 'vorarlberg', 'Philipp Nägele', 'AUT'),
        seat('vor-2', 'vorarlberg', 'Manuel Bereuter', 'AUT'),
        seat('lim-1', 'limmat', 'Joel Frischknecht', 'CHE'),
        seat('lim-2', 'limmat', 'Nico Stäheli', 'CHE'),
        seat('brb-1', 'brabant', 'Wout Vermassen', 'BEL'),
        seat('brb-2', 'brabant', 'Joren Claessens', 'BEL'),
        seat('cbr-1', 'costa-brava', 'Pol Serrallonga', 'ESP'),
        seat('cbr-2', 'costa-brava', 'Arnau Vidalet', 'ESP'),
        seat('hgt-1', 'highland-gt', 'Hamish Rennie', 'GBR'),
        seat('hgt-2', 'highland-gt', 'Angus Moodie', 'GBR'),
        seat('pgt-1', 'provence-gt', 'Lucas Amalric', 'FRA'),
        seat('pgt-2', 'provence-gt', 'Théo Barjavel', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT4 },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
        { type: 'race', name: 'Race 1', distance: 145, day: 1, inherit: { from: 'qualifying-1' } },
        { type: 'race', name: 'Race 2', distance: 145, day: 2, inherit: { from: 'qualifying-2' } },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: { id: 'ks_brands_hatch', layout: 'gp_osrw' },
      climate: Climate.OCEANIC,
    },
    { id: 'monza', name: 'Monza', track: { id: 'monza', layout: 'lfm' } },
    {
      id: 'spa',
      name: 'Spa-Francorchamps',
      track: { id: 'spa', layout: '2022_lfm_standing' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b_osrw_lfm_tracklimits' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'zandvoort2023', layout: '2023_lfm_v2' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'barcelona',
      name: 'Barcelona',
      track: { id: 'fn_barcelona', layout: 'barcelona_2023_48_pits_lfm_nodrs_v2' },
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -1, aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 7000,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
    standings: [200000, 125000, 80000, 52500, 32500],
  },
};
