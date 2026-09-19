import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Mazda MX-5 Cup, 2024 - America's one-make MX-5 series, on the Japanese
 * Pack's MX-5 Cup car.
 *
 * Seven double headers of forty-five-minute races, at IMSA's circuits. Five
 * are raced here: Daytona, Sebring, Laguna Seca, Virginia International
 * Raceway and Road Atlanta; Mid-Ohio and Canadian Tire Motorsport Park are not
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
  description: 'America\'s one-make MX-5 series in 2024: double headers of forty-five-minute races at '
    + 'five of its seven IMSA circuits.',
  teams: [
    team('hiroshima-usa', 'Irvine Motorsports', 'United States', 'USA', TeamBudget.WORKS),
    team('ohio-mx5', 'Buckeye Roadster Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('texas-mx5', 'Hill Country Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('carolina-mx5', 'Piedmont Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('canada-mx5', 'Laurentide Racing', 'Canada', 'CAN', TeamBudget.PRIVATEER),
    team('pnw-mx5', 'Cascade Motorsports', 'United States', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'mx5-cup',
      name: 'MX-5 Cup',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('irv-1', 'hiroshima-usa', 'Tyler Brennock', 'United States', 'USA'),
        seat('irv-2', 'hiroshima-usa', 'Kayla Vandermeer', 'United States', 'USA'),
        seat('irv-3', 'hiroshima-usa', 'Josh Ellerby', 'United States', 'USA'),
        seat('irv-4', 'hiroshima-usa', 'Colton Reese', 'United States', 'USA'),
        seat('buc-1', 'ohio-mx5', 'Brandon Kowalczyk', 'United States', 'USA'),
        seat('buc-2', 'ohio-mx5', 'Evan Moorfield', 'United States', 'USA'),
        seat('buc-3', 'ohio-mx5', 'Luke Garrity', 'United States', 'USA'),
        seat('hil-1', 'texas-mx5', 'Cody Rathbone', 'United States', 'USA'),
        seat('hil-2', 'texas-mx5', 'Blake Harlan', 'United States', 'USA'),
        seat('hil-3', 'texas-mx5', 'Travis Wendt', 'United States', 'USA'),
        seat('pie-1', 'carolina-mx5', 'Hunter Pruitt', 'United States', 'USA'),
        seat('pie-2', 'carolina-mx5', 'Garrett Lomax', 'United States', 'USA'),
        seat('pie-3', 'carolina-mx5', 'Sierra Dunaway', 'United States', 'USA'),
        seat('lau-1', 'canada-mx5', 'Mathieu Bergeron', 'Canada', 'CAN'),
        seat('lau-2', 'canada-mx5', 'Liam Fairholm', 'Canada', 'CAN'),
        seat('lau-3', 'canada-mx5', 'Samuel Côté', 'Canada', 'CAN'),
        seat('cas-1', 'pnw-mx5', 'Ryan Oldenburg', 'United States', 'USA'),
        seat('cas-2', 'pnw-mx5', 'Nate Kessler', 'United States', 'USA'),
        seat('cas-3', 'pnw-mx5', 'Morgan Tully', 'United States', 'USA'),
        seat('cas-4', 'pnw-mx5', 'Devin Achterberg', 'United States', 'USA'),
        seat('cas-5', 'pnw-mx5', 'Jordan Pelkey', 'United States', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_mazda_mx5_cup'] },
    },
  ],
  weekendFormats: [
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
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'daytona',
      name: 'Daytona',
      track: { id: 'rt_daytona', layout: 'sportscar' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sebring',
      name: 'Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Laguna Seca', track: { id: 'ks_laguna_seca' } },
    {
      id: 'vir',
      name: 'Virginia International Raceway',
      track: { id: 'vir', layout: 'full course' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-atlanta',
      name: 'Road Atlanta',
      track: { id: 'road_atlanta2018', layout: 'grandprix' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 87, aiLevelMin: 79, aiAggression: 50 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1500,
  prizes: {
    positions: [7000, 4900, 3500, 2650, 2050, 1550, 1100, 850, 550, 350],
    standings: [56000, 35000, 22500, 14500, 9000],
  },
};
