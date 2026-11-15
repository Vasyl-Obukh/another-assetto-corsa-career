import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Can-Am, 1973 - the Porsche 917/30's season, the most powerful road racer of
 * its day.
 *
 * Porsche Pack 1's 917/30, one-make: the real grid was 917s and McLarens, and
 * the base game has nothing to race it. Five of the eight rounds at their real
 * distances: Road Atlanta, Watkins Glen, Mid-Ohio, Road America and Laguna
 * Seca. Mosport, Edmonton and Riverside are not in Assetto Corsa. The season
 * changed its event format part-way through; this is its single race, over the
 * two hundred miles each ran. Points are 20-15-12-10-8-6-4-3-2-1. The field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/1973_Can-Am_season
 */
export const CAN_AM_1973: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'can-am-1973',
  name: 'Can-Am 1973',
  description: {
    en: 'The 917/30\'s season, one-make: five of the 1973 Can-Am rounds over their real two '
      + 'hundred miles.',
    uk: 'Сезон 917/30 як монокубок: п\'ять етапів Can-Am 1973 року на справжній дистанції '
      + 'у двісті миль.',
  },
  teams: [
    team('reading', 'Brandywine Racing', 'USA', TeamBudget.WORKS),
    team('rinzler', 'Lakeshore Can-Am', 'USA', TeamBudget.INDEPENDENT),
    team('shadow-canam', 'Nightfall Racing', 'USA', TeamBudget.INDEPENDENT),
    team('mosport-racing', 'Ontario Group 7', 'CAN', TeamBudget.PRIVATEER),
    team('europe-canam', 'Interserie Racing', 'DEU', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-7',
      name: 'Group 7',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('bra-1', 'reading', 'Hank Lassiter', 'USA'),
        seat('bra-2', 'reading', 'Curt Wendover', 'USA'),
        seat('lak-1', 'rinzler', 'Dale Brockway', 'USA'),
        seat('lak-2', 'rinzler', 'Jim Halvorsen', 'USA'),
        seat('nig-1', 'shadow-canam', 'Vic Tamberlane', 'USA'),
        seat('nig-2', 'shadow-canam', 'Scooter Maddox', 'USA'),
        seat('ont-1', 'mosport-racing', 'Gord McAllister', 'CAN'),
        seat('ont-2', 'mosport-racing', 'Rene Lachance', 'CAN'),
        seat('int-1', 'europe-canam', 'Helmut Kressler', 'DEU'),
        seat('int-2', 'europe-canam', 'Willi Bauernhofer', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_porsche_917_30'] },
    },
  ],
  eventFormats: [
    {
      id: 'road-atlanta',
      name: '200 miles (Road Atlanta)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: 'Race', laps: 79, day: 1 },
      ],
    },
    {
      id: 'watkins-glen',
      name: '200 miles (Watkins Glen)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: 'Race', laps: 59, day: 1 },
      ],
    },
    {
      id: 'mid-ohio',
      name: '200 miles (Mid-Ohio)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: 'Race', laps: 89, day: 1 },
      ],
    },
    {
      id: 'road-america',
      name: '200 miles (Road America)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: 'Race', laps: 50, day: 1 },
      ],
    },
    {
      id: 'laguna-seca',
      name: '200 miles (Laguna Seca)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 60, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: 'Race', laps: 89, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'road-atlanta',
  rounds: [
    {
      id: 'road-atlanta',
      name: 'Road Atlanta',
      track: recommendedTrack('road-atlanta/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen',
      track: recommendedTrack('watkins-glen/boot-classic'),
      eventFormat: 'watkins-glen',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mid-ohio',
      name: 'Mid-Ohio',
      track: recommendedTrack('mid-ohio/full'),
      eventFormat: 'mid-ohio',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America',
      track: recommendedTrack('road-america/full'),
      eventFormat: 'road-america',
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Laguna Seca', track: recommendedTrack('laguna-seca/full'), eventFormat: 'laguna-seca' },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 5 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
