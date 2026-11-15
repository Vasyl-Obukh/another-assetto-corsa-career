import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Ginetta Junior Championship, 2019 - the one-make ladder into car racing for
 * fourteen- to seventeen-year-olds, on the BTCC support bill, on First Studio
 * Race's G40 Junior.
 *
 * All ten meetings of the season in the real order, the BTCC's own, Thruxton
 * twice. Three races a meeting, where the real season ran two at some of them,
 * which ones not checked: the first lines up on qualifying, the second on the
 * first's result and the third on the second's, a stand-in for the series' own
 * grids, which were not checked either. Races run 20 minutes, also unchecked.
 *
 * Points are 35-30-26-22-20-18-16-14-12-11-10-9-8-7-6-5-4-3-2-1 with a point
 * for pole in the first race and one for the fastest lap in each; only a
 * driver's best 24 scores counted, which cannot be stated. Brands Hatch Indy's
 * and Silverstone's twenty-four boxes cap the field. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2019_Ginetta_Junior_Championship
 */
export const GINETTA_JUNIOR_2019_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'ginetta-junior-2019-fsr',
  name: 'Ginetta Junior Championship 2019 (FSR)',
  description: {
    en: 'The junior one-make series on the BTCC support bill, on First Studio Race\'s Ginetta G40 '
      + 'Junior: ten meetings of three races at British circuits.',
    uk: 'Юніорський монокубок у програмі підтримки BTCC на Ginetta G40 Junior від First Studio Race: '
      + 'десять етапів по три гонки на британських трасах.',
  },
  teams: [
    team('kingfisher', 'Kingfisher Juniors', 'GBR', TeamBudget.PRIVATEER),
    team('saxon', 'Saxon Motorsport', 'GBR', TeamBudget.PRIVATEER),
    team('pendle', 'Pendle Racing', 'GBR', TeamBudget.PRIVATEER),
    team('tweed', 'Tweed Valley Juniors', 'GBR', TeamBudget.PRIVATEER),
    team('severnside', 'Severnside Racing', 'GBR', TeamBudget.PRIVATEER),
    team('norfolk', 'Norfolk Broads Juniors', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'g40-junior',
      name: 'G40 Junior',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 5 },
      seats: [
        seat('kin-1', 'kingfisher', 'Archie Thirlby', 'GBR'),
        seat('kin-2', 'kingfisher', 'Louis Penrose', 'GBR'),
        seat('kin-3', 'kingfisher', 'Harvey Coombe', 'GBR'),
        seat('kin-4', 'kingfisher', 'Finley Drayton', 'GBR'),
        seat('sax-1', 'saxon', 'Ethan Wickford', 'GBR'),
        seat('sax-2', 'saxon', 'Max Ingatestone', 'GBR'),
        seat('sax-3', 'saxon', 'Reuben Maldon', 'GBR'),
        seat('sax-4', 'saxon', 'Isaac Tollesbury', 'GBR'),
        seat('pen-1', 'pendle', 'Jacob Colne', 'GBR'),
        seat('pen-2', 'pendle', 'Noah Barrowford', 'GBR'),
        seat('pen-3', 'pendle', 'Leo Sabden', 'GBR'),
        seat('pen-4', 'pendle', 'Kian Trawden', 'IRL'),
        seat('twe-1', 'tweed', 'Lewis Peebles', 'GBR'),
        seat('twe-2', 'tweed', 'Cameron Kelso', 'GBR'),
        seat('twe-3', 'tweed', 'Murray Coldstream', 'GBR'),
        seat('twe-4', 'tweed', 'Finlay Innerleithen', 'GBR'),
        seat('sev-1', 'severnside', 'Rhys Chepstow', 'GBR'),
        seat('sev-2', 'severnside', 'Morgan Lydney', 'GBR'),
        seat('sev-3', 'severnside', 'Tyler Thornbury', 'GBR'),
        seat('sev-4', 'severnside', 'Oscar Berkeley', 'GBR'),
        seat('nor-1', 'norfolk', 'Henry Wroxham', 'GBR'),
        seat('nor-2', 'norfolk', 'Alfie Horning', 'GBR'),
        seat('nor-3', 'norfolk', 'Jude Acle', 'GBR'),
        seat('nor-4', 'norfolk', 'Seb Potter Heigham', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['ginetta_junior'] },
    },
  ],
  eventFormats: [
    {
      id: 'race-meeting',
      name: 'Three races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 20, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 40,
          day: 0,
          inherit: { from: 'qualifying' },
          pointsSystem: 'race-1',
        },
        {
          id: 'race-2', type: 'race', name: 'Race 2', distance: 40, day: 1, inherit: { from: 'race-1' },
        },
        {
          type: 'race', name: 'Race 3', distance: 40, day: 1, inherit: { from: 'race-2' },
        },
      ],
    },
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
      positions: [35, 30, 26, 22, 20, 18, 16, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
      qualifying: [1],
    },
    {
      id: 'race',
      name: 'Race points',
      positions: [35, 30, 26, 22, 20, 18, 16, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
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
  entryFee: 900,
  prizes: {
    positions: [3000, 2100, 1500, 1100, 800, 600, 450, 300, 200, 100],
    standings: [22000, 13000, 9000, 6000, 4000],
  },
};
