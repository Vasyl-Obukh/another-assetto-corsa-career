import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A BTCC meeting of the Super Touring years: practice, then a qualifying and a
 * race for the sprint, and another of each for the feature race.
 */
const EVENT: EventFormat = {
  id: 'race-meeting',
  name: 'Sprint and feature',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
    { id: 'sprint-qualifying', type: 'qualify', name: 'Sprint qualifying', minutes: 20, day: 0 },
    { id: 'feature-qualifying', type: 'qualify', name: 'Feature qualifying', minutes: 20, day: 0 },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint race',
      distance: 40,
      day: 1,
      inherit: { from: 'sprint-qualifying' },
    },
    {
      id: 'feature',
      type: 'race',
      name: 'Feature race',
      distance: 80,
      day: 1,
      inherit: { from: 'feature-qualifying' },
    },
  ],
};

/**
 * British Touring Car Championship, 1998 - Super Touring at its height.
 *
 * VRC's ERC cars are that era's Super Tourers under made-up names, and make up
 * the spec. Two races a meeting, each with its own qualifying: a sprint, and a
 * longer feature race. All thirteen meetings, in the season's order:
 * Thruxton, Silverstone, Donington Park, Brands Hatch, Oulton Park, Donington
 * again, Croft, Snetterton, Thruxton again, Knockhill, then Brands Hatch,
 * Oulton Park and Silverstone again. Donington is its National circuit and
 * Brands Hatch its Indy circuit; Silverstone's International and Snetterton
 * are today's, not the season's, and Oulton Park's Fosters circuit is not in
 * Assetto Corsa, so its International stands in. The races are the
 * usual 40 and 80 kilometres, which were not checked, turned into laps off each
 * track; the feature race's compulsory pit stop cannot be stated yet.
 *
 * Points are 15-12-10-8-6-5-4-3-2-1 in each race, which was not checked
 * against the season. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/1998_British_Touring_Car_Championship
 */
export const BTCC_1998: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'btcc-1998',
  name: 'British Touring Car Championship 1998',
  description: {
    en: 'The British Touring Car Championship of 1998 on VRC\'s Super Tourers: a sprint and a '
      + 'feature race at each of the season\'s thirteen meetings.',
    uk: 'British Touring Car Championship 1998 року на машинах Super Touring від VRC: спринт '
      + 'і основна гонка на кожному з тринадцяти етапів сезону.',
  },
  teams: [
    team('pennine', 'Pennine Motorsport', 'GBR', TeamBudget.WORKS),
    team('wessex', 'Wessex Racing', 'GBR', TeamBudget.WORKS),
    team('humber', 'Humberside Touring', 'GBR', TeamBudget.WORKS),
    team('severn', 'Severn Valley Racing', 'GBR', TeamBudget.WORKS),
    team('fenland', 'Fenland Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('mersey', 'Merseyside Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('highland', 'Highland Touring', 'GBR', TeamBudget.INDEPENDENT),
    team('tyne', 'Tyneside Racing', 'GBR', TeamBudget.PRIVATEER),
    team('chiltern', 'Chiltern Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('solway', 'Solway Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'super-touring',
      name: 'Super Touring',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('pen-1', 'pennine', 'Graham Ashworth', 'GBR'),
        seat('pen-2', 'pennine', 'Neil Brathwaite', 'GBR'),
        seat('wes-1', 'wessex', 'Colin Sherborne', 'GBR'),
        seat('wes-2', 'wessex', 'Martin Wareham', 'GBR'),
        seat('hum-1', 'humber', 'Steve Harrowby', 'GBR'),
        seat('hum-2', 'humber', 'Paul Kilburn', 'GBR'),
        seat('sev-1', 'severn', 'Gareth Llewellin', 'GBR'),
        seat('sev-2', 'severn', 'Rhodri Maddocks', 'GBR'),
        seat('fen-1', 'fenland', 'Andy Pickersgill', 'GBR'),
        seat('fen-2', 'fenland', 'Keith Mowbray', 'GBR'),
        seat('mer-1', 'mersey', 'Tony Ackroyd', 'GBR'),
        seat('mer-2', 'mersey', 'Dean Halewood', 'GBR'),
        seat('hig-1', 'highland', 'Iain Strathearn', 'GBR'),
        seat('hig-2', 'highland', 'Fraser Dunnachie', 'GBR'),
        seat('tyn-1', 'tyne', 'Craig Hebburn', 'GBR'),
        seat('tyn-2', 'tyne', 'Lee Fawdon', 'GBR'),
        seat('chi-1', 'chiltern', 'Richard Penfold', 'GBR'),
        seat('chi-2', 'chiltern', 'Julian Tresham', 'GBR'),
        seat('sol-1', 'solway', 'Alan Gatehouse', 'GBR'),
        seat('sol-2', 'solway', 'Rob Annandale', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.SUPER_TOURING_1990S },
    },
  ],
  eventFormats: [
    EVENT,
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'thruxton',
      name: 'Thruxton',
      track: recommendedTrack('thruxton/full'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: recommendedTrack('silverstone/international'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'donington-park',
      name: 'Donington Park',
      track: recommendedTrack('donington/national'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: recommendedTrack('brands-hatch/indy'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: recommendedTrack('oulton-park/international'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'donington-park-2',
      name: 'Donington Park II',
      track: recommendedTrack('donington/national'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'croft',
      name: 'Croft',
      track: recommendedTrack('croft/full'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'snetterton',
      name: 'Snetterton',
      track: recommendedTrack('snetterton/300'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'thruxton-2',
      name: 'Thruxton II',
      track: recommendedTrack('thruxton/full'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'knockhill',
      name: 'Knockhill',
      track: recommendedTrack('knockhill/full'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch-2',
      name: 'Brands Hatch II',
      track: recommendedTrack('brands-hatch/indy'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park-2',
      name: 'Oulton Park II',
      track: recommendedTrack('oulton-park/international'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone-2',
      name: 'Silverstone II',
      track: recommendedTrack('silverstone/international'),
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1] },
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
