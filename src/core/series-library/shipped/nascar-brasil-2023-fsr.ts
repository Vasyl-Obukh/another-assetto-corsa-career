import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * NASCAR Brasil Sprint Race, 2023 - the first season under the NASCAR name, on
 * First Studio Race's Camaro and Mustang.
 *
 * FSR's Camaro and Mustang are the two bodies the field raced over one
 * chassis and V6. All eight rounds in the real order: Goiania's mixed circuit,
 * Interlagos, Londrina, Cascavel, the Special Edition at Goiania's external
 * circuit and Velo Citta, Taruma and the final at Interlagos. Londrina races
 * its full circuit, which the sources do not name.
 *
 * One class where the real grid scored PRO, PROAM and AM apart, since a split
 * by driver means nothing to AI drivers. A Brazilian Championship round runs
 * two ten-minute qualifyings, each setting one race's grid; at Cascavel and
 * the final the first is the Superpole, which pays the race scale. The two
 * Special Edition rounds run a Superpole for the first two races and a third
 * race from the second's result, where the real one started from both races
 * added up. The real season kept three titles - the Brazilian Championship,
 * Special Edition and overall - and this is the overall one, every round
 * counting. The real cars were mostly shared by two drivers, one a race; here
 * each has one, and the one dropped score is not dropped.
 *
 * The real races ran twenty-five minutes and a lap; Assetto Corsa times no
 * race offline, so each is 65 km, half an hour at a lap of Interlagos in about
 * a minute forty. Points are 25-20-16-14-12-10-8-6-4-3-2-1, and 18 down to 1
 * for the Special Edition's first two races. Velo Citta's eighteen boxes cap
 * the field. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2023_NASCAR_Brasil_Sprint_Race
 */
export const NASCAR_BRASIL_2023_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'nascar-brasil-2023-fsr',
  name: 'NASCAR Brasil Sprint Race 2023 (FSR)',
  description: {
    en: 'NASCAR\'s Brazilian series of 2023 on First Studio Race\'s Camaro and Mustang: two '
      + 'sprints a round and three at the Special Edition rounds.',
    uk: 'Бразильська серія NASCAR 2023 року на Camaro і Mustang від First Studio Race: два '
      + 'спринти за етап і три на етапах Special Edition.',
  },
  teams: [
    team('chapada', 'Chapada Racing', 'BRA', TeamBudget.WORKS),
    team('mantiqueira', 'Mantiqueira Motorsport', 'BRA', TeamBudget.WORKS),
    team('sertao', 'Sertão Racing', 'BRA', TeamBudget.INDEPENDENT),
    team('canastra', 'Canastra Motorsport', 'BRA', TeamBudget.INDEPENDENT),
    team('ribeira', 'Ribeira Competições', 'BRA', TeamBudget.PRIVATEER),
    team('capixaba', 'Capixaba Racing', 'BRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'sprint-race',
      name: 'Sprint Race',
      ladder: { discipline: Discipline.TOURING, tier: 3 },
      seats: [
        seat('cha-1', 'chapada', 'Otávio Rezende', 'BRA'),
        seat('cha-2', 'chapada', 'Fernando Bittencourt', 'BRA'),
        seat('cha-3', 'chapada', 'Roberto Mendonça', 'BRA'),
        seat('man-1', 'mantiqueira', 'Murilo Fagundes', 'BRA'),
        seat('man-2', 'mantiqueira', 'Ricardo Lustosa', 'BRA'),
        seat('man-3', 'mantiqueira', 'Cláudio Assunção', 'BRA'),
        seat('ser-1', 'sertao', 'Renan Petrucci', 'BRA'),
        seat('ser-2', 'sertao', 'Sérgio Damasceno', 'BRA'),
        seat('ser-3', 'sertao', 'Wagner Prates', 'BRA'),
        seat('can-1', 'canastra', 'Igor Sampaio', 'BRA'),
        seat('can-2', 'canastra', 'Marcos Teixeira', 'BRA'),
        seat('can-3', 'canastra', 'Edson Varela', 'BRA'),
        seat('rib-1', 'ribeira', 'Álvaro Castañeda', 'ARG'),
        seat('rib-2', 'ribeira', 'Joaquín Ibarra', 'ARG'),
        seat('rib-3', 'ribeira', 'Gilberto Campello', 'BRA'),
        seat('cap-1', 'capixaba', 'Pedro Arantes', 'BRA'),
        seat('cap-2', 'capixaba', 'Paulo Furtado', 'BRA'),
        seat('cap-3', 'capixaba', 'Luiz Otaviano', 'BRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.NASCAR_BRASIL_FSR },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 10, day: 1 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 10, day: 1 },
        {
          type: 'race',
          name: 'Race 1',
          distance: 65,
          day: 2,
          inherit: { from: 'qualifying-1' },
        },
        {
          type: 'race',
          name: 'Race 2',
          distance: 65,
          day: 2,
          inherit: { from: 'qualifying-2' },
        },
      ],
    },
    {
      id: 'superpole',
      name: 'Superpole',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { id: 'superpole', type: 'qualify', name: 'Superpole', minutes: 10, day: 1 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 10, day: 1 },
        {
          type: 'race',
          name: 'Race 1',
          distance: 65,
          day: 2,
          inherit: { from: 'superpole' },
          pointsSystem: 'superpole',
        },
        {
          type: 'race',
          name: 'Race 2',
          distance: 65,
          day: 2,
          inherit: { from: 'qualifying-2' },
        },
      ],
    },
    {
      id: 'special-edition',
      name: 'Special Edition',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { id: 'superpole', type: 'qualify', name: 'Superpole', minutes: 10, day: 1 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 65,
          day: 1,
          inherit: { from: 'superpole' },
          pointsSystem: 'special-race-1',
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 65,
          day: 2,
          inherit: { from: 'superpole' },
          pointsSystem: 'special-race-2',
        },
        {
          id: 'race-3',
          type: 'race',
          name: 'Race 3',
          distance: 65,
          day: 2,
          inherit: { from: 'race-2' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'goiania',
      name: 'Goiania',
      track: recommendedTrack('goiania/mixed'),
      climate: Climate.ARID,
    },
    { id: 'interlagos', name: 'Interlagos', track: recommendedTrack('interlagos/gp') },
    { id: 'londrina', name: 'Londrina', track: recommendedTrack('londrina/full') },
    {
      id: 'cascavel',
      name: 'Cascavel',
      track: recommendedTrack('cascavel/full'),
      eventFormat: 'superpole',
    },
    {
      id: 'goiania-external',
      name: 'Special Edition Goiania',
      track: recommendedTrack('goiania/external'),
      eventFormat: 'special-edition',
      // The layout's ui_track.json gives the mixed circuit's 3820 m, which
      // would make 65 km 18 laps of a 2590 m lap.
      sessionLengths: [
        { session: 'race-1', laps: 26 },
        { session: 'race-2', laps: 26 },
        { session: 'race-3', laps: 26 },
      ],
      climate: Climate.ARID,
    },
    {
      id: 'velocitta',
      name: 'Special Edition Velo Citta',
      track: recommendedTrack('velocitta/full'),
      eventFormat: 'special-edition',
    },
    { id: 'taruma', name: 'Taruma', track: recommendedTrack('taruma/full') },
    {
      id: 'interlagos-final',
      name: 'Interlagos final',
      track: recommendedTrack('interlagos/gp'),
      eventFormat: 'superpole',
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 20, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1],
    },
    {
      id: 'superpole',
      name: 'Superpole race points',
      positions: [25, 20, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1],
      qualifying: [25, 20, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1],
    },
    {
      id: 'special-race-1',
      name: 'Special Edition Superpole race points',
      positions: [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      qualifying: [25, 20, 16, 14, 12, 10, 8, 6, 4, 3, 2, 1],
    },
    {
      id: 'special-race-2',
      name: 'Special Edition sprint points',
      positions: [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 30 },
  generatedWeather: { climate: Climate.TEMPERATE, hemisphere: Hemisphere.SOUTH },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 4000,
  prizes: {
    positions: [15000, 10500, 7500, 5700, 4350, 3300, 2400, 1800, 1200, 750],
    standings: [120000, 75000, 48000, 31500, 19500],
  },
};
