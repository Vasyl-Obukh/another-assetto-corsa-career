import { seat, team } from './utils.ts';
import { CarSpec, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship, SeriesSession } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Saturday's knockout and the grand prix it lines up, which both formats run.
 *
 * Shared rather than written twice: a sprint weekend adds a chain of its own in
 * front of these, it does not change them, and two copies could drift.
 */
const GRAND_PRIX_DAY: readonly SeriesSession[] = [
  { id: 'q1', type: 'qualify', name: 'Q1', minutes: 18, day: 1 },
  {
    id: 'q2',
    type: 'qualify',
    name: 'Q2',
    minutes: 15,
    day: 1,
    inherit: { from: 'q1', top: 15 },
  },
  {
    id: 'q3',
    type: 'qualify',
    name: 'Q3',
    minutes: 12,
    day: 1,
    inherit: { from: 'q2', top: 10 },
  },
  { type: 'race', name: 'Grand Prix', laps: 25, day: 2, inherit: { from: 'q3' } },
];

/**
 * Formula 1 2023 - the knockout exemplar.
 *
 * The only shipped championship that needs content Assetto Corsa does not
 * ship, and deliberately so. Knockout qualifying and the sprint weekend are
 * what Formula 1 runs, and there is no base-game car that could carry them
 * honestly - so it sits on VRC's Formula Alpha 2023, and anyone without the
 * mod sees it unavailable with VRC named, which is what the provenance
 * catalogue is for.
 *
 * Its sprint weekend is the thing no earlier format could say: two chains on
 * one weekend, SQ1 to SQ3 into the sprint and Q1 to Q3 into the grand prix.
 * "The last qualifying before this race" would line the sprint up behind the
 * wrong one, which is why a session names where its grid comes from.
 *
 * Zandvoort is missing from an otherwise real calendar because Assetto
 * Corsa's has eighteen pit boxes against a twenty-car field, so
 * seriesAvailability would report it rather than race it.
 */
export const FORMULA_1_2023: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2023',
  name: 'Formula 1 2023',
  description: 'Twenty cars, knockout qualifying and two sprint rounds, on VRC\'s Formula Alpha 2023. '
    + 'The mod is a single car in twenty liveries rather than ten distinct chassis, so the field '
    + 'is one spec on merit alone. Liveries are assigned automatically, since which of them a '
    + 'copy of the mod installs is not ours to assume.',
  teams: [
    team('red-bull', 'Red Bull Racing', 'Austria', 'AUT', TeamBudget.WORKS),
    team('mercedes', 'Mercedes', 'Germany', 'GER', TeamBudget.WORKS),
    team('ferrari', 'Ferrari', 'Italy', 'ITA', TeamBudget.WORKS),
    team('aston-martin', 'Aston Martin', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('mclaren', 'McLaren', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('alpine', 'Alpine', 'France', 'FRA', TeamBudget.WORKS),
    team('williams', 'Williams', 'Great Britain', 'GBR'),
    team('alphatauri', 'AlphaTauri', 'Italy', 'ITA'),
    team('alfa-romeo', 'Alfa Romeo', 'Switzerland', 'SUI'),
    team('haas', 'Haas', 'United States', 'USA'),
  ],
  entries: [
    {
      id: 'main',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Ordered as the season finished, so the class ramp from 96 down to 86
      // lines the field up roughly on merit. A seat states a level of its own
      // only where that ramp gets a driver wrong - all three below were well
      // adrift of the car under them.
      seats: [
        seat('rbr-1', 'red-bull', 'Max Verstappen', 'Netherlands', 'NED'),
        seat('rbr-2', 'red-bull', 'Sergio Perez', 'Mexico', 'MEX', 93),
        seat('mer-1', 'mercedes', 'Lewis Hamilton', 'Great Britain', 'GBR'),
        seat('mer-2', 'mercedes', 'George Russell', 'Great Britain', 'GBR'),
        seat('fer-1', 'ferrari', 'Charles Leclerc', 'Monaco', 'MON'),
        seat('fer-2', 'ferrari', 'Carlos Sainz', 'Spain', 'ESP'),
        seat('amr-1', 'aston-martin', 'Fernando Alonso', 'Spain', 'ESP'),
        seat('amr-2', 'aston-martin', 'Lance Stroll', 'Canada', 'CAN', 90),
        seat('mcl-1', 'mclaren', 'Lando Norris', 'Great Britain', 'GBR'),
        seat('mcl-2', 'mclaren', 'Oscar Piastri', 'Australia', 'AUS'),
        seat('alp-1', 'alpine', 'Esteban Ocon', 'France', 'FRA'),
        seat('alp-2', 'alpine', 'Pierre Gasly', 'France', 'FRA'),
        seat('wil-1', 'williams', 'Alexander Albon', 'Thailand', 'THA'),
        seat('wil-2', 'williams', 'Logan Sargeant', 'United States', 'USA', 87),
        seat('at-1', 'alphatauri', 'Yuki Tsunoda', 'Japan', 'JPN'),
        seat('at-2', 'alphatauri', 'Daniel Ricciardo', 'Australia', 'AUS'),
        seat('alf-1', 'alfa-romeo', 'Valtteri Bottas', 'Finland', 'FIN'),
        seat('alf-2', 'alfa-romeo', 'Zhou Guanyu', 'China', 'CHN'),
        seat('haa-1', 'haas', 'Nico Hulkenberg', 'Germany', 'GER'),
        seat('haa-2', 'haas', 'Kevin Magnussen', 'Denmark', 'DEN'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2023_VRC, minModels: 1 },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Practice 1', minutes: 60, day: 0 },
        { type: 'practice', name: 'Practice 2', minutes: 60, day: 0 },
        { type: 'practice', name: 'Practice 3', minutes: 60, day: 1 },
        ...GRAND_PRIX_DAY,
      ],
    },
    {
      id: 'sprint',
      name: 'Sprint weekend',
      sessions: [
        { type: 'practice', name: 'Practice 1', minutes: 60, day: 0 },
        { id: 'sq1', type: 'qualify', name: 'SQ1', minutes: 12, day: 0 },
        {
          id: 'sq2',
          type: 'qualify',
          name: 'SQ2',
          minutes: 10,
          day: 0,
          inherit: { from: 'sq1', top: 15 },
        },
        {
          id: 'sq3',
          type: 'qualify',
          name: 'SQ3',
          minutes: 8,
          day: 0,
          inherit: { from: 'sq2', top: 10 },
        },
        {
          type: 'race',
          name: 'Sprint',
          laps: 8,
          day: 1,
          inherit: { from: 'sq3' },
          pointsSystem: 'sprint',
        },
        ...GRAND_PRIX_DAY,
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    { id: 'barcelona', name: 'Spain', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    { id: 'imola', name: 'Emilia-Romagna', track: { id: 'imola' } },
    {
      id: 'red-bull-ring',
      name: 'Austria',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      weekendFormat: 'sprint',
    },
    { id: 'silverstone', name: 'Great Britain', track: { id: 'ks_silverstone', layout: 'gp' } },
    { id: 'spa', name: 'Belgium', track: { id: 'spa' }, weekendFormat: 'sprint' },
    { id: 'monza', name: 'Italy', track: { id: 'monza' } },
    {
      id: 'nurburgring',
      name: 'Germany',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
    },
    { id: 'sprint', name: 'Sprint points', positions: [8, 7, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 96, aiLevelMin: 86, aiAggression: 40 },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, slipstream: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 0,
  prizes: {
    positions: [8000, 5600, 4000, 3000, 2200, 1600, 1200, 800, 500, 300],
    standings: [60000, 36000, 24000, 16000, 10000],
  },
};
