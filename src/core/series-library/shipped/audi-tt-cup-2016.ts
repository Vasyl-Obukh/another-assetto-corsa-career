import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Audi Sport TT Cup, 2016 - the DTM's one-make support series, on Ready to
 * Race's Audi TT Cup.
 *
 * Two thirty-minute races a meeting, at all seven of the season's meetings:
 * Hockenheim to open and close, the Nurburgring twice, the Norisring,
 * Zandvoort and the Hungaroring. Points are the series' 25-21-18-16-14 table
 * down to eighteenth. Zandvoort's eighteen boxes cap the grid. The field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/2016_Audi_Sport_TT_Cup
 */
export const AUDI_TT_CUP_2016: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'audi-tt-cup-2016',
  name: 'Audi Sport TT Cup 2016',
  description: {
    en: 'The DTM\'s one-make support series on the Audi TT Cup: two thirty-minute races a meeting,'
      + ' at all seven of the 2016 season\'s meetings.',
    uk: 'Монокубок підтримки DTM на Audi TT Cup: дві тридцятихвилинні гонки за етап, '
      + 'на всіх семи етапах сезону 2016 року.',
  },
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
      id: 'hockenheim',
      name: 'Hockenheim',
      track: recommendedTrack('hockenheim/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nurburgring-1',
      name: 'Nurburgring',
      track: recommendedTrack('nurburgring/gp-gt'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'norisring',
      name: 'Norisring',
      track: recommendedTrack('norisring/full'),
      climate: Climate.TEMPERATE,
    },
    { id: 'zandvoort', name: 'Zandvoort', track: recommendedTrack('zandvoort/gp-1999'), climate: Climate.TEMPERATE },
    {
      id: 'nurburgring-2',
      name: 'Nurburgring II',
      track: recommendedTrack('nurburgring/gp-gt'),
      climate: Climate.TEMPERATE,
    },
    { id: 'hungaroring', name: 'Hungaroring', track: recommendedTrack('hungaroring/gp'), climate: Climate.TEMPERATE },
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
      positions: [25, 21, 18, 16, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1800,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
