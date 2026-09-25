import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * DTM, 2025 - on LFM's GT3 cars.
 *
 * The DTM 2025 (LFM) spec is LFM's GT3 cars of the makes that raced; the same
 * season on RSS's GT-M cars is a championship of its own, with the same
 * invented field.
 * Four of eight weekends, each a qualifying and a race on Saturday and again
 * on Sunday: Zandvoort, the Nurburgring's sprint circuit, the Sachsenring and
 * the Red Bull Ring. Oschersleben, the Norisring, the Lausitzring and
 * Hockenheim are not in Assetto Corsa.
 *
 * The real races run 55 minutes and a lap; Assetto Corsa times a race on a
 * server alone, so each is the 150 km that hour covers at GT3 pace.
 * Points are 25-18-15-12-10-8-6-4-2-1, and each qualifying pays 3-2-1. The
 * field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2025_Deutsche_Tourenwagen_Masters
 */
export const DTM_2025_LFM: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'dtm-2025-lfm',
  name: 'DTM 2025 (LFM)',
  description: 'The 2025 DTM season on LFM\'s GT3 cars: two qualifyings and two races a weekend at '
    + 'Zandvoort, the Nurburgring, the Sachsenring and the Red Bull Ring.',
  teams: [
    team('elbe', 'Elbe Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('pfalz', 'Pfalz Motorsport', 'Germany', 'GER', TeamBudget.WORKS),
    team('harz', 'Harz Racing', 'Germany', 'GER', TeamBudget.WORKS),
    team('spreewald', 'Spreewald Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('salzach', 'Salzach Racing', 'Austria', 'AUT', TeamBudget.INDEPENDENT),
    team('twente', 'Twente Motorsport', 'Netherlands', 'NED', TeamBudget.INDEPENDENT),
    team('saarland', 'Saarland Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('graubuenden', 'Graubünden Racing', 'Switzerland', 'SUI', TeamBudget.PRIVATEER),
    team('erzgebirge', 'Erzgebirge Motorsport', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('holstein', 'Holstein Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('oberland', 'Oberland Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('jutland', 'Jutland Racing', 'Denmark', 'DEN', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'dtm',
      name: 'DTM',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('elb-1', 'elbe', 'Leon Dahlbeck', 'Germany', 'GER'),
        seat('elb-2', 'elbe', 'Finn Wiesendahl', 'Germany', 'GER'),
        seat('pfa-1', 'pfalz', 'Maximilian Hauenstein', 'Germany', 'GER'),
        seat('pfa-2', 'pfalz', 'Jannik Wachtel', 'Germany', 'GER'),
        seat('har-1', 'harz', 'Tom Brockelmann', 'Germany', 'GER'),
        seat('har-2', 'harz', 'Nico Barthold', 'Germany', 'GER'),
        seat('spr-1', 'spreewald', 'Paul Kossack', 'Germany', 'GER'),
        seat('spr-2', 'spreewald', 'Erik Schlabitz', 'Germany', 'GER'),
        seat('sal-1', 'salzach', 'Mathias Holzleitner', 'Austria', 'AUT'),
        seat('sal-2', 'salzach', 'Jonas Hofbauer', 'Austria', 'AUT'),
        seat('twe-1', 'twente', 'Jesse Nijhuis', 'Netherlands', 'NED'),
        seat('twe-2', 'twente', 'Ruben Kampman', 'Netherlands', 'NED'),
        seat('saa-1', 'saarland', 'Christian Merziger', 'Germany', 'GER'),
        seat('saa-2', 'saarland', 'Pascal Dillinger', 'Germany', 'GER'),
        seat('gra-1', 'graubuenden', 'Gian-Luca Caduff', 'Switzerland', 'SUI'),
        seat('gra-2', 'graubuenden', 'Andri Cathomen', 'Switzerland', 'SUI'),
        seat('erz-1', 'erzgebirge', 'Tino Uhlig', 'Germany', 'GER'),
        seat('erz-2', 'erzgebirge', 'Rico Seiffert', 'Germany', 'GER'),
        seat('hol-1', 'holstein', 'Bjarne Thießen', 'Germany', 'GER'),
        seat('hol-2', 'holstein', 'Malte Rixen', 'Germany', 'GER'),
        seat('obe-1', 'oberland', 'Quirin Stadler', 'Germany', 'GER'),
        seat('obe-2', 'oberland', 'Vitus Wallner', 'Germany', 'GER'),
        seat('jut-1', 'jutland', 'Anders Kjeldgaard', 'Denmark', 'DEN'),
        seat('jut-2', 'jutland', 'Emil Toftegaard', 'Denmark', 'DEN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.DTM_2025_LFM, minModels: 1 },
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
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'zandvoort2023', layout: '2023' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_sprint_b' },
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
