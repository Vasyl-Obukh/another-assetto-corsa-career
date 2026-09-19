import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * ADAC GT Masters - Germany's GT3 championship, on LFM's GT3 cars.
 *
 * Two races a weekend, each an hour less five minutes from a qualifying of its
 * own, with a compulsory stop and driver change that cannot be said yet. The
 * calendar is the circuits the series races that Assetto Corsa has -
 * Zandvoort, the Nurburgring, the Sachsenring and the Red Bull Ring - rather
 * than one season's, which was not checked; Oschersleben, the Lausitzring and
 * Hockenheim are not in Assetto Corsa.
 *
 * Points are 25-20-16-13-11-10-9-8-7-6-5-4-3-2-1 a race, the table as
 * understood rather than checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/ADAC_GT_Masters
 */
export const ADAC_GT_MASTERS: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'adac-gt-masters',
  name: 'ADAC GT Masters',
  description: 'Germany\'s GT3 championship on LFM\'s GT3 cars: two 55-minute races a weekend at '
    + 'Zandvoort, the Nurburgring, the Sachsenring and the Red Bull Ring.',
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
  ],
  entries: [
    {
      id: 'gt3',
      name: 'GT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
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
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_LFM, minModels: 3 },
    },
  ],
  weekendFormats: [
    {
      id: 'race-weekend',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 1 },
        { type: 'race', name: 'Race 1', distance: 145, day: 1, inherit: { from: 'qualifying-1' } },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 2 },
        { type: 'race', name: 'Race 2', distance: 145, day: 2, inherit: { from: 'qualifying-2' } },
      ],
    },
  ],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'zandvoort2023', layout: '2023' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sachsenring',
      name: 'Sachsenring',
      track: { id: 'g333_sachsenring_2022', layout: 'lfm_event' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'red-bull-ring',
      name: 'Red Bull Ring',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 93, aiLevelMin: 85, aiAggression: 45 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
