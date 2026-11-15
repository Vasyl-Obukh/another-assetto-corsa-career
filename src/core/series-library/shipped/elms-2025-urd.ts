import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * European Le Mans Series, 2025 - LMP2, LMP3 and LMGT3, on URD's cars.
 *
 * The same season as ELMS_2025, its calendar, formats and field, with URD's
 * cars in every class. LMP2 is URD's Loire 07 of 2021, the Oreca 07, one
 * class as in ELMS_2025; LMP3 is the LMP3 (2020, URD) spec, URD's Legion
 * PX320 - the Ligier JS P320 - standing for the JS P325 and the other new
 * LMP3s of 2025, on the same rung as LMGT3; LMGT3 is the GT3 (URD) spec. All
 * six rounds, four hours each - Barcelona, Paul Ricard, Imola, Spa,
 * Silverstone and Portimao. Silverstone's twenty-four
 * boxes cap the grid, so each class fields fewer cars than ELMS_2025's.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in each class with a point for pole. The
 * field is invented, ELMS_2025's with the Le Mans Cup's LMP3 teams.
 *
 * Source: https://en.wikipedia.org/wiki/2025_European_Le_Mans_Series
 */
export const ELMS_2025_URD: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'elms-2025-urd',
  name: 'European Le Mans Series 2025 (URD)',
  description: {
    en: 'Europe\'s endurance series of 2025 on URD\'s cars: the Oreca 07 in LMP2, the PX320 in LMP3 '
      + 'and URD\'s GT3s in LMGT3, six four-hour races.',
    uk: 'Європейська серія гонок на витривалість 2025 року на машинах URD: Oreca 07 у LMP2, PX320 '
      + 'у LMP3 та GT3 від URD у LMGT3, шість чотиригодинних гонок.',
  },
  teams: [
    team('rhone', 'Rhône Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'PRT', TeamBudget.INDEPENDENT),
    team('engadin', 'Engadin Racing', 'CHE', TeamBudget.PRIVATEER),
    team('warta', 'Warta Prototypes', 'POL', TeamBudget.PRIVATEER),
    team('gascogne', 'Gascogne Racing', 'FRA', TeamBudget.INDEPENDENT),
    team('flandres', 'Flandres Motorsport', 'BEL', TeamBudget.INDEPENDENT),
    team('tirol', 'Tirol Prototypes', 'AUT', TeamBudget.PRIVATEER),
    team('rennsport-eifel', 'Rennsport Eifel', 'DEU', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'ITA', TeamBudget.INDEPENDENT),
    team('lumiere', 'Garage Lumière', 'FRA', TeamBudget.INDEPENDENT),
    team('albion', 'Albion Endurance', 'GBR', TeamBudget.INDEPENDENT),
    team('lone-oak', 'Lone Oak Racing', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'lmp2',
      name: 'LMP2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('p2-rho-1', 'rhone', 'Bastien Lagarrigue', 'FRA'),
        seat('p2-rho-2', 'rhone', 'Mathéo Coudray', 'FRA'),
        seat('p2-alg-1', 'algarve', 'Diogo Ferrão', 'PRT'),
        seat('p2-alg-2', 'algarve', 'Henrique Salgueiro', 'PRT'),
        seat('p2-eng-1', 'engadin', 'Gian Andri Salis', 'CHE'),
        seat('p2-eng-2', 'engadin', 'Fadri Clalüna', 'CHE'),
        seat('p2-war-1', 'warta', 'Bartosz Kędzierski', 'POL'),
        seat('p2-war-2', 'warta', 'Mikołaj Szczepanik', 'POL'),
      ],
      eligibility: { kind: 'cars', cars: ['urd_loire07_21'] },
    },
    {
      id: 'lmp3',
      name: 'LMP3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('p3-gas-1', 'gascogne', 'Antoine Larrieu', 'FRA'),
        seat('p3-gas-2', 'gascogne', 'Baptiste Darrigade', 'FRA'),
        seat('p3-fla-1', 'flandres', 'Wout Verbeke', 'BEL'),
        seat('p3-fla-2', 'flandres', 'Senne De Smet', 'BEL'),
        seat('p3-tir-1', 'tirol', 'Lukas Hechenberger', 'AUT'),
        seat('p3-tir-2', 'tirol', 'Fabian Kirchmair', 'AUT'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP3_2020_URD },
      entryFee: 9000,
      prizes: {
        positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
        standings: [240000, 150000, 96000, 63000, 39000],
      },
    },
    {
      id: 'lmgt3',
      name: 'LMGT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('gt-ren-1', 'rennsport-eifel', 'Florian Wirtgen', 'DEU'),
        seat('gt-ren-2', 'rennsport-eifel', 'Matthias Lehnhoff', 'DEU'),
        seat('gt-lar-1', 'lario', 'Gabriele Tentori', 'ITA'),
        seat('gt-lar-2', 'lario', 'Luca Bonacina', 'ITA'),
        seat('gt-lum-1', 'lumiere', 'Hugo Delacourt', 'FRA'),
        seat('gt-lum-2', 'lumiere', 'Mathis Garrigue', 'FRA'),
        seat('gt-alb-1', 'albion', 'Oliver Kingswell', 'GBR'),
        seat('gt-alb-2', 'albion', 'James Parrington', 'GBR'),
        seat('gt-lon-1', 'lone-oak', 'Tucker Branscombe', 'USA'),
        seat('gt-lon-2', 'lone-oak', 'Evan Culpepper', 'USA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_URD },
      entryFee: 9000,
      prizes: {
        positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
        standings: [240000, 150000, 96000, 63000, 39000],
      },
    },
  ],
  eventFormats: [
    {
      id: 'four-hours',
      name: 'Four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '4 Hours', laps: 126, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'four-hours',
  rounds: [
    {
      id: 'barcelona',
      name: '4 Hours of Barcelona',
      track: recommendedTrack('barcelona/gp'),
      sessionLengths: [{ session: 'race', laps: 130 }],
    },
    {
      id: 'paul-ricard',
      name: 'Paul Ricard',
      track: recommendedTrack('paul-ricard/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'imola', name: '4 Hours of Imola', track: recommendedTrack('imola/gp') },
    {
      id: 'spa',
      name: '4 Hours of Spa',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'race', laps: 88 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone',
      name: '4 Hours of Silverstone',
      track: recommendedTrack('silverstone/gp'),
      sessionLengths: [{ session: 'race', laps: 104 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'portimao',
      name: '4 Hours of Portimao',
      track: recommendedTrack('portimao/gp'),
      sessionLengths: [{ session: 'race', laps: 135 }],
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1] },
  ],
  defaultPointsSystem: 'race',
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 15000,
  prizes: {
    positions: [50000, 35000, 25000, 19000, 14500, 11000, 8000, 6000, 4000, 2500],
    standings: [400000, 250000, 160000, 105000, 65000],
  },
};
