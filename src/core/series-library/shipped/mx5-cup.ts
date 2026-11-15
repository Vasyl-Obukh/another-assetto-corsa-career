import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Mazda MX-5 Cup, 2024 - America's one-make MX-5 series, on the Japanese
 * Pack's MX-5 Cup car.
 *
 * Seven double headers of forty-five-minute races, at IMSA's circuits. Six
 * are raced here: Daytona, Sebring, Laguna Seca, Mid-Ohio, Virginia
 * International Raceway and Road Atlanta; Canadian Tire Motorsport Park is not
 * in Assetto Corsa. The points are the common 25-18-15 scale: the series' own
 * table was not found in full. Laguna Seca's twenty-four boxes cap the grid.
 * The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2024_Mazda_MX-5_Cup
 */
export const MX5_CUP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'mx5-cup',
  name: 'Mazda MX-5 Cup 2024',
  description: {
    en: 'America\'s one-make MX-5 series in 2024: double headers of forty-five-minute races at '
      + 'six of its seven IMSA circuits.',
    uk: 'Американський монокубок MX-5 сезону 2024: по дві гонки по сорок п\'ять хвилин за етап на шести з '
      + 'семи його трас IMSA.',
  },
  teams: [
    team('hiroshima-usa', 'Irvine Motorsports', 'USA', TeamBudget.WORKS),
    team('ohio-mx5', 'Buckeye Roadster Racing', 'USA', TeamBudget.INDEPENDENT),
    team('texas-mx5', 'Hill Country Racing', 'USA', TeamBudget.PRIVATEER),
    team('carolina-mx5', 'Piedmont Racing', 'USA', TeamBudget.PRIVATEER),
    team('canada-mx5', 'Laurentide Racing', 'CAN', TeamBudget.PRIVATEER),
    team('pnw-mx5', 'Cascade Motorsports', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'mx5-cup',
      name: 'MX-5 Cup',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('irv-1', 'hiroshima-usa', 'Tyler Brennock', 'USA'),
        seat('irv-2', 'hiroshima-usa', 'Kayla Vandermeer', 'USA'),
        seat('irv-3', 'hiroshima-usa', 'Josh Ellerby', 'USA'),
        seat('irv-4', 'hiroshima-usa', 'Colton Reese', 'USA'),
        seat('buc-1', 'ohio-mx5', 'Brandon Kowalczyk', 'USA'),
        seat('buc-2', 'ohio-mx5', 'Evan Moorfield', 'USA'),
        seat('buc-3', 'ohio-mx5', 'Luke Garrity', 'USA'),
        seat('hil-1', 'texas-mx5', 'Cody Rathbone', 'USA'),
        seat('hil-2', 'texas-mx5', 'Blake Harlan', 'USA'),
        seat('hil-3', 'texas-mx5', 'Travis Wendt', 'USA'),
        seat('pie-1', 'carolina-mx5', 'Hunter Pruitt', 'USA'),
        seat('pie-2', 'carolina-mx5', 'Garrett Lomax', 'USA'),
        seat('pie-3', 'carolina-mx5', 'Sierra Dunaway', 'USA'),
        seat('lau-1', 'canada-mx5', 'Mathieu Bergeron', 'CAN'),
        seat('lau-2', 'canada-mx5', 'Liam Fairholm', 'CAN'),
        seat('lau-3', 'canada-mx5', 'Samuel Côté', 'CAN'),
        seat('cas-1', 'pnw-mx5', 'Ryan Oldenburg', 'USA'),
        seat('cas-2', 'pnw-mx5', 'Nate Kessler', 'USA'),
        seat('cas-3', 'pnw-mx5', 'Morgan Tully', 'USA'),
        seat('cas-4', 'pnw-mx5', 'Devin Achterberg', 'USA'),
        seat('cas-5', 'pnw-mx5', 'Jordan Pelkey', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_mazda_mx5_cup'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Double header',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { id: 'race-1', type: 'race', name: 'Race 1', distance: 95, day: 0, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 95, day: 1, inherit: { from: 'race-1' } },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'daytona',
      name: 'Daytona',
      track: recommendedTrack('daytona/road'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sebring',
      name: 'Sebring',
      track: recommendedTrack('sebring/full'),
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Laguna Seca', track: recommendedTrack('laguna-seca/full') },
    {
      id: 'mid-ohio',
      name: 'Mid-Ohio',
      track: recommendedTrack('mid-ohio/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vir',
      name: 'Virginia International Raceway',
      track: recommendedTrack('vir/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-atlanta',
      name: 'Road Atlanta',
      track: recommendedTrack('road-atlanta/gp'),
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1500,
  prizes: {
    positions: [7000, 4900, 3500, 2650, 2050, 1550, 1100, 850, 550, 350],
    standings: [56000, 35000, 22500, 14500, 9000],
  },
};
