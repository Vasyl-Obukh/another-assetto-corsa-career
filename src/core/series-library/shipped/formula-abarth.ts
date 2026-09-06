import { Discipline } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula Abarth - the championship the Tatuus FA01 exists for.
 *
 * A real junior ladder rung, and a single-chassis one with a single car
 * installed, so it had a class, a spec and a car saying the same thing three
 * times over. The class and the spec are gone and the series names the car,
 * which is what an explicit car list is for.
 *
 * Its three-day format is the other thing it demonstrates: two races over one
 * weekend, which is only expressible at all because a session is now a launch
 * of its own.
 */
export const FORMULA_ABARTH: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-abarth',
  name: 'Formula Abarth',
  notes: 'A single-chassis junior formula on the Italian circuits. Two races a weekend, the '
    + 'second from a grid the first has already been run for.',
  entries: [
    {
      id: 'main',
      name: 'Formula Abarth',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 5 },
      entrants: 14,
      eligibility: { kind: 'cars', cars: ['tatuusfa1'] },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 20, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        { type: 'race', name: 'Race 1', laps: 10, day: 1 },
        { type: 'race', name: 'Race 2', laps: 12, day: 2 },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'vallelunga',
      name: 'Vallelunga',
      track: { id: 'ks_vallelunga', layout: 'extended_circuit' },
    },
    { id: 'magione', name: 'Magione', track: { id: 'magione' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
      pole: 1,
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 88, aiLevelMin: 80, aiAggression: 30 },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, slipstream: 1 },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1200,
  prizes: {
    positions: [4000, 2800, 2000, 1500, 1100, 800, 600, 400, 250, 150],
    standings: [30000, 18000, 12000, 8000, 5000],
  },
};
