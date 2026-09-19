import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * European Le Mans Series, 2025 - four-hour races for LMP2 and LMGT3.
 *
 * Three classes of the real four. LMP2 and LMP2 Pro/Am are both the LMP2
 * (2021) spec, the Oreca 07 of Yezhrod, LFM and URD - the same car, the Pro/Am
 * class for crews with an amateur in them; LMGT3 is the GT3 (LFM) spec. LMP3
 * has no car and is left out. Five of six rounds, four hours each - Barcelona, Imola, Spa,
 * Silverstone and Portimao; Paul Ricard is not in Assetto Corsa. Silverstone's
 * twenty-four boxes cap the grid.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in each class with a point for pole. The
 * field is invented, from the LMP2 and LMGT3 paddocks of the WEC seasons.
 *
 * Source: https://en.wikipedia.org/wiki/2025_European_Le_Mans_Series
 */
export const ELMS_2025: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'elms-2025',
  name: 'European Le Mans Series 2025',
  description: 'Europe\'s endurance series of 2025 on the Oreca 07 in LMP2 and LMP2 Pro/Am and LFM\'s GT3s'
    + ' in LMGT3: five four-hour races.',
  teams: [
    team('rhone', 'Rhône Endurance', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'Portugal', 'POR', TeamBudget.INDEPENDENT),
    team('trent-valley', 'Trent Valley Prototypes', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('engadin', 'Engadin Racing', 'Switzerland', 'SUI', TeamBudget.PRIVATEER),
    team('warta', 'Warta Prototypes', 'Poland', 'POL', TeamBudget.PRIVATEER),
    team('allegheny', 'Allegheny Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('rennsport-eifel', 'Rennsport Eifel', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('lumiere', 'Garage Lumière', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('albion', 'Albion Endurance', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('lone-oak', 'Lone Oak Racing', 'United States', 'USA', TeamBudget.PRIVATEER),
    team('dune', 'Dune Racing', 'United Arab Emirates', 'UAE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'lmp2',
      name: 'LMP2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('p2-rho-1', 'rhone', 'Bastien Lagarrigue', 'France', 'FRA'),
        seat('p2-rho-2', 'rhone', 'Mathéo Coudray', 'France', 'FRA'),
        seat('p2-alg-1', 'algarve', 'Diogo Ferrão', 'Portugal', 'POR'),
        seat('p2-alg-2', 'algarve', 'Henrique Salgueiro', 'Portugal', 'POR'),
        seat('p2-tre-1', 'trent-valley', 'Oscar Hazeldine', 'Great Britain', 'GBR'),
        seat('p2-tre-2', 'trent-valley', 'Ewan Pargeter', 'Great Britain', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP2_2021, minModels: 1 },
    },
    {
      id: 'lmp2-pro-am',
      name: 'LMP2 Pro/Am',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('p2-eng-1', 'engadin', 'Gian Andri Salis', 'Switzerland', 'SUI'),
        seat('p2-eng-2', 'engadin', 'Fadri Clalüna', 'Switzerland', 'SUI'),
        seat('p2-war-1', 'warta', 'Bartosz Kędzierski', 'Poland', 'POL'),
        seat('p2-war-2', 'warta', 'Mikołaj Szczepanik', 'Poland', 'POL'),
        seat('p2-all-1', 'allegheny', 'Brett Lindell', 'United States', 'USA'),
        seat('p2-all-2', 'allegheny', 'Cole Harrigan', 'United States', 'USA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP2_2021, minModels: 1 },
      grid: { aiLevel: 90, aiLevelMin: 84 },
      prizes: {
        positions: [37500, 26250, 18750, 14250, 10900, 8250, 6000, 4500, 3000, 1900],
        standings: [300000, 187500, 120000, 79000, 49000],
      },
    },
    {
      id: 'lmgt3',
      name: 'LMGT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('gt-ren-1', 'rennsport-eifel', 'Florian Wirtgen', 'Germany', 'GER'),
        seat('gt-ren-2', 'rennsport-eifel', 'Matthias Lehnhoff', 'Germany', 'GER'),
        seat('gt-lar-1', 'lario', 'Gabriele Tentori', 'Italy', 'ITA'),
        seat('gt-lar-2', 'lario', 'Luca Bonacina', 'Italy', 'ITA'),
        seat('gt-lum-1', 'lumiere', 'Hugo Delacourt', 'France', 'FRA'),
        seat('gt-lum-2', 'lumiere', 'Mathis Garrigue', 'France', 'FRA'),
        seat('gt-alb-1', 'albion', 'Oliver Kingswell', 'Great Britain', 'GBR'),
        seat('gt-alb-2', 'albion', 'James Parrington', 'Great Britain', 'GBR'),
        seat('gt-lon-1', 'lone-oak', 'Tucker Branscombe', 'United States', 'USA'),
        seat('gt-lon-2', 'lone-oak', 'Evan Culpepper', 'United States', 'USA'),
        seat('gt-dun-1', 'dune', 'Sultan Al Kaabi', 'United Arab Emirates', 'UAE'),
        seat('gt-dun-2', 'dune', 'Rashed Al Shamsi', 'United Arab Emirates', 'UAE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_LFM, minModels: 3 },
      grid: { aiLevel: 91, aiLevelMin: 84 },
      prizes: {
        positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
        standings: [240000, 150000, 96000, 63000, 39000],
      },
    },
  ],
  weekendFormats: [
    {
      id: 'four-hours',
      name: 'Four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '4 Hours', laps: 126, day: 2 },
      ],
    },
  ],
  defaultWeekendFormat: 'four-hours',
  rounds: [
    {
      id: 'barcelona',
      name: '4 Hours of Barcelona',
      track: { id: 'fn_barcelona', layout: 'barcelona_2023_48_pits_lfm_nodrs_v2' },
      sessionLengths: [{ session: 'race', laps: 130 }],
    },
    { id: 'imola', name: '4 Hours of Imola', track: { id: 'fn_imola', layout: 'lfm' } },
    {
      id: 'spa',
      name: '4 Hours of Spa',
      track: { id: 'spa', layout: '2022_lfm_standing' },
      sessionLengths: [{ session: 'race', laps: 88 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone',
      name: '4 Hours of Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 104 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'portimao',
      name: '4 Hours of Portimao',
      track: { id: 'algarve_portimao_2023', layout: 'lfm_nodrs' },
      sessionLengths: [{ session: 'race', laps: 135 }],
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 94, aiLevelMin: 86, aiAggression: 30 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 15000,
  prizes: {
    positions: [50000, 35000, 25000, 19000, 14500, 11000, 8000, 6000, 4000, 2500],
    standings: [400000, 250000, 160000, 105000, 65000],
  },
};
