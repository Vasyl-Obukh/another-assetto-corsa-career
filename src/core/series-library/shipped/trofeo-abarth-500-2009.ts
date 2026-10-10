import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Trofeo Abarth 500 Italia, 2009 - the Abarth 500 Assetto Corse's own
 * one-make trophy, and the bottom rung of touring cars.
 *
 * Its first season: six meetings of two races at Monza, Mugello, Imola, Le
 * Castellet, Valencia and Vallelunga. Five are raced as they were; Le Castellet
 * is not in Assetto Corsa, so Magione - the other home of the Italian trophies -
 * stands in, and its eighteen boxes cap the grid. The event is the 2010
 * Italia one, two 20-minute qualifyings each setting one race's grid and two
 * 25-minute races, and the points the trophy's 21-18-16 scale over twelve places
 * with a point for fastest lap, as the 2010 season paid them.
 *
 * Sources: https://www.media.stellantis.com/it-it/abarth/press/trofeo-abarth-500-varati-i-calendari,
 * https://en.wikipedia.org/wiki/2010_Trofeo_Abarth_500_GB_season
 */
export const TROFEO_ABARTH_500_2009: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'trofeo-abarth-500-2009',
  name: 'Trofeo Abarth 500 Italia 2009',
  description: 'The Abarth 500 Assetto Corse\'s one-make trophy in its first season: two races a '
    + 'event, each from its own qualifying. Magione stands in for Le Castellet.',
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
      id: 'trofeo',
      name: 'Trofeo',
      ladder: { discipline: Discipline.TOURING, tier: 5 },
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
      eligibility: { kind: 'cars', cars: ['ks_abarth500_assetto_corse'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
        {
          type: 'race', name: 'Race 1', distance: 50, day: 0, inherit: { from: 'qualifying-1' },
        },
        {
          type: 'race', name: 'Race 2', distance: 50, day: 1, inherit: { from: 'qualifying-2' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'le-castellet', name: 'Magione', track: { id: 'magione' } },
    {
      id: 'valencia',
      name: 'Valencia',
      track: { id: 'fn_valencia', layout: 'gp' },
    },
    {
      id: 'vallelunga',
      name: 'Vallelunga',
      track: { id: 'ks_vallelunga', layout: 'extended_circuit' },
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [21, 18, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1],
      fastestLap: 1,
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -6, aggression: 15 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, slipstream: 1 },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 900,
  prizes: {
    positions: [3000, 2100, 1500, 1100, 800, 600, 450, 300, 200, 100],
    standings: [22000, 13000, 9000, 6000, 4000],
  },
};
