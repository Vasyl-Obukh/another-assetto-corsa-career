import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * European Le Mans Series, 2017 - the first season of the new LMP2s, on First
 * Studio Race's cars.
 *
 * Two classes of the real three. LMP2 is FSR's Ligier JS P217 and Dallara
 * P217, which raced the class beside the Oreca 07 and won three of its six
 * rounds; the Oreca has no FSR car. LMP3 is the LMP3 (2015, FSR) spec, the
 * Ligier JS P3 of the class with the Ginetta, its 2017 entries not checked;
 * the Norma M30 has no FSR car. LMGTE is left out, since FSR has no GTE car.
 *
 * All six rounds, four hours each, over the laps the overall winner covered -
 * Silverstone, Monza, the Red Bull Ring, Paul Ricard, Spa and Portimao.
 * Silverstone's and the Red Bull Ring's twenty-four boxes cap the grid.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in each class, half a point for every
 * other finisher and a point for pole. The field is invented, from ELMS_2025's
 * LMP2 paddock and the Le Mans Cup's LMP3 teams.
 *
 * Source: https://en.wikipedia.org/wiki/2017_European_Le_Mans_Series
 */
export const ELMS_2017_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'elms-2017-fsr',
  name: 'European Le Mans Series 2017 (FSR)',
  description: {
    en: 'Europe\'s endurance series of 2017 on First Studio Race\'s cars: the Ligier and Dallara in '
      + 'LMP2 and the first LMP3s, six four-hour races.',
    uk: 'Європейська серія гонок на витривалість 2017 року на машинах First Studio Race: Ligier і Dallara '
      + 'у LMP2 та перші LMP3, шість чотиригодинних гонок.',
  },
  teams: [
    team('rhone', 'Rhône Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'PRT', TeamBudget.INDEPENDENT),
    team('trent-valley', 'Trent Valley Prototypes', 'GBR', TeamBudget.INDEPENDENT),
    team('engadin', 'Engadin Racing', 'CHE', TeamBudget.PRIVATEER),
    team('warta', 'Warta Prototypes', 'POL', TeamBudget.PRIVATEER),
    team('gascogne', 'Gascogne Racing', 'FRA', TeamBudget.INDEPENDENT),
    team('flandres', 'Flandres Motorsport', 'BEL', TeamBudget.INDEPENDENT),
    team('tirol', 'Tirol Prototypes', 'AUT', TeamBudget.PRIVATEER),
    team('emilia', 'Emilia Corse', 'ITA', TeamBudget.INDEPENDENT),
    team('cornwall', 'Cornwall Racing', 'GBR', TeamBudget.PRIVATEER),
    team('meseta', 'Meseta Racing', 'ESP', TeamBudget.PRIVATEER),
    team('jutland', 'Jutland Prototypes', 'DNK', TeamBudget.PRIVATEER),
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
        seat('p2-tre-1', 'trent-valley', 'Oscar Hazeldine', 'GBR'),
        seat('p2-tre-2', 'trent-valley', 'Ewan Pargeter', 'GBR'),
        seat('p2-eng-1', 'engadin', 'Gian Andri Salis', 'CHE'),
        seat('p2-eng-2', 'engadin', 'Fadri Clalüna', 'CHE'),
        seat('p2-war-1', 'warta', 'Bartosz Kędzierski', 'POL'),
        seat('p2-war-2', 'warta', 'Mikołaj Szczepanik', 'POL'),
      ],
      eligibility: { kind: 'cars', cars: ['ligier_jsp217', 'lmp2_dallara_p217'] },
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
        seat('p3-emi-1', 'emilia', 'Federico Malaguti', 'ITA'),
        seat('p3-emi-2', 'emilia', 'Pietro Zanasi', 'ITA'),
        seat('p3-cor-1', 'cornwall', 'Jack Trevenna', 'GBR'),
        seat('p3-cor-2', 'cornwall', 'Alfie Penrose', 'GBR'),
        seat('p3-mes-1', 'meseta', 'Álvaro Cuesta', 'ESP'),
        seat('p3-mes-2', 'meseta', 'Íñigo Barrenetxea', 'ESP'),
        seat('p3-jut-1', 'jutland', 'Mads Kjeldgaard', 'DNK'),
        seat('p3-jut-2', 'jutland', 'Frederik Nørgaard', 'DNK'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP3_2015_FSR },
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
      id: 'silverstone',
      name: '4 Hours of Silverstone',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'monza',
      name: '4 Hours of Monza',
      track: recommendedTrack('monza/gp'),
      sessionLengths: [{ session: 'race', laps: 132 }],
    },
    {
      id: 'red-bull-ring',
      name: '4 Hours of Red Bull Ring',
      track: recommendedTrack('red-bull-ring/gp'),
      sessionLengths: [{ session: 'race', laps: 169 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'paul-ricard',
      name: '4 Hours of Le Castellet',
      track: recommendedTrack('paul-ricard/gp'),
      sessionLengths: [{ session: 'race', laps: 115 }],
    },
    {
      id: 'spa',
      name: '4 Hours of Spa',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'race', laps: 97 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'portimao',
      name: '4 Hours of Portimao',
      track: recommendedTrack('portimao/gp'),
      sessionLengths: [{ session: 'race', laps: 139 }],
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0.5, 0.5, 0.5, 0.5],
      qualifying: [1],
    },
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
