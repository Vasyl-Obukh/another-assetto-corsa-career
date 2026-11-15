import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * F4 British Championship, 2024 - Formula 4 on the BTCC's support bill.
 *
 * RSS's Formula RSS 4 2024 is the car, the Tatuus F4-T421 the series has run
 * since 2022. All ten rounds, three races each from one qualifying session:
 * the first from qualifying, the second with qualifying's top twelve reversed,
 * and the third from qualifying as it stood. The real first race lines up on
 * the drivers' second-best laps, which cannot be stated, so it takes the
 * fastest. The real grid ran to thirty-odd entries over the season; the
 * smallest layouts' boxes cap it at twenty-four.
 *
 * Races are 62 km, a judgement: the real lengths were not found, and the
 * second-generation car races a rung above the first, on the Bronze rung, so
 * they run about a quarter longer than 2019's 50 km. Points are
 * 25-18-15-12-10-8-6-4-2-1 in the first and third races and
 * 15-12-10-8-6-4-2-1 in the reverse-grid race, with 1 for the fastest lap in
 * each and 2 for pole, paid with the reverse-grid race. The reverse-grid race's
 * points for places gained cannot be stated. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2024_F4_British_Championship
 */
export const BRITISH_F4_2024: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'british-f4-2024',
  name: 'F4 British Championship 2024',
  description: {
    en: 'British Formula 4 on RSS\'s Formula RSS 4 2024: three races a round, one of them from a '
      + 'reversed grid, on the BTCC\'s circuits and at Zandvoort.',
    uk: 'Британська Формула-4 на Formula RSS 4 2024 від RSS: три гонки за етап, одна з них зі '
      + 'зворотної стартової решітки, на трасах BTCC і в Зандворті.',
  },
  teams: [
    team('kestrel', 'Kestrel Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('severn', 'Severn Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('pennine', 'Pennine Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('weald', 'Weald Racing', 'GBR', TeamBudget.PRIVATEER),
    team('clyde', 'Clyde Junior Racing', 'SCT', TeamBudget.PRIVATEER),
    team('fenland', 'Fenland Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('harbour', 'Harbour Racing', 'IRL', TeamBudget.PRIVATEER),
    team('meridian', 'Meridian Racing', 'GBR', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'formula-4',
      name: 'Formula 4',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 4 },
      seats: [
        seat('kes-1', 'kestrel', 'Oliver Thwaites', 'GBR'),
        seat('kes-2', 'kestrel', 'Harry Penhaligon', 'GBR'),
        seat('kes-3', 'kestrel', 'Arjun Mistry', 'GBR'),
        seat('sev-1', 'severn', 'Rhys Pritchard', 'WLS'),
        seat('sev-2', 'severn', 'Ellis Moorcroft', 'GBR'),
        seat('sev-3', 'severn', 'Jake Ormerod', 'GBR'),
        seat('pen-1', 'pennine', 'Callum Hebblethwaite', 'GBR'),
        seat('pen-2', 'pennine', 'Noah Sutcliffe', 'GBR'),
        seat('pen-3', 'pennine', 'Mateo Quintero', 'COL'),
        seat('wea-1', 'weald', 'Max Fairbrother', 'GBR'),
        seat('wea-2', 'weald', 'Teddy Ashdown', 'GBR'),
        seat('wea-3', 'weald', 'Aarav Chandra', 'IND'),
        seat('cly-1', 'clyde', 'Fraser McAllister', 'SCT'),
        seat('cly-2', 'clyde', 'Euan Drummond', 'SCT'),
        seat('cly-3', 'clyde', 'Lewis Gilchrist', 'SCT'),
        seat('fen-1', 'fenland', 'George Wisbey', 'GBR'),
        seat('fen-2', 'fenland', 'Sam Cottingham', 'GBR'),
        seat('fen-3', 'fenland', 'Lucas Kerrigan', 'AUS'),
        seat('har-1', 'harbour', 'Cian Doherty', 'IRL'),
        seat('har-2', 'harbour', 'Darragh Kinsella', 'IRL'),
        seat('har-3', 'harbour', 'Ryan McCandless', 'NIR'),
        seat('mer-1', 'meridian', 'William Ashby', 'GBR'),
        seat('mer-2', 'meridian', 'Zayn Qureshi', 'GBR'),
        seat('mer-3', 'meridian', 'Daniel Okonjo', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_4_GEN_2 },
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
          distance: 62,
          day: 1,
          inherit: { from: 'qualifying' },
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 62,
          day: 2,
          inherit: { from: 'qualifying', reverse: 12 },
          pointsSystem: 'reverse',
        },
        {
          id: 'race-3',
          type: 'race',
          name: 'Race 3',
          distance: 62,
          day: 2,
          inherit: { from: 'qualifying' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'donington-national',
      name: 'Donington Park National',
      track: recommendedTrack('donington/national'),
    },
    { id: 'brands-hatch-indy', name: 'Brands Hatch Indy', track: recommendedTrack('brands-hatch/indy') },
    { id: 'snetterton', name: 'Snetterton', track: recommendedTrack('snetterton/300') },
    { id: 'thruxton', name: 'Thruxton', track: recommendedTrack('thruxton/full') },
    { id: 'silverstone-gp', name: 'Silverstone GP', track: recommendedTrack('silverstone/gp') },
    { id: 'zandvoort', name: 'Zandvoort', track: recommendedTrack('zandvoort/gp') },
    { id: 'knockhill', name: 'Knockhill', track: recommendedTrack('knockhill/full') },
    { id: 'donington-gp', name: 'Donington Park GP', track: recommendedTrack('donington/gp') },
    {
      id: 'silverstone-national',
      name: 'Silverstone National',
      track: recommendedTrack('silverstone/national'),
    },
    { id: 'brands-hatch-gp', name: 'Brands Hatch GP', track: recommendedTrack('brands-hatch/gp') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], fastestLap: 1 },
    {
      id: 'reverse',
      name: 'Reverse-grid race',
      positions: [15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
      qualifying: [2],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.OCEANIC },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2250,
  prizes: {
    positions: [12000, 8400, 6000, 4600, 3450, 2650, 1950, 1450, 1000, 600],
    standings: [96000, 60000, 38250, 25500, 15750],
  },
};
