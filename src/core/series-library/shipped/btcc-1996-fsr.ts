import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A BTCC meeting of 1996: practice, then a qualifying and a race for each of
 * the two races.
 */
const EVENT: EventFormat = {
  id: 'race-meeting',
  name: 'Two races',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
    { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
    { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
    {
      id: 'race-1',
      type: 'race',
      name: 'Race 1',
      distance: 60,
      day: 1,
      inherit: { from: 'qualifying-1' },
    },
    {
      id: 'race-2',
      type: 'race',
      name: 'Race 2',
      distance: 60,
      day: 1,
      inherit: { from: 'qualifying-2' },
    },
  ],
};

/**
 * British Touring Car Championship, 1996 - Super Touring, on First Studio
 * Race's cars.
 *
 * The BMW 320i, the Ford Mondeo and the Volvo 850 of the Super Touring (FSR)
 * spec all raced the 1996 season; the Audi A4, Renault Laguna, Vauxhall
 * Vectra, Honda Accord, Peugeot 406, Nissan Primera and Toyota Carina that
 * raced with them have no FSR car. All thirteen meetings, two races each, in
 * the real order. Snetterton, Oulton Park's Fosters circuit and Silverstone
 * were raced on layouts since changed: Snetterton runs the 200 circuit, the
 * nearest in length to the old one, Fosters the Island circuit, and Silverstone
 * today's International and Grand Prix layouts.
 *
 * Points are 15-12-10-8-6-5-4-3-2-1 in each race, with a point for pole. That
 * each race had its own qualifying, and the 60 km a race, were not checked.
 * The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/1996_British_Touring_Car_Championship
 */
export const BTCC_1996_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'btcc-1996-fsr',
  name: 'British Touring Car Championship 1996 (FSR)',
  description: {
    en: 'The British Touring Car Championship of 1996 on First Studio Race\'s Super Tourers - the '
      + 'BMW 320i, Ford Mondeo and Volvo 850: thirteen meetings of two races.',
    uk: 'British Touring Car Championship 1996 року на машинах Super Touring від First Studio Race - '
      + 'BMW 320i, Ford Mondeo і Volvo 850: тринадцять етапів по дві гонки.',
  },
  teams: [
    team('cotswold', 'Cotswold Touring', 'GBR', TeamBudget.WORKS),
    team('mendip', 'Mendip Motorsport', 'GBR', TeamBudget.WORKS),
    team('trent', 'Trent Valley Racing', 'GBR', TeamBudget.WORKS),
    team('ribble', 'Ribblesdale Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('clyde', 'Clydeside Touring', 'GBR', TeamBudget.INDEPENDENT),
    team('medway', 'Medway Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('dales', 'Dales Racing', 'GBR', TeamBudget.PRIVATEER),
    team('gower', 'Gower Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('fylde', 'Fylde Touring', 'GBR', TeamBudget.PRIVATEER),
    team('ouse', 'Ouse Valley Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'super-touring',
      name: 'Super Touring',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('cot-1', 'cotswold', 'Nigel Chadlington', 'GBR'),
        seat('cot-2', 'cotswold', 'Simon Bibury', 'GBR'),
        seat('men-1', 'mendip', 'Philip Wookey', 'GBR'),
        seat('men-2', 'mendip', 'Karl Lindqvist', 'SWE'),
        seat('tre-1', 'trent', 'Mark Gainsby', 'GBR'),
        seat('tre-2', 'trent', 'Dieter Hollmann', 'DEU'),
        seat('rib-1', 'ribble', 'Gary Settleby', 'GBR'),
        seat('rib-2', 'ribble', 'Jonathan Clitheroe', 'GBR'),
        seat('cly-1', 'clyde', 'Douglas Renfrew', 'GBR'),
        seat('cly-2', 'clyde', 'Hamish Airdrie', 'GBR'),
        seat('med-1', 'medway', 'Darren Snodland', 'GBR'),
        seat('med-2', 'medway', 'Peter Aylesford', 'GBR'),
        seat('dal-1', 'dales', 'Stuart Hawes', 'GBR'),
        seat('dal-2', 'dales', 'Kevin Askrigg', 'GBR'),
        seat('gow-1', 'gower', 'Huw Penrice', 'GBR'),
        seat('gow-2', 'gower', 'Gethin Rhossili', 'GBR'),
        seat('fyl-1', 'fylde', 'Ian Lytham', 'GBR'),
        seat('fyl-2', 'fylde', 'Barry Kirkham', 'GBR'),
        seat('ous-1', 'ouse', 'Martin Selby', 'GBR'),
        seat('ous-2', 'ouse', 'Declan Moran', 'IRL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.SUPER_TOURING_FSR },
    },
  ],
  eventFormats: [
    EVENT,
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'donington-park',
      name: 'Donington Park',
      track: recommendedTrack('donington/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch-indy',
      name: 'Brands Hatch Indy',
      track: recommendedTrack('brands-hatch/indy'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'thruxton',
      name: 'Thruxton',
      track: recommendedTrack('thruxton/full'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-international',
      name: 'Silverstone International',
      track: recommendedTrack('silverstone/international'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: recommendedTrack('oulton-park/international'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'snetterton',
      name: 'Snetterton',
      track: recommendedTrack('snetterton/200'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch-gp',
      name: 'Brands Hatch GP',
      track: recommendedTrack('brands-hatch/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-gp',
      name: 'Silverstone GP',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'knockhill',
      name: 'Knockhill',
      track: recommendedTrack('knockhill/full'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park-fosters',
      name: 'Oulton Park Fosters',
      track: recommendedTrack('oulton-park/island'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'thruxton-2',
      name: 'Thruxton',
      track: recommendedTrack('thruxton/full'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'donington-park-2',
      name: 'Donington Park',
      track: recommendedTrack('donington/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch-indy-2',
      name: 'Brands Hatch Indy',
      track: recommendedTrack('brands-hatch/indy'),
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    {
      id: 'race', name: 'Race points', positions: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1], qualifying: [1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 30 },
  generatedWeather: { climate: Climate.OCEANIC },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 8000,
  prizes: {
    positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
    standings: [240000, 150000, 96000, 63000, 39000],
  },
};
