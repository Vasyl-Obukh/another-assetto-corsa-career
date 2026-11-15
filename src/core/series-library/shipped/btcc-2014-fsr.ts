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
 * British Touring Car Championship, 2014 - NGTC, on First Studio Race's cars.
 *
 * FSR's 2014 Audi S3 Saloon, BMW 125i M Sport, Mercedes A-Class and Toyota
 * Avensis and its Chevrolet Cruze all raced the season. FSR's MG6 is the
 * later car of the same NGTC MG6 GT the season raced, and stands in for it;
 * its Focus is the fourth-generation car, standing in for the Focus ST that
 * raced 2014. The Honda Civic, Volkswagen CC, Vauxhall Insignia, Proton
 * Persona and Audi A4 have no FSR car of the season. Nine of the ten
 * meetings in the real order; Rockingham is not in Assetto Corsa.
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
 * Source: https://en.wikipedia.org/wiki/2014_British_Touring_Car_Championship
 */
export const BTCC_2014_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'btcc-2014-fsr',
  name: 'British Touring Car Championship 2014 (FSR)',
  description: {
    en: 'The British Touring Car Championship of 2014 on First Studio Race\'s NGTC cars - Audi, BMW, '
      + 'Mercedes, Toyota, Chevrolet, MG and Ford: three races a meeting, the last from a reversed grid.',
    uk: 'British Touring Car Championship 2014 року на машинах NGTC від First Studio Race - Audi, BMW, '
      + 'Mercedes, Toyota, Chevrolet, MG і Ford: три гонки за етап, остання зі зворотної стартової решітки.',
  },
  teams: [
    team('pennant', 'Pennant Racing', 'GBR', TeamBudget.WORKS),
    team('kestrel', 'Kestrel Motorsport', 'GBR', TeamBudget.WORKS),
    team('wolverine', 'Black Country Racing', 'GBR', TeamBudget.WORKS),
    team('quantock', 'Quantock Touring', 'GBR', TeamBudget.INDEPENDENT),
    team('lune', 'Lune Valley Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('weald', 'Weald Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('purbeck', 'Purbeck Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('tamar', 'Tamar Touring', 'GBR', TeamBudget.PRIVATEER),
    team('forth', 'Firth of Forth Racing', 'GBR', TeamBudget.PRIVATEER),
    team('fens', 'Fenside Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('ulster', 'Lagan Racing', 'GBR', TeamBudget.PRIVATEER),
    team('cheviot', 'Cheviot Touring', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'ngtc',
      name: 'NGTC',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('pen-1', 'pennant', 'Adam Wetherby', 'GBR'),
        seat('pen-2', 'pennant', 'Rob Haverhill', 'GBR'),
        seat('kes-1', 'kestrel', 'Jordan Ashbourne', 'GBR'),
        seat('kes-2', 'kestrel', 'Tom Ingleby', 'GBR'),
        seat('wol-1', 'wolverine', 'Dan Tipton', 'GBR'),
        seat('wol-2', 'wolverine', 'Josh Bilston', 'GBR'),
        seat('qua-1', 'quantock', 'Chris Watchet', 'GBR'),
        seat('qua-2', 'quantock', 'Aaron Minehead', 'GBR'),
        seat('lun-1', 'lune', 'Jack Caton', 'GBR'),
        seat('lun-2', 'lune', 'Mike Halton', 'GBR'),
        seat('wea-1', 'weald', 'Sam Crowborough', 'GBR'),
        seat('wea-2', 'weald', 'Nick Tenterden', 'GBR'),
        seat('pur-1', 'purbeck', 'Luke Swanage', 'GBR'),
        seat('pur-2', 'purbeck', 'Ollie Corfe', 'GBR'),
        seat('tam-1', 'tamar', 'Ryan Saltash', 'GBR'),
        seat('tam-2', 'tamar', 'Lee Calstock', 'GBR'),
        seat('for-1', 'forth', 'Graeme Kinross', 'GBR'),
        seat('for-2', 'forth', 'Ewan Culross', 'GBR'),
        seat('fen-1', 'fens', 'Craig Wisbech', 'GBR'),
        seat('fen-2', 'fens', 'Shaun March', 'GBR'),
        seat('ula-1', 'ulster', 'Conor Lisburn', 'GBR'),
        seat('ula-2', 'ulster', 'Niall Dromore', 'IRL'),
        seat('che-1', 'cheviot', 'Paul Alnwick', 'GBR'),
        seat('che-2', 'cheviot', 'Gavin Rothbury', 'GBR'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'fsr_aud_s3saloon_14',
          'fsr_bmw_125i_14',
          'fsr_mercedes_aclass_14',
          'fsr_toyota_avensis_14',
          'fsr_cruze_btcc',
          'btcc_mg6',
          'fsr_focus_btcc',
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
    {
      id: 'oulton-park',
      name: 'Oulton Park',
      track: recommendedTrack('oulton-park/international'),
      climate: Climate.OCEANIC,
    },
    { id: 'croft', name: 'Croft', track: recommendedTrack('croft/full'), climate: Climate.OCEANIC },
    {
      id: 'snetterton',
      name: 'Snetterton',
      track: recommendedTrack('snetterton/300'),
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
