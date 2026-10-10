import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Audi Sport TT Cup, 2016 - the DTM's one-make support series, on Ready to
 * Race's Audi TT Cup.
 *
 * Two thirty-minute races a meeting. Four of the season's seven meetings are
 * raced: the Nurburgring twice, Zandvoort and the Hungaroring; Hockenheim, the
 * Norisring and the Moscow Raceway are not in Assetto Corsa. Points are the
 * series' 25-21-18-16-14 table down to eighteenth. Zandvoort's eighteen boxes
 * cap the grid. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2016_Audi_Sport_TT_Cup
 */
export const AUDI_TT_CUP_2016: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'audi-tt-cup-2016',
  name: 'Audi Sport TT Cup 2016',
  description: 'The DTM\'s one-make support series on the Audi TT Cup: two thirty-minute races a meeting,'
    + ' four of the 2016 season\'s meetings.',
  teams: [
    team('ingolstadt-tt', 'Altmühl Racing', 'DEU', TeamBudget.WORKS),
    team('tt-junior', 'Juniorteam Donau', 'DEU', TeamBudget.INDEPENDENT),
    team('tt-nordic', 'Nordic TT Racing', 'SWE', TeamBudget.PRIVATEER),
    team('tt-benelux', 'Benelux TT', 'NLD', TeamBudget.PRIVATEER),
    team('tt-uk', 'Wessex TT Racing', 'GBR', TeamBudget.PRIVATEER),
    team('tt-alpen', 'Alpen TT', 'CHE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'tt-cup',
      name: 'TT Cup',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('alt-1', 'ingolstadt-tt', 'Jannis Wolkersdorfer', 'DEU'),
        seat('alt-2', 'ingolstadt-tt', 'Mia Lechleitner', 'DEU'),
        seat('alt-3', 'ingolstadt-tt', 'Timo Kargl', 'DEU'),
        seat('jun-1', 'tt-junior', 'Fabian Rottmann', 'DEU'),
        seat('jun-2', 'tt-junior', 'Noah Eisele', 'DEU'),
        seat('jun-3', 'tt-junior', 'Leonie Birkhofer', 'DEU'),
        seat('nor-1', 'tt-nordic', 'Viktor Lindgren', 'SWE'),
        seat('nor-2', 'tt-nordic', 'Albin Sjöqvist', 'SWE'),
        seat('ben-1', 'tt-benelux', 'Dirk-Jan Vosselman', 'NLD'),
        seat('ben-2', 'tt-benelux', 'Pieter Callewaert', 'NLD'),
        seat('wes-1', 'tt-uk', 'Ollie Brankstone', 'GBR'),
        seat('wes-2', 'tt-uk', 'Jack Tremlett', 'GBR'),
        seat('alp-1', 'tt-alpen', 'Jonas Bättig', 'CHE'),
        seat('alp-2', 'tt-alpen', 'Nicolas Rochat', 'CHE'),
        seat('alp-3', 'tt-alpen', 'Luca Tognetti', 'CHE'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_audi_tt_cup'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Race meeting',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        { type: 'race', name: 'Race 1', distance: 70, day: 0, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 70, day: 1, inherit: { from: 'qualifying' } },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'nurburgring-1',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    { id: 'zandvoort', name: 'Zandvoort', track: { id: 'ks_zandvoort' }, climate: Climate.TEMPERATE },
    {
      id: 'nurburgring-2',
      name: 'Nurburgring II',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    { id: 'hungaroring', name: 'Hungaroring', track: { id: 'rt_hungaroring' }, climate: Climate.TEMPERATE },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 21, 18, 16, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -4, aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1800,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
