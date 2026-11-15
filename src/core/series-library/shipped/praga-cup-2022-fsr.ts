import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Praga Cup, 2022 - Praga's one-make series for its R1 prototype on the
 * Britcar Endurance bill, in its only season as a championship of its own (in
 * 2024 the R1s raced the multi-make BRSCC ZEO Prototype Series instead), on
 * First Studio Race's Praga R1.
 *
 * FSR's car is the 2024 R1, standing in for the 2021 and 2022 cars - the
 * R1T - that made up the 2022 grid.
 *
 * All six meetings of the season in the real order: Silverstone GP, Oulton
 * Park International, Snetterton 300, Silverstone National, Donington Park
 * National and Donington Park GP. The non-championship Spa-Francorchamps
 * weekend is left out. Every meeting ran an hour-long race on the Saturday and
 * another on the Sunday, each from a qualifying of its own; Oulton Park ran
 * the Saturday race alone. An hour is 135 km, the distance the Oulton Park
 * race covered, pit stop included. The real races were shared by an amateur
 * and a professional with a timed, compulsory pit stop; here each car has one
 * driver and no stop is required.
 *
 * Points are 32-27-23-20-18-17-16-15-14-13-12-11-10-9-8-7-6-5-4-3 a race, a
 * point for pole and one for the fastest lap. Silverstone's twenty-four boxes
 * would cap the field; twenty cars fit, where the real grid was sixteen-plus,
 * not checked race by race. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2022_Praga_Cup
 */
export const PRAGA_CUP_2022_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'praga-cup-2022-fsr',
  name: 'Praga Cup 2022 (FSR)',
  description: {
    en: 'Praga\'s one-make series of 2022 on First Studio Race\'s Praga R1: two one-hour races a '
      + 'meeting on the Britcar bill at British circuits.',
    uk: 'Монокубок Praga 2022 року на Praga R1 від First Studio Race: дві годинні гонки за етап у '
      + 'програмі Britcar на британських трасах.',
  },
  teams: [
    team('merlin', 'Merlin Prototypes', 'GBR', TeamBudget.INDEPENDENT),
    team('wyvern', 'Wyvern Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('saltire', 'Saltire Racing', 'GBR', TeamBudget.PRIVATEER),
    team('red-kite', 'Red Kite Racing', 'GBR', TeamBudget.PRIVATEER),
    team('hartland', 'Hartland Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('lindisfarne', 'Lindisfarne Racing', 'GBR', TeamBudget.PRIVATEER),
    team('tintagel', 'Tintagel Prototypes', 'GBR', TeamBudget.PRIVATEER),
    team('kielder', 'Kielder Racing', 'GBR', TeamBudget.PRIVATEER),
    team('malham', 'Malham Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('wrekin', 'Wrekin Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'r1',
      name: 'R1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('mer-1', 'merlin', 'Oliver Haverfield', 'GBR'),
        seat('mer-2', 'merlin', 'James Pendry', 'GBR'),
        seat('wyv-1', 'wyvern', 'Daniel Garside', 'GBR'),
        seat('wyv-2', 'wyvern', 'Rupert Brackenbury', 'GBR'),
        seat('sal-1', 'saltire', 'Calum Ogston', 'GBR'),
        seat('sal-2', 'saltire', 'Neil Rennison', 'GBR'),
        seat('red-1', 'red-kite', 'Owen Tregear', 'GBR'),
        seat('red-2', 'red-kite', 'Mark Cattermole', 'GBR'),
        seat('har-1', 'hartland', 'Luke Hollins', 'GBR'),
        seat('har-2', 'hartland', 'Simon Stanway', 'GBR'),
        seat('lin-1', 'lindisfarne', 'Patrick Prendergast', 'IRL'),
        seat('lin-2', 'lindisfarne', 'Seamus Mulcahy', 'IRL'),
        seat('tin-1', 'tintagel', 'Ben Bratton', 'GBR'),
        seat('tin-2', 'tintagel', 'Graham Elstob', 'GBR'),
        seat('kie-1', 'kielder', 'Adam Gillow', 'GBR'),
        seat('kie-2', 'kielder', 'Christopher Thackeray', 'GBR'),
        seat('mal-1', 'malham', 'Andrew Middleditch', 'GBR'),
        seat('mal-2', 'malham', 'Wouter Vandevelde', 'BEL'),
        seat('wre-1', 'wrekin', 'Tom Pashley', 'GBR'),
        seat('wre-2', 'wrekin', 'Richard Kinnersley', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_praga_r1_2024'] },
    },
  ],
  eventFormats: [
    {
      id: 'race-meeting',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 30, day: 1 },
        { id: 'race-1', type: 'race', name: 'Race 1', distance: 135, day: 1, inherit: { from: 'qualifying-1' } },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 30, day: 2 },
        { type: 'race', name: 'Race 2', distance: 135, day: 2, inherit: { from: 'qualifying-2' } },
      ],
    },
    {
      id: 'one-race',
      name: 'One race',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { type: 'race', name: 'Race', distance: 135, day: 1, inherit: { from: 'qualifying' } },
      ],
    },
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'silverstone-gp',
      name: 'Silverstone GP',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: recommendedTrack('oulton-park/international'),
      eventFormat: 'one-race',
      climate: Climate.OCEANIC,
    },
    {
      id: 'snetterton',
      name: 'Snetterton',
      track: recommendedTrack('snetterton/300'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-national',
      name: 'Silverstone National',
      track: recommendedTrack('silverstone/national'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'donington-park-national',
      name: 'Donington Park National',
      track: recommendedTrack('donington/national'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'donington-park-gp',
      name: 'Donington Park GP',
      track: recommendedTrack('donington/gp'),
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [
        32, 27, 23, 20, 18, 17, 16, 15, 14, 13,
        12, 11, 10, 9, 8, 7, 6, 5, 4, 3,
      ],
      fastestLap: 1,
      qualifying: [1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.OCEANIC },
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
