import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, WeekendFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A weekend of the current format: practice and qualifying on Friday, on
 * Saturday a sprint with qualifying's top ten reversed, and on Sunday the
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
      distance: 120,
      day: 1,
      inherit: { from: 'qualifying', reverse: 10 },
      pointsSystem: 'sprint',
    },
    {
      id: 'feature',
      type: 'race',
      name: 'Feature race',
      distance: 170,
      day: 2,
      inherit: { from: 'qualifying' },
      pointsSystem: 'feature',
    },
  ],
};

/**
 * FIA Formula 2, 2024 - the second season of the current car.
 *
 * VRC's Formula Beta 2024 is that car; the same season on RSS's Formula RSS 2
 * V6 2024 is a championship of its own. Nine of fourteen rounds, each a sprint
 * on Saturday with qualifying's top ten reversed and a feature race on Sunday
 * from qualifying as it stood. The lengths are the series' usual ones; Imola's
 * are worked out from its distances rather than checked. Jeddah, Melbourne,
 * Monaco, Baku and Losail are not in Assetto Corsa. The feature race's
 * compulsory pit stop cannot be stated yet.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in the feature race, with 2 for pole and
 * 1 for the fastest lap, and 10-8-6-5-4-3-2-1 in the sprint, with 1 for the
 * fastest lap. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2024_FIA_Formula_2_Championship
 */
export const FORMULA_2_2024_VRC: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-2-2024-vrc',
  name: 'FIA Formula 2 2024 (VRC)',
  description: 'Formula 2 on VRC\'s Formula Beta 2024: nine rounds'
    + ' of a reverse-grid sprint and a feature race, on'
    + ' the 2024 calendar\'s circuits.',
  teams: [
    team('halcyon', 'Halcyon Racing', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('cervino', 'Cervino Corse', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('provence', 'Provence Formula', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('lowlands', 'Lowlands Motorsport', 'Netherlands', 'NED', TeamBudget.INDEPENDENT),
    team('tasman', 'Tasman Racing', 'Australia', 'AUS', TeamBudget.INDEPENDENT),
    team('andes', 'Andes Racing', 'Chile', 'CHI', TeamBudget.PRIVATEER),
    team('baltic', 'Baltic Formula', 'Estonia', 'EST', TeamBudget.PRIVATEER),
    team('sierra', 'Sierra Nevada Racing', 'Spain', 'ESP', TeamBudget.PRIVATEER),
    team('ganges', 'Ganges Motorsport', 'India', 'IND', TeamBudget.PRIVATEER),
    team('carioca', 'Carioca Racing', 'Brazil', 'BRA', TeamBudget.PRIVATEER),
    team('schwarzwald', 'Schwarzwald Racing', 'Germany', 'GER', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-2',
      name: 'Formula 2',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('hal-1', 'halcyon', 'Alfie Brookbank', 'Great Britain', 'GBR'),
        seat('hal-2', 'halcyon', 'Jasper Thornycroft', 'Great Britain', 'GBR'),
        seat('cer-1', 'cervino', 'Tommaso Vigliardi', 'Italy', 'ITA'),
        seat('cer-2', 'cervino', 'Leonardo Bressanin', 'Italy', 'ITA'),
        seat('pro-1', 'provence', 'Noé Castellane', 'France', 'FRA'),
        seat('pro-2', 'provence', 'Gaspard Estienne', 'France', 'FRA'),
        seat('low-1', 'lowlands', 'Sem Kooistra', 'Netherlands', 'NED'),
        seat('low-2', 'lowlands', 'Thijs Hogendijk', 'Netherlands', 'NED'),
        seat('tas-1', 'tasman', 'Hamish Pettigrove', 'Australia', 'AUS'),
        seat('tas-2', 'tasman', 'Cooper Wexford', 'Australia', 'AUS'),
        seat('and-1', 'andes', 'Matías Undurraga', 'Chile', 'CHI'),
        seat('and-2', 'andes', 'Vicente Echenique', 'Chile', 'CHI'),
        seat('bal-1', 'baltic', 'Rasmus Kõiv', 'Estonia', 'EST'),
        seat('bal-2', 'baltic', 'Karl-Martin Lepik', 'Estonia', 'EST'),
        seat('sie-1', 'sierra', 'Hugo Ribalta', 'Spain', 'ESP'),
        seat('sie-2', 'sierra', 'Adrián Zubieta', 'Spain', 'ESP'),
        seat('gan-1', 'ganges', 'Vihaan Kulkarni', 'India', 'IND'),
        seat('gan-2', 'ganges', 'Aarav Deshmane', 'India', 'IND'),
        seat('car-1', 'carioca', 'Enzo Baptistella', 'Brazil', 'BRA'),
        seat('car-2', 'carioca', 'Caio Vilarinho', 'Brazil', 'BRA'),
        seat('sch-1', 'schwarzwald', 'Moritz Kienzle', 'Germany', 'GER'),
        seat('sch-2', 'schwarzwald', 'Elias Frommknecht', 'Germany', 'GER'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_2_2024_VRC, minModels: 1 },
    },
  ],
  weekendFormats: [WEEKEND],
  defaultWeekendFormat: 'race-weekend',
  rounds: [
    { id: 'bahrain', name: 'Sakhir', track: { id: 'fn_bahrain', layout: 'gp' }, climate: Climate.ARID },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    {
      id: 'barcelona',
      name: 'Barcelona',
      track: { id: 'fn_barcelona', layout: 'barcelona_2023' },
      sessionLengths: [{ session: 'feature', laps: 37 }],
    },
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
      sessionLengths: [{ session: 'feature', laps: 37 }],
      climate: Climate.TEMPERATE,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    {
      id: 'yas-marina',
      name: 'Yas Marina',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      sessionLengths: [{ session: 'sprint', laps: 21 }],
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    {
      id: 'feature',
      name: 'Feature race',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
      qualifying: [2],
    },
    { id: 'sprint', name: 'Sprint race', positions: [10, 8, 6, 5, 4, 3, 2, 1], fastestLap: 1 },
  ],
  defaultPointsSystem: 'feature',
  grid: { aiLevel: 95, aiLevelMin: 87, aiAggression: 45 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 10000,
  prizes: {
    positions: [40000, 28000, 20000, 15200, 11600, 8800, 6400, 4800, 3200, 2000],
    standings: [320000, 200000, 128000, 84000, 52000],
  },
};
