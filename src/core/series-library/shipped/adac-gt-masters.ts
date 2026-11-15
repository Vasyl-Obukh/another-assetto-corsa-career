import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * ADAC GT Masters - Germany's GT3 championship, on LFM's GT3 cars.
 *
 * Two races a round, each an hour less five minutes from a qualifying of its
 * own, with a compulsory stop and driver change that cannot be said yet. The
 * calendar is the circuits the series races that Assetto Corsa has -
 * Zandvoort, the Nurburgring, the Sachsenring, the Red Bull Ring,
 * Oschersleben, the Lausitzring and Hockenheim - rather than one season's,
 * which was not checked.
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
  description: {
    en: 'Germany\'s GT3 championship on LFM\'s GT3 cars: two 55-minute races a round at '
      + 'Zandvoort, the Nurburgring, the Sachsenring, the Red Bull Ring, Oschersleben, the '
      + 'Lausitzring and Hockenheim.',
    uk: 'Німецький чемпіонат GT3 на машинах GT3 від LFM: дві 55-хвилинні гонки за етап у '
      + 'Зандворті, на Нюрбургринзі, Заксенринзі, Ред Булл Рінгу, в Ошерслебені, на Лаузіцринзі '
      + 'та в Хоккенхаймі.',
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
  ],
  entries: [
    {
      id: 'gt3',
      name: 'GT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
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
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_LFM },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
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
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: recommendedTrack('zandvoort/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: recommendedTrack('nurburgring/gp-gt'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sachsenring',
      name: 'Sachsenring',
      track: recommendedTrack('sachsenring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'red-bull-ring',
      name: 'Red Bull Ring',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'oschersleben',
      name: 'Oschersleben',
      track: recommendedTrack('oschersleben/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'lausitzring',
      name: 'Lausitzring',
      track: recommendedTrack('lausitzring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hockenheim',
      name: 'Hockenheim',
      track: recommendedTrack('hockenheim/gp'),
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
