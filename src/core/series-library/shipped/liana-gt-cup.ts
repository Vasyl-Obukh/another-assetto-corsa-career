import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Liana GT Cup - invented, for Guerilla's Liana GT V6 Cup.
 *
 * Liana is a maker of Guerilla's own imagining, and its GT V6 Cup is built for
 * a one-make series that does not exist - so this is made up and says so:
 * Italian circuits and short races, on the Trofeo Abarth 500's paddock.
 */
export const LIANA_GT_CUP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'liana-gt-cup',
  name: 'Liana GT Cup',
  description: 'Invented: a one-make cup for Guerilla\'s Liana GT V6 Cup, at Italian circuits.',
  teams: [
    team('torino', 'Torino Squadra Corse', 'ITA', TeamBudget.INDEPENDENT),
    team('scorpione', 'Scorpione Racing', 'ITA', TeamBudget.INDEPENDENT),
    team('romagna', 'Romagna Motorsport', 'ITA', TeamBudget.PRIVATEER),
    team('lario', 'Lario Corse', 'ITA', TeamBudget.PRIVATEER),
    team('ticino', 'Ticino Racing', 'CHE', TeamBudget.PRIVATEER),
    team('tramontana', 'Tramontana Sport', 'ESP', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'liana',
      name: 'Liana GT V6',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      seats: [
        seat('tor-1', 'torino', 'Alessio Ferrandi', 'ITA'),
        seat('tor-2', 'torino', 'Chiara Baldacci', 'ITA'),
        seat('tor-3', 'torino', 'Nicola Barberis', 'ITA'),
        seat('sco-1', 'scorpione', 'Mirko Zanchetta', 'ITA'),
        seat('sco-2', 'scorpione', 'Paolo Ruggeri', 'ITA'),
        seat('sco-3', 'scorpione', 'Enrico Tamburini', 'ITA'),
        seat('rom-1', 'romagna', 'Daniele Casadei', 'ITA'),
        seat('rom-2', 'romagna', 'Samuele Pasini', 'ITA'),
        seat('rom-3', 'romagna', 'Giorgia Melandri', 'ITA'),
        seat('lar-1', 'lario', 'Fabio Colombetti', 'ITA'),
        seat('lar-2', 'lario', 'Stefano Bonacina', 'ITA'),
        seat('lar-3', 'lario', 'Marco Pozzoli', 'ITA'),
        seat('tic-1', 'ticino', 'Gianluca Moretti', 'CHE'),
        seat('tic-2', 'ticino', 'Remo Balestra', 'CHE'),
        seat('tic-3', 'ticino', 'Ivo Rusconi', 'CHE'),
        seat('tra-1', 'tramontana', 'Jordi Puigvert', 'ESP'),
        seat('tra-2', 'tramontana', 'Oriol Casademunt', 'ESP'),
        seat('tra-3', 'tramontana', 'Núria Soler', 'ESP'),
      ],
      eligibility: { kind: 'cars', cars: ['gue_liana_gt_v6_cup'] },
    },
  ],
  weekendFormats: [
    {
      id: 'race-weekend',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { id: 'race-1', type: 'race', name: 'Race 1', distance: 55, day: 1, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 55, day: 1, inherit: { from: 'race-1', reverse: 6 } },
      ],
    },
  ],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    { id: 'magione', name: 'Magione', track: { id: 'magione' } },
    { id: 'vallelunga', name: 'Vallelunga', track: { id: 'ks_vallelunga', layout: 'extended_circuit' } },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -4, aggression: 20 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2000,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
