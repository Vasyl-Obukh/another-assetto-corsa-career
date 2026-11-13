import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * DTM, 2025 - on RSS's GT-M cars.
 *
 * The DTM 2025 (RSS) spec is RSS's GT-M cars standing for the nine makes that
 * raced; the same season on LFM's real GT3 cars is a championship of its own.
 * Four of eight events, each a qualifying and a race on Saturday and again
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
export const DTM_2025_RSS: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'dtm-2025-rss',
  name: 'DTM 2025 (RSS)',
  description: {
    en: 'The 2025 DTM season on RSS\'s GT-M cars: two qualifyings and two races a round at '
      + 'Zandvoort, the Nurburgring, the Sachsenring and the Red Bull Ring.',
    uk: 'Сезон DTM 2025 року на машинах GT-M від RSS: дві кваліфікації та дві гонки за етап у '
      + 'Зандворті, на Нюрбургринзі, Заксенринзі та Ред Булл Рінгу.',
  },
  teams: [
    team('elbe', 'Elbe Racing', 'DEU', TeamBudget.WORKS),
    team('pfalz', 'Pfalz Motorsport', 'DEU', TeamBudget.WORKS),
    team('harz', 'Harz Racing', 'DEU', TeamBudget.WORKS),
    team('spreewald', 'Spreewald Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('salzach', 'Salzach Racing', 'AUT', TeamBudget.INDEPENDENT),
    team('twente', 'Twente Motorsport', 'NLD', TeamBudget.INDEPENDENT),
    team('saarland', 'Saarland Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('graubuenden', 'Graubünden Racing', 'CHE', TeamBudget.PRIVATEER),
    team('erzgebirge', 'Erzgebirge Motorsport', 'DEU', TeamBudget.PRIVATEER),
    team('holstein', 'Holstein Racing', 'DEU', TeamBudget.PRIVATEER),
    team('oberland', 'Oberland Racing', 'DEU', TeamBudget.PRIVATEER),
    team('jutland', 'Jutland Racing', 'DNK', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'dtm',
      name: 'DTM',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('elb-1', 'elbe', 'Leon Dahlbeck', 'DEU'),
        seat('elb-2', 'elbe', 'Finn Wiesendahl', 'DEU'),
        seat('pfa-1', 'pfalz', 'Maximilian Hauenstein', 'DEU'),
        seat('pfa-2', 'pfalz', 'Jannik Wachtel', 'DEU'),
        seat('har-1', 'harz', 'Tom Brockelmann', 'DEU'),
        seat('har-2', 'harz', 'Nico Barthold', 'DEU'),
        seat('spr-1', 'spreewald', 'Paul Kossack', 'DEU'),
        seat('spr-2', 'spreewald', 'Erik Schlabitz', 'DEU'),
        seat('sal-1', 'salzach', 'Mathias Holzleitner', 'AUT'),
        seat('sal-2', 'salzach', 'Jonas Hofbauer', 'AUT'),
        seat('twe-1', 'twente', 'Jesse Nijhuis', 'NLD'),
        seat('twe-2', 'twente', 'Ruben Kampman', 'NLD'),
        seat('saa-1', 'saarland', 'Christian Merziger', 'DEU'),
        seat('saa-2', 'saarland', 'Pascal Dillinger', 'DEU'),
        seat('gra-1', 'graubuenden', 'Gian-Luca Caduff', 'CHE'),
        seat('gra-2', 'graubuenden', 'Andri Cathomen', 'CHE'),
        seat('erz-1', 'erzgebirge', 'Tino Uhlig', 'DEU'),
        seat('erz-2', 'erzgebirge', 'Rico Seiffert', 'DEU'),
        seat('hol-1', 'holstein', 'Bjarne Thießen', 'DEU'),
        seat('hol-2', 'holstein', 'Malte Rixen', 'DEU'),
        seat('obe-1', 'oberland', 'Quirin Stadler', 'DEU'),
        seat('obe-2', 'oberland', 'Vitus Wallner', 'DEU'),
        seat('jut-1', 'jutland', 'Anders Kjeldgaard', 'DNK'),
        seat('jut-2', 'jutland', 'Emil Toftegaard', 'DNK'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.DTM_2025_RSS },
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
