import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
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
 * longer feature race. The circuits are those of the season that Assetto Corsa
 * has - Thruxton, Silverstone, Brands Hatch Indy, Oulton Park, Croft and
 * Knockhill; Donington Park and Snetterton are not in Assetto Corsa, and which
 * Silverstone layout the season used was not checked. The races are the
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
      + 'feature race a meeting at Thruxton, Silverstone, Brands Hatch, Oulton Park, Croft and '
      + 'Knockhill.',
    uk: 'British Touring Car Championship 1998 року на машинах Super Touring від VRC: спринт '
      + 'і основна гонка за етап у Тракстоні, Сільверстоуні, Брендс-Хетчі, Оултон-Парку, Крофті '
      + 'та Нокхіллі.',
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
      track: { id: 'js_thruxton', layout: 'lfm' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'national' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch',
      name: 'Brands Hatch',
      track: { id: 'ks_brands_hatch', layout: 'indy' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: { id: 'rt_oulton_park', layout: 'international' },
      climate: Climate.OCEANIC,
    },
    { id: 'croft', name: 'Croft', track: { id: 'zw_croft', layout: 'full' }, climate: Climate.OCEANIC },
    {
      id: 'knockhill',
      name: 'Knockhill',
      track: { id: 'knockhill2017', layout: 'knockhill' },
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 1, aggression: 30 },
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
