import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * International Race of Champions, 1973-74 - the first IROC, twelve champions
 * in identical Porsche Carrera RSRs.
 *
 * The real field in Porsche Pack 1's Carrera RSR 3.0, which is exactly what
 * IROC raced: one car, prepared identically, so that only the drivers differ.
 * The first three races ran on one event at Riverside and the fourth at
 * Daytona. Riverside is not in Assetto Corsa, so Laguna Seca - California's
 * other road course - stands in for it; Daytona's road course is raced as it
 * was. IROC started each race in reverse order of the one before, which the
 * Riverside event does.
 *
 * The race lengths and IROC's own points were not found, so the 9-6-4-3-2-1 of
 * the day and half-hour races stand in.
 *
 * Source: https://www.elferspot.com/en/magazine/the-history-of-the-iroc-porsche-911-carrera-3-0-rsr/
 */
export const IROC_1974: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'iroc-1974',
  name: 'International Race of Champions 1974',
  description: 'Twelve champions in identical Porsche Carrera RSRs: the first IROC, with Laguna Seca '
    + 'standing in for Riverside and each race lined up in reverse of the one before.',
  teams: [
    team('iroc', 'International Race of Champions', 'USA', TeamBudget.WORKS),
  ],
  entries: [
    {
      id: 'iroc',
      name: 'IROC',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      // The real field, in the order the series finished; the player takes the
      // last seat.
      seats: [
        seat('donohue', 'iroc', 'Mark Donohue', 'USA'),
        seat('follmer', 'iroc', 'George Follmer', 'USA'),
        seat('revson', 'iroc', 'Peter Revson', 'USA'),
        seat('unser', 'iroc', 'Bobby Unser', 'USA'),
        seat('foyt', 'iroc', 'A. J. Foyt', 'USA'),
        seat('hulme', 'iroc', 'Denny Hulme', 'NZL'),
        seat('fittipaldi', 'iroc', 'Emerson Fittipaldi', 'BRA'),
        seat('pearson', 'iroc', 'David Pearson', 'USA'),
        seat('petty', 'iroc', 'Richard Petty', 'USA'),
        seat('johncock', 'iroc', 'Gordon Johncock', 'USA'),
        seat('mccluskey', 'iroc', 'Roger McCluskey', 'USA'),
        seat('allison', 'iroc', 'Bobby Allison', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_porsche_911_carrera_rsr'] },
    },
  ],
  eventFormats: [
    {
      id: 'riverside',
      name: 'Three races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'race-1', type: 'race', name: 'Race 1', distance: 75, day: 0 },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 75,
          day: 1,
          inherit: { from: 'race-1', reverse: 12 },
        },
        { type: 'race', name: 'Race 3', distance: 75, day: 1, inherit: { from: 'race-2', reverse: 12 } },
      ],
    },
    {
      id: 'daytona',
      name: 'One race',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'race', name: 'Race 4', distance: 75, day: 0 },
      ],
    },
  ],
  defaultEventFormat: 'riverside',
  rounds: [
    { id: 'riverside', name: 'Riverside', track: { id: 'ks_laguna_seca' } },
    {
      id: 'daytona',
      name: 'Daytona',
      track: { id: 'rt_daytona', layout: 'sportscar' },
      eventFormat: 'daytona',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 6, aggression: 15 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 7500,
  prizes: {
    positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
    standings: [240000, 150000, 96000, 63000, 39000],
  },
};
