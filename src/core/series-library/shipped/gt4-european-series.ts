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
 * any three to a grid. Two hour-long races a weekend, each from a qualifying
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
  description: 'Europe\'s GT4 championship on Guerilla\'s GT4 cars: two one-hour races a weekend at six of'
    + ' the GT World Challenge circuits.',
  teams: [
    team('hanse', 'Hanse Motorsport', 'Germany', 'GER', TeamBudget.WORKS),
    team('westfalen', 'Westfalen Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('sauerland', 'Sauerland GT', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('niederrhein', 'Niederrhein Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('frankenwald', 'Frankenwald GT', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('rhoen', 'Rhön Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('ostsee', 'Ostsee Motorsport', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('uckermark', 'Uckermark Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('breisgau', 'Breisgau Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('chiemgau', 'Chiemgau Motorsport', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('vorarlberg', 'Vorarlberg Racing', 'Austria', 'AUT', TeamBudget.PRIVATEER),
    team('limmat', 'Limmat Racing', 'Switzerland', 'SUI', TeamBudget.PRIVATEER),
    team('brabant', 'Brabant GT4', 'Belgium', 'BEL', TeamBudget.PRIVATEER),
    team('costa-brava', 'Costa Brava Racing', 'Spain', 'ESP', TeamBudget.PRIVATEER),
    team('highland-gt', 'Highland GT', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('provence-gt', 'Provence GT', 'France', 'FRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt4',
      name: 'GT4',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('han-1', 'hanse', 'Jannis Brocksieper', 'Germany', 'GER'),
        seat('han-2', 'hanse', 'Lukas Heinsohn', 'Germany', 'GER'),
        seat('wes-1', 'westfalen', 'Marco Tenhagen', 'Germany', 'GER'),
        seat('wes-2', 'westfalen', 'Felix Brüggemeier', 'Germany', 'GER'),
        seat('sau-1', 'sauerland', 'Tim Plettenberg', 'Germany', 'GER'),
        seat('sau-2', 'sauerland', 'Robin Kückelhaus', 'Germany', 'GER'),
        seat('nie-1', 'niederrhein', 'Kevin Terhorst', 'Germany', 'GER'),
        seat('nie-2', 'niederrhein', 'Nils Verhoeven', 'Germany', 'GER'),
        seat('fra-1', 'frankenwald', 'Simon Kraußer', 'Germany', 'GER'),
        seat('fra-2', 'frankenwald', 'Jonas Pfeufer', 'Germany', 'GER'),
        seat('rho-1', 'rhoen', 'Florian Gensler', 'Germany', 'GER'),
        seat('rho-2', 'rhoen', 'Max Hohmeier', 'Germany', 'GER'),
        seat('ost-1', 'ostsee', 'Arne Kleinfeldt', 'Germany', 'GER'),
        seat('ost-2', 'ostsee', 'Torben Wendorf', 'Germany', 'GER'),
        seat('uck-1', 'uckermark', 'Erik Lindenau', 'Germany', 'GER'),
        seat('uck-2', 'uckermark', 'Paul Warnecke', 'Germany', 'GER'),
        seat('bre-1', 'breisgau', 'Dominik Hugenschmidt', 'Germany', 'GER'),
        seat('bre-2', 'breisgau', 'Fabian Zängerle', 'Germany', 'GER'),
        seat('chi-1', 'chiemgau', 'Anton Seidlmeier', 'Germany', 'GER'),
        seat('chi-2', 'chiemgau', 'Georg Winkelhofer', 'Germany', 'GER'),
        seat('vor-1', 'vorarlberg', 'Philipp Nägele', 'Austria', 'AUT'),
        seat('vor-2', 'vorarlberg', 'Manuel Bereuter', 'Austria', 'AUT'),
        seat('lim-1', 'limmat', 'Joel Frischknecht', 'Switzerland', 'SUI'),
        seat('lim-2', 'limmat', 'Nico Stäheli', 'Switzerland', 'SUI'),
        seat('brb-1', 'brabant', 'Wout Vermassen', 'Belgium', 'BEL'),
        seat('brb-2', 'brabant', 'Joren Claessens', 'Belgium', 'BEL'),
        seat('cbr-1', 'costa-brava', 'Pol Serrallonga', 'Spain', 'ESP'),
        seat('cbr-2', 'costa-brava', 'Arnau Vidalet', 'Spain', 'ESP'),
        seat('hgt-1', 'highland-gt', 'Hamish Rennie', 'Great Britain', 'GBR'),
        seat('hgt-2', 'highland-gt', 'Angus Moodie', 'Great Britain', 'GBR'),
        seat('pgt-1', 'provence-gt', 'Lucas Amalric', 'France', 'FRA'),
        seat('pgt-2', 'provence-gt', 'Théo Barjavel', 'France', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT4, minModels: 3 },
    },
  ],
  weekendFormats: [
    {
      id: 'race-weekend',
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
  defaultWeekendFormat: 'race-weekend',
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
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 7000,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
    standings: [200000, 125000, 80000, 52500, 32500],
  },
};
