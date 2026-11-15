import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Michelin Le Mans Cup, 2021 - LMP3 and GT3 on First Studio Race's cars.
 *
 * LMP3 is the LMP3 (2020, FSR) spec: the Ligier JS P320, Duqueine D08 and
 * ADESS-03 Evo that raced the class, with FSR's two Ginettas, which are not on
 * the season's entry list. GT3 is the GT3 (FSR) spec: the Aston Martin Vantage
 * that raced, the 992 GT3 R standing in for the 991.2, the 296 for the 488
 * Evo and the R8 LMS Evo II for the Evo; the spec's Lamborghini, McLaren,
 * Mustang and GR GT3 did not race it, and the Mercedes-AMG has no FSR car.
 *
 * All six events: two hours at Barcelona, Paul Ricard, Monza, Spa and
 * Portimao, and the two 55-minute races of the Road to Le Mans on the 24
 * Hours' circuit. The race lengths are the real races' minutes turned into
 * laps at LMP3 pace, not checked against the results. Barcelona races its
 * 2023 layout, since the only known version of the chicane layout of 2021 has
 * twenty-four boxes for thirty cars. Paul Ricard's thirty-six boxes cap the
 * grid.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in each class, half a point for every
 * other finisher and a point for pole; each Road to Le Mans race pays
 * 15-9-7-6-5-4-3-2-1 and a half point down the order. The field is invented,
 * LE_MANS_CUP_2023's.
 *
 * Source: https://en.wikipedia.org/wiki/2021_Le_Mans_Cup
 */
export const LE_MANS_CUP_2021_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'le-mans-cup-2021-fsr',
  name: 'Le Mans Cup 2021 (FSR)',
  description: {
    en: 'The ELMS\'s feeder of 2021 on First Studio Race\'s cars: LMP3s and GT3s in two-hour races, '
      + 'and the Road to Le Mans on the 24 Hours\' circuit.',
    uk: 'Молодший чемпіонат ELMS 2021 року на машинах First Studio Race: LMP3 та GT3 у двогодинних '
      + 'гонках і Road to Le Mans на трасі 24 годин.',
  },
  teams: [
    team('gascogne', 'Gascogne Racing', 'FRA', TeamBudget.WORKS),
    team('flandres', 'Flandres Motorsport', 'BEL', TeamBudget.INDEPENDENT),
    team('tirol', 'Tirol Prototypes', 'AUT', TeamBudget.INDEPENDENT),
    team('emilia', 'Emilia Corse', 'ITA', TeamBudget.INDEPENDENT),
    team('cornwall', 'Cornwall Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('meseta', 'Meseta Racing', 'ESP', TeamBudget.PRIVATEER),
    team('jutland', 'Jutland Prototypes', 'DNK', TeamBudget.PRIVATEER),
    team('vistula', 'Vistula Racing', 'POL', TeamBudget.PRIVATEER),
    team('bourgogne', 'Bourgogne GT', 'FRA', TeamBudget.INDEPENDENT),
    team('rheinland', 'Rheinland GT', 'DEU', TeamBudget.INDEPENDENT),
    team('ticino', 'Ticino Racing', 'CHE', TeamBudget.PRIVATEER),
    team('douro', 'Douro Racing', 'PRT', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'lmp3',
      name: 'LMP3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('p3-gas-1', 'gascogne', 'Antoine Larrieu', 'FRA'),
        seat('p3-gas-2', 'gascogne', 'Baptiste Darrigade', 'FRA'),
        seat('p3-gas-3', 'gascogne', 'Lilian Etcheverry', 'FRA'),
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
        seat('p3-vis-1', 'vistula', 'Bartosz Kowalczyk', 'POL'),
        seat('p3-vis-2', 'vistula', 'Igor Malinowski', 'POL'),
        seat('p3-vis-3', 'vistula', 'Tymon Grabowski', 'POL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP3_2020_FSR },
    },
    {
      id: 'gt3',
      name: 'GT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('gt-bou-1', 'bourgogne', 'Hugo Montbard', 'FRA'),
        seat('gt-bou-2', 'bourgogne', 'Paul Chevillard', 'FRA'),
        seat('gt-bou-3', 'bourgogne', 'Arthur Vauchey', 'FRA'),
        seat('gt-rhe-1', 'rheinland', 'Moritz Kesseler', 'DEU'),
        seat('gt-rhe-2', 'rheinland', 'Jannik Oberhausen', 'DEU'),
        seat('gt-rhe-3', 'rheinland', 'Tobias Wingender', 'DEU'),
        seat('gt-tic-1', 'ticino', 'Matteo Bernasconi', 'CHE'),
        seat('gt-tic-2', 'ticino', 'Luca Sciaroni', 'CHE'),
        seat('gt-tic-3', 'ticino', 'Gianluca Pedrazzini', 'CHE'),
        seat('gt-dou-1', 'douro', 'Tiago Vasconcelos', 'PRT'),
        seat('gt-dou-2', 'douro', 'Rui Magalhães', 'PRT'),
        seat('gt-dou-3', 'douro', 'Duarte Pimentel', 'PRT'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_FSR },
    },
  ],
  eventFormats: [
    {
      id: 'two-hours',
      name: 'Two hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 15, day: 0 },
        { id: 'race', type: 'race', name: 'Race', laps: 63, day: 1 },
      ],
    },
    {
      id: 'road-to-le-mans',
      name: 'Road to Le Mans',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', classes: 'apart', name: 'Qualifying 1', minutes: 15, day: 0 },
        { id: 'qualifying-2', type: 'qualify', classes: 'apart', name: 'Qualifying 2', minutes: 15, day: 0 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          laps: 13,
          day: 1,
          inherit: { from: 'qualifying-1' },
          pointsSystem: 'le-mans',
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          laps: 13,
          day: 2,
          inherit: { from: 'qualifying-2' },
          pointsSystem: 'le-mans',
        },
      ],
    },
  ],
  defaultEventFormat: 'two-hours',
  rounds: [
    {
      id: 'barcelona',
      name: 'Barcelona',
      track: recommendedTrack('barcelona/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'paul-ricard',
      name: 'Le Castellet',
      track: recommendedTrack('paul-ricard/gp'),
      sessionLengths: [{ session: 'race', laps: 57 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'monza',
      name: 'Monza',
      track: recommendedTrack('monza/gp'),
      sessionLengths: [{ session: 'race', laps: 62 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'le-mans',
      name: 'Road to Le Mans',
      track: recommendedTrack('le-mans/24h'),
      eventFormat: 'road-to-le-mans',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spa',
      name: 'Spa-Francorchamps',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'race', laps: 49 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'portimao',
      name: 'Portimao',
      track: recommendedTrack('portimao/gp'),
      sessionLengths: [{ session: 'race', laps: 65 }],
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [
        25, 18, 15, 12, 10, 8, 6, 4, 2, 1,
        0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
      ],
      qualifying: [1],
    },
    {
      id: 'le-mans',
      name: 'Road to Le Mans points',
      positions: [
        15, 9, 7, 6, 5, 4, 3, 2, 1, 0.5,
        0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5,
      ],
      qualifying: [1],
    },
  ],
  defaultPointsSystem: 'race',
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 9000,
  prizes: {
    positions: [36000, 25200, 18000, 13700, 10450, 7900, 5750, 4300, 2900, 1800],
    standings: [288000, 180000, 115000, 75500, 47000],
  },
};
