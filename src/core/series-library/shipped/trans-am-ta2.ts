import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Trans-Am TA2 - America's spec pony-car class.
 *
 * VRC's ARC TA2 Chevrette, Dagger and Mare stand for the Camaro, Challenger
 * and Mustang the class races, on one chassis and one engine. The calendar is
 * the American road courses the series races that Assetto Corsa has - Sebring,
 * Road Atlanta, Lime Rock, Watkins Glen, Road America, VIR and the Circuit of
 * the Americas - rather than one season's, which was not checked. Real TA2
 * grids run past thirty; this one is twenty-four.
 *
 * Races run an hour and the 25-18-15 scale scores them, both stand-ins: the
 * series' own lengths and points were not checked. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/Trans-Am_Series
 */
export const TRANS_AM_TA2: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'trans-am-ta2',
  name: 'Trans-Am TA2',
  description: 'America\'s spec pony-car class on VRC\'s TA2 Chevrette, Dagger and Mare: hour-long races '
    + 'at seven American road courses.',
  teams: [
    team('smoky', 'Smoky Mountain Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('bayou', 'Bayou Motorsports', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('rust-belt', 'Rust Belt Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('mojave', 'Mojave Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('ozark', 'Ozark Performance', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('chesapeake', 'Chesapeake Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('high-desert', 'High Desert Motorsports', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('red-river', 'Red River Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('piedmont', 'Piedmont Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('big-sky', 'Big Sky Motorsports', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('lake-erie', 'Lake Erie Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('palmetto', 'Palmetto Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'ta2',
      name: 'TA2',
      ladder: { discipline: Discipline.TOURING, tier: 3 },
      seats: [
        seat('smo-1', 'smoky', 'Clint Harwell', 'United States', 'USA'),
        seat('smo-2', 'smoky', 'Rusty Pettibone', 'United States', 'USA'),
        seat('bay-1', 'bayou', 'Remy Boudreaux', 'United States', 'USA'),
        seat('bay-2', 'bayou', 'Luc Fontenot', 'United States', 'USA'),
        seat('rus-1', 'rust-belt', 'Frank Dombrowski', 'United States', 'USA'),
        seat('rus-2', 'rust-belt', 'Greg Yablonski', 'United States', 'USA'),
        seat('moj-1', 'mojave', 'Cruz Delgadillo', 'United States', 'USA'),
        seat('moj-2', 'mojave', 'Travis Mayhall', 'United States', 'USA'),
        seat('oza-1', 'ozark', 'Bo Whitsett', 'United States', 'USA'),
        seat('oza-2', 'ozark', 'Cody Hargis', 'United States', 'USA'),
        seat('che-1', 'chesapeake', 'Wes Tilghman', 'United States', 'USA'),
        seat('che-2', 'chesapeake', 'Parker Loudon', 'United States', 'USA'),
        seat('hig-1', 'high-desert', 'Rick Archuleta', 'United States', 'USA'),
        seat('hig-2', 'high-desert', 'Dusty Chaves', 'United States', 'USA'),
        seat('red-1', 'red-river', 'Tate Lockhart', 'United States', 'USA'),
        seat('red-2', 'red-river', 'Shane Pirtle', 'United States', 'USA'),
        seat('pie-1', 'piedmont', 'Chad Honeycutt', 'United States', 'USA'),
        seat('pie-2', 'piedmont', 'Dale Yount', 'United States', 'USA'),
        seat('big-1', 'big-sky', 'Jed Halvorson', 'United States', 'USA'),
        seat('big-2', 'big-sky', 'Casey Brekke', 'United States', 'USA'),
        seat('lak-1', 'lake-erie', 'Mark Tomczak', 'United States', 'USA'),
        seat('lak-2', 'lake-erie', 'Kyle Brennaman', 'United States', 'USA'),
        seat('pal-1', 'palmetto', 'Carson Legare', 'United States', 'USA'),
        seat('pal-2', 'palmetto', 'Heath Rawl', 'United States', 'USA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.TRANS_AM_TA2, minModels: 2 },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        { type: 'race', name: 'Race', distance: 155, day: 1 },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'sebring',
      name: 'Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-atlanta',
      name: 'Road Atlanta',
      track: { id: 'road_atlanta2018', layout: 'grandprix' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'lime-rock',
      name: 'Lime Rock Park',
      track: { id: 'rt_lime_rock_park', layout: 'no_chicane' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen',
      track: { id: 'lilski_watkins_glen', layout: 'boot' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America',
      track: { id: 'lilski_road_america' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'vir',
      name: 'Virginia International Raceway',
      track: { id: 'vir', layout: 'full course' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'cota',
      name: 'Circuit of the Americas',
      track: { id: 'acu_unitedstates' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 91, aiLevelMin: 83, aiAggression: 60 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 4000,
  prizes: {
    positions: [15000, 10500, 7500, 5700, 4350, 3300, 2400, 1800, 1200, 750],
    standings: [120000, 75000, 48000, 31500, 19500],
  },
};
