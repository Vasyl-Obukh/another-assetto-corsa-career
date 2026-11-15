import { BRITISH_F4_2024 } from './british-f4-2024.ts';
import { seat } from './utils.ts';
import {
  CarSpec, Climate, Discipline,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * F4 British Championship, 2019 - Formula 4 on the BTCC's support bill, on
 * the first-generation car.
 *
 * The series raced the Mygale M14-F4; RSS's Formula RSS 4, the Tatuus of the
 * same generation, stands in. All ten rounds, three races each: the first from
 * qualifying, the second from the first with half the field reversed, and the
 * third from qualifying. The real third race lines up on the drivers'
 * second-best laps, which cannot be stated, so it takes the fastest. The real
 * grid ran to sixteen; twenty-four make it here.
 *
 * Races are 50 km, a judgement: the real lengths were not found. Points are
 * 25-18-15-12-10-8-6-4-2-1 in every race, with nothing for pole or the fastest
 * lap. The teams are those of the 2024 championship and the field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/2019_F4_British_Championship
 */
export const BRITISH_F4_2019: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'british-f4-2019',
  name: 'F4 British Championship 2019',
  description: {
    en: 'British Formula 4 on RSS\'s Formula RSS 4: three races a round, one of them from a reversed '
      + 'grid, on the BTCC\'s circuits.',
    uk: 'Британська Формула-4 на Formula RSS 4 від RSS: три гонки за етап, одна з них зі зворотної '
      + 'стартової решітки, на трасах BTCC.',
  },
  teams: BRITISH_F4_2024.teams,
  entries: [
    {
      id: 'formula-4',
      name: 'Formula 4',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 5 },
      seats: [
        seat('kes-1', 'kestrel', 'Jamie Brackenbury', 'GBR'),
        seat('kes-2', 'kestrel', 'Tom Ingleby', 'GBR'),
        seat('kes-3', 'kestrel', 'Ravi Bassi', 'GBR'),
        seat('sev-1', 'severn', 'Owain Bevan', 'WLS'),
        seat('sev-2', 'severn', 'Charlie Haddon', 'GBR'),
        seat('sev-3', 'severn', 'Luke Tranter', 'GBR'),
        seat('pen-1', 'pennine', 'Joe Ackroyd', 'GBR'),
        seat('pen-2', 'pennine', 'Ben Holdsworth', 'GBR'),
        seat('pen-3', 'pennine', 'Nicolás Ospina', 'COL'),
        seat('wea-1', 'weald', 'Archie Kemble', 'GBR'),
        seat('wea-2', 'weald', 'Toby Fennimore', 'GBR'),
        seat('wea-3', 'weald', 'Kabir Malhotra', 'IND'),
        seat('cly-1', 'clyde', 'Ross Buchanan', 'SCT'),
        seat('cly-2', 'clyde', 'Calum Strachan', 'SCT'),
        seat('cly-3', 'clyde', 'Jamie Lockhart', 'SCT'),
        seat('fen-1', 'fenland', 'Adam Thurlow', 'GBR'),
        seat('fen-2', 'fenland', 'Josh Pettifer', 'GBR'),
        seat('fen-3', 'fenland', 'Mitchell Doyle', 'AUS'),
        seat('har-1', 'harbour', 'Seán Ó Briain', 'IRL'),
        seat('har-2', 'harbour', 'Conor Lenihan', 'IRL'),
        seat('har-3', 'harbour', 'Aaron Quigley', 'NIR'),
        seat('mer-1', 'meridian', 'Edward Rushworth', 'GBR'),
        seat('mer-2', 'meridian', 'Hamza Siddiqui', 'GBR'),
        seat('mer-3', 'meridian', 'Kwame Asante', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_4_GEN_1 },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Three races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 50,
          day: 1,
          inherit: { from: 'qualifying' },
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 50,
          day: 2,
          inherit: { from: 'race-1', reverse: 12 },
        },
        {
          id: 'race-3',
          type: 'race',
          name: 'Race 3',
          distance: 50,
          day: 2,
          inherit: { from: 'qualifying' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'brands-hatch-indy', name: 'Brands Hatch Indy', track: recommendedTrack('brands-hatch/indy') },
    {
      id: 'donington-national',
      name: 'Donington Park National',
      track: recommendedTrack('donington/national'),
    },
    { id: 'thruxton', name: 'Thruxton', track: recommendedTrack('thruxton/full') },
    { id: 'croft', name: 'Croft', track: recommendedTrack('croft/full') },
    { id: 'oulton-park', name: 'Oulton Park', track: recommendedTrack('oulton-park/island') },
    { id: 'snetterton', name: 'Snetterton', track: recommendedTrack('snetterton/300') },
    { id: 'thruxton-2', name: 'Thruxton 2', track: recommendedTrack('thruxton/full') },
    { id: 'knockhill', name: 'Knockhill', track: recommendedTrack('knockhill/full') },
    {
      id: 'silverstone-national',
      name: 'Silverstone National',
      track: recommendedTrack('silverstone/national'),
    },
    { id: 'brands-hatch-gp', name: 'Brands Hatch GP', track: recommendedTrack('brands-hatch/gp') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.OCEANIC },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1500,
  prizes: {
    positions: [8000, 5600, 4000, 3050, 2300, 1750, 1300, 950, 650, 400],
    standings: [64000, 40000, 25500, 17000, 10500],
  },
};
