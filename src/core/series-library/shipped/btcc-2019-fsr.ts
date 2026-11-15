import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A BTCC meeting of the NGTC years: practice and qualifying on the first day,
 * three races on the second - the first from qualifying, the second from the
 * first's result, the third from the second's with its front reversed.
 */
const EVENT: EventFormat = {
  id: 'race-meeting',
  name: 'Three races',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 40, day: 0 },
    { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
    {
      id: 'race-1',
      type: 'race',
      name: 'Race 1',
      distance: 60,
      day: 1,
      inherit: { from: 'qualifying' },
      pointsSystem: 'race-1',
    },
    {
      id: 'race-2',
      type: 'race',
      name: 'Race 2',
      distance: 60,
      day: 1,
      inherit: { from: 'race-1' },
    },
    {
      id: 'race-3',
      type: 'race',
      name: 'Race 3',
      distance: 60,
      day: 1,
      inherit: { from: 'race-2', reverse: 8 },
    },
  ],
};

/**
 * British Touring Car Championship, 2019 - NGTC, on First Studio Race's cars.
 *
 * FSR's Toyota Corolla, Ford Focus, Subaru Levorg, MG6 and Audi S3 Saloon are
 * the cars that raced the season. Its Honda Civic Type R and Vauxhall Astra
 * are the later builds of the FK8 and the Astra that raced 2019, its BMW 125i
 * M Sport the one Team Parker raced that year, which stands in for BMW's
 * works 330i M Sport too, and its 2014 Mercedes A-Class is the generation of
 * A-Class still raced in 2019. The Infiniti Q50, Volkswagen CC and the older
 * FK2 Civic have no FSR car of the season. All ten meetings in the real order,
 * Thruxton twice.
 *
 * Three races a meeting: the first from qualifying, the second from the
 * first's result, the third from the second's with its top eight reversed -
 * the real grid reversed a number drawn on the day, which is fixed here. Points
 * are 20-17-15-13-11-10-9-8-7-6-5-4-3-2-1, with a point for pole in the first
 * race and one for the fastest lap in each; the point for leading a lap cannot
 * be stated. The 60 km a race stands for the real lap counts, which differ by
 * circuit and were not checked. Brands Hatch Indy's and Silverstone's
 * twenty-four boxes cap a field that ran thirty. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2019_British_Touring_Car_Championship
 */
export const BTCC_2019_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'btcc-2019-fsr',
  name: 'British Touring Car Championship 2019 (FSR)',
  description: {
    en: 'The British Touring Car Championship of 2019 on First Studio Race\'s NGTC cars - Honda, '
      + 'Toyota, Ford, Vauxhall, Subaru, MG, Audi, BMW and Mercedes: three races a meeting, the last '
      + 'from a reversed grid.',
    uk: 'British Touring Car Championship 2019 року на машинах NGTC від First Studio Race - Honda, '
      + 'Toyota, Ford, Vauxhall, Subaru, MG, Audi, BMW і Mercedes: три гонки за етап, остання зі '
      + 'зворотної стартової решітки.',
  },
  teams: [
    team('sovereign', 'Sovereign Racing', 'GBR', TeamBudget.WORKS),
    team('harrier', 'Harrier Motorsport', 'GBR', TeamBudget.WORKS),
    team('rutland', 'Rutland Touring', 'GBR', TeamBudget.WORKS),
    team('exmoor', 'Exmoor Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('solent', 'Solent Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('wirral', 'Wirral Touring', 'GBR', TeamBudget.INDEPENDENT),
    team('mourne', 'Mourne Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('brecon', 'Brecon Beacons Racing', 'GBR', TeamBudget.PRIVATEER),
    team('trossachs', 'Trossachs Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('humberside', 'Humber Bridge Racing', 'GBR', TeamBudget.PRIVATEER),
    team('chilterns', 'Chiltern Hills Touring', 'GBR', TeamBudget.PRIVATEER),
    team('lakeland', 'Lakeland Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'ngtc',
      name: 'NGTC',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('sov-1', 'sovereign', 'Ashley Pickering', 'GBR'),
        seat('sov-2', 'sovereign', 'Tom Billingham', 'GBR'),
        seat('har-1', 'harrier', 'Jake Stamford', 'GBR'),
        seat('har-2', 'harrier', 'Daniel Royston', 'GBR'),
        seat('rut-1', 'rutland', 'Matt Oakham', 'GBR'),
        seat('rut-2', 'rutland', 'Chris Uppingham', 'GBR'),
        seat('exm-1', 'exmoor', 'Josh Dulverton', 'GBR'),
        seat('exm-2', 'exmoor', 'Ben Lynton', 'GBR'),
        seat('sol-1', 'solent', 'Rory Hamble', 'GBR'),
        seat('sol-2', 'solent', 'Sam Lymington', 'GBR'),
        seat('wir-1', 'wirral', 'Ste Hoylake', 'GBR'),
        seat('wir-2', 'wirral', 'Carl Heswall', 'GBR'),
        seat('mou-1', 'mourne', 'Ciaran Newcastle', 'GBR'),
        seat('mou-2', 'mourne', 'Eoin Kilkeel', 'IRL'),
        seat('bre-1', 'brecon', 'Dafydd Talgarth', 'GBR'),
        seat('bre-2', 'brecon', 'Aled Crickhowell', 'GBR'),
        seat('tro-1', 'trossachs', 'Kyle Callander', 'GBR'),
        seat('tro-2', 'trossachs', 'Blair Aberfoyle', 'GBR'),
        seat('hum-1', 'humberside', 'Liam Barton', 'GBR'),
        seat('hum-2', 'humberside', 'Jamie Hessle', 'GBR'),
        seat('chi-1', 'chilterns', 'Harry Wendover', 'GBR'),
        seat('chi-2', 'chilterns', 'Ed Amersham', 'GBR'),
        seat('lak-1', 'lakeland', 'Dean Keswick', 'GBR'),
        seat('lak-2', 'lakeland', 'Ross Ambleside', 'GBR'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'civic_btcc_2021',
          'fsr_corolla_btcc',
          'fsr_focus_btcc',
          'fsr_vauxhall_astra_2021',
          'subaru_levog_btcc',
          'btcc_mg6',
          'fsr_aud_s3saloon_14',
          'btcc_bmw_125i_m',
          'fsr_mercedes_aclass_14',
        ],
      },
    },
  ],
  eventFormats: [
    EVENT,
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'brands-hatch-indy',
      name: 'Brands Hatch Indy',
      track: recommendedTrack('brands-hatch/indy'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'donington-park',
      name: 'Donington Park',
      track: recommendedTrack('donington/national'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'thruxton',
      name: 'Thruxton',
      track: recommendedTrack('thruxton/full'),
      climate: Climate.OCEANIC,
    },
    { id: 'croft', name: 'Croft', track: recommendedTrack('croft/full'), climate: Climate.OCEANIC },
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: recommendedTrack('oulton-park/island'),
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
      name: 'Thruxton',
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
      id: 'silverstone',
      name: 'Silverstone National',
      track: recommendedTrack('silverstone/national'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'brands-hatch-gp',
      name: 'Brands Hatch GP',
      track: recommendedTrack('brands-hatch/gp'),
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    {
      id: 'race-1',
      name: 'Race 1 points',
      positions: [20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
      qualifying: [1],
    },
    {
      id: 'race',
      name: 'Race points',
      positions: [20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
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
