import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A weekend of the current format: practice and qualifying on Friday, on
 * Saturday a sprint with qualifying's top twelve reversed, and on Sunday the
 * feature race from qualifying as it stood.
 */
const WEEKEND: WeekendFormat = {
  id: 'race-weekend',
  name: 'Sprint and feature',
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
    { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint race',
      distance: 80,
      day: 1,
      inherit: { from: 'qualifying', reverse: 12 },
      pointsSystem: 'sprint',
    },
    {
      id: 'feature',
      type: 'race',
      name: 'Feature race',
      distance: 117,
      day: 2,
      inherit: { from: 'qualifying' },
      pointsSystem: 'feature',
    },
  ],
};

/**
 * FIA Formula 3, 2024 - the rung below Formula 2, on the same weekends.
 *
 * RSS's Formula RSS 3 V6 is the 2019 car the series raced until 2024, and its
 * 2026 version the one after; either fields the grid. Eight of ten rounds,
 * each a sprint on Saturday with qualifying's top twelve reversed and a
 * feature race on Sunday from qualifying. The real grid is thirty cars, three
 * to a team; the Kunos layouts' twenty-four boxes hold eight teams. The
 * lengths are worked out from the series' usual distances rather than checked
 * round by round. Melbourne and Monaco are not in Assetto Corsa.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in the feature race, with 2 for pole and
 * 1 for the fastest lap, and 10-9-8-7-6-5-4-3-2-1 in the sprint, with 1 for
 * the fastest lap. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2024_FIA_Formula_3_Championship
 */
export const FORMULA_3_2024: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-3-2024',
  name: 'FIA Formula 3 2024',
  description: 'FIA Formula 3 on RSS\'s Formula RSS 3: eight rounds of a reverse-grid sprint and a '
    + 'feature race, three cars to a team.',
  teams: [
    team('glenmore', 'Glenmore Racing', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('ligure', 'Scuderia Ligure', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('ardennes', 'Ardennes Racing', 'Belgium', 'BEL', TeamBudget.INDEPENDENT),
    team('nordvik', 'Nordvik Motorsport', 'Sweden', 'SWE', TeamBudget.INDEPENDENT),
    team('pacifica', 'Pacifica Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('alcazar', 'Alcázar Racing', 'Spain', 'ESP', TeamBudget.PRIVATEER),
    team('eifel', 'Eifel Motorsport', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('southern-cross', 'Southern Cross Racing', 'New Zealand', 'NZL', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-3',
      name: 'Formula 3',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 3 },
      seats: [
        seat('gle-1', 'glenmore', 'Toby Ellerington', 'Great Britain', 'GBR'),
        seat('gle-2', 'glenmore', 'Archie Wainscott', 'Great Britain', 'GBR'),
        seat('gle-3', 'glenmore', 'Reuben Castlemaine', 'Great Britain', 'GBR'),
        seat('lig-1', 'ligure', 'Pietro Sanguineti', 'Italy', 'ITA'),
        seat('lig-2', 'ligure', 'Filippo Castagnola', 'Italy', 'ITA'),
        seat('lig-3', 'ligure', 'Riccardo Ferrandina', 'Italy', 'ITA'),
        seat('ard-1', 'ardennes', 'Victor Delvaux', 'Belgium', 'BEL'),
        seat('ard-2', 'ardennes', 'Arthur Wauthier', 'Belgium', 'BEL'),
        seat('ard-3', 'ardennes', 'Lucas Hennebert', 'Belgium', 'BEL'),
        seat('nor-1', 'nordvik', 'Elias Sundqvist', 'Sweden', 'SWE'),
        seat('nor-2', 'nordvik', 'Hugo Lindroth', 'Sweden', 'SWE'),
        seat('nor-3', 'nordvik', 'Axel Brännström', 'Sweden', 'SWE'),
        seat('pac-1', 'pacifica', 'Carter Brightwell', 'United States', 'USA'),
        seat('pac-2', 'pacifica', 'Mason Kirkland', 'United States', 'USA'),
        seat('pac-3', 'pacifica', 'Wyatt Sorensen', 'United States', 'USA'),
        seat('alc-1', 'alcazar', 'Nicolás Barreiro', 'Spain', 'ESP'),
        seat('alc-2', 'alcazar', 'Javier Olaizola', 'Spain', 'ESP'),
        seat('alc-3', 'alcazar', 'Sergio Montañana', 'Spain', 'ESP'),
        seat('eif-1', 'eifel', 'Paul Weidenbach', 'Germany', 'GER'),
        seat('eif-2', 'eifel', 'Jakob Hollerbach', 'Germany', 'GER'),
        seat('eif-3', 'eifel', 'Tim Eschweiler', 'Germany', 'GER'),
        seat('sou-1', 'southern-cross', 'Ollie Tremain', 'New Zealand', 'NZL'),
        seat('sou-2', 'southern-cross', 'Jack Rutherglen', 'New Zealand', 'NZL'),
        seat('sou-3', 'southern-cross', 'Ruben Takerei', 'New Zealand', 'NZL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_3, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    { id: 'bahrain', name: 'Sakhir', track: { id: 'fn_bahrain', layout: 'gp' }, climate: Climate.ARID },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'barcelona', name: 'Barcelona', track: { id: 'fn_barcelona', layout: 'barcelona_2023' } },
    {
      id: 'spielberg',
      name: 'Spielberg',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'budapest',
      name: 'Budapest',
      track: { id: 'rt_hungaroring' },
      sessionLengths: [{ session: 'sprint', laps: 18 }],
      climate: Climate.TEMPERATE,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
  ],
  pointsSystems: [
    {
      id: 'feature',
      name: 'Feature race',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
      qualifying: [2],
    },
    { id: 'sprint', name: 'Sprint race', positions: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], fastestLap: 1 },
  ],
  defaultPointsSystem: 'feature',
  grid: { strength: 1, aggression: 20 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5000,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
    standings: [200000, 125000, 80000, 52500, 32500],
  },
};
