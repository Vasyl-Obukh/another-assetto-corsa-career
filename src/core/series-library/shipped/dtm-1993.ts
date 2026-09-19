import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * DTM, 1993 - the first Class 1 season, the one the Alfa 155 won.
 *
 * 1993 is the season all three cars of the spec raced together: the Alfa
 * Romeo 155 V6 Ti, the Mercedes 190E Evo II, and privately entered BMW M3 Sport
 * Evolutions. The M3 is base content and the other two are Dream Pack 1, so the
 * championship runs on the base game - on a grid of M3s - and fills out with
 * the Alfa and the Mercedes for anyone who owns the pack.
 *
 * Two heats a meeting, each paying 20-15-12-10-8-6-4-3-2-1. Zolder opened the
 * season and the Nurburgring hosted two rounds; Zandvoort, Spa and Silverstone
 * stand in for Hockenheim, the Norisring, Donington and the airfield rounds,
 * which are not in Assetto Corsa. Both heats line up on qualifying and run
 * 25 minutes, which is an assumption: the sources found give the points and the
 * calendar but not the heats' length or grids. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/1993_Deutsche_Tourenwagen_Meisterschaft
 */
export const DTM_1993: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'dtm-1993',
  name: 'DTM 1993',
  description: 'The first Class 1 season, raced in two heats a meeting. It runs on the base game\'s BMW '
    + 'M3 Sport Evolution, and the Alfa 155 and Mercedes 190E join the grid if you own Dream Pack 1.',
  teams: [
    team('stern', 'Stern Tourenwagen', 'Germany', 'GER', TeamBudget.WORKS),
    team('biscione', 'Squadra Biscione', 'Italy', 'ITA', TeamBudget.WORKS),
    team('weiss-blau', 'Weiß-Blau Motorsport', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('rheinland', 'Rheinland Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('wien', 'Team Wienerwald', 'Austria', 'AUT', TeamBudget.PRIVATEER),
    team('limburg', 'Limburg Tourenwagen', 'Netherlands', 'NED', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'class-1',
      name: 'Class 1',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('ste-1', 'stern', 'Joachim Brückmann', 'Germany', 'GER'),
        seat('ste-2', 'stern', 'Rüdiger Kallenbach', 'Germany', 'GER'),
        seat('ste-3', 'stern', 'Henning Ostheim', 'Germany', 'GER'),
        seat('bis-1', 'biscione', 'Nicola Lanzoni', 'Italy', 'ITA'),
        seat('bis-2', 'biscione', 'Sandro Pellizzari', 'Italy', 'ITA'),
        seat('bis-3', 'biscione', 'Giorgio Frassinetti', 'Italy', 'ITA'),
        seat('wbm-1', 'weiss-blau', 'Johannes Ebner', 'Germany', 'GER'),
        seat('wbm-2', 'weiss-blau', 'Kurt Thalhammer', 'Germany', 'GER'),
        seat('rhe-1', 'rheinland', 'Ralf Oberdorf', 'Germany', 'GER'),
        seat('rhe-2', 'rheinland', 'Marco Werninghaus', 'Germany', 'GER'),
        seat('wie-1', 'wien', 'Harald Gruber', 'Austria', 'AUT'),
        seat('wie-2', 'wien', 'Peter Zellhofer', 'Austria', 'AUT'),
        seat('lim-1', 'limburg', 'Jos Vranken', 'Netherlands', 'NED'),
        seat('lim-2', 'limburg', 'Frans Coolsaet', 'Belgium', 'BEL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.DTM_1993, minModels: 1 },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race meeting',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        {
          type: 'race', name: 'Heat 1', distance: 65, day: 1, inherit: { from: 'qualifying' },
        },
        {
          type: 'race', name: 'Heat 2', distance: 65, day: 1, inherit: { from: 'qualifying' },
        },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'zolder',
      name: 'Zolder',
      track: { id: 'rt_zolder' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_sprint_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'ks_zandvoort' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spa',
      name: 'Spa-Francorchamps',
      track: { id: 'spa' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone',
      name: 'Silverstone National',
      track: { id: 'ks_silverstone', layout: 'national' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring-gp',
      name: 'Nurburgring GP',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Heat points', positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 94, aiLevelMin: 86, aiAggression: 50 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 6000,
  prizes: {
    positions: [20000, 14000, 10000, 7500, 5500, 4000, 3000, 2200, 1500, 800],
    standings: [140000, 85000, 55000, 36000, 22000],
  },
};
