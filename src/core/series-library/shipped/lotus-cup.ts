import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Lotus Cup - three classes, one calendar, one grid.
 *
 * The multi-class exemplar, and a real championship rather than a shape
 * invented to exercise the schema: Lotus Cup Europe runs its own classes on one
 * entry list with separate standings, and every car it needs is base content.
 *
 * The classes are Lotus Cup Europe's own. V6 is the six-cylinder cars - the
 * Exige V6 Cup, the Evora GX, and the Exige S that shares their engine, the
 * two race cars held back to the road car. Open is the supercharged
 * four-cylinder track cars, the 2-Eleven and the Exige 240R. Production is
 * the Elise - the class the real series keeps for a naturally aspirated one,
 * which the base game does not ship, so the supercharged SC stands in.
 *
 * Base Assetto Corsa ships no prototype class, so WEC's own shape cannot be
 * built base-only. This is the closest real thing that can, and it exercises
 * the same things: several class entries on one shared grid, a tier per class
 * entry rather than per championship, and balance of performance applied to
 * the AI and to the player alike.
 */
export const LOTUS_CUP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'lotus-cup',
  name: 'Lotus Cup',
  description: {
    en: 'Lotus Cup Europe\'s three classes on one grid, scored separately: V6, Open and '
      + 'Production. The race cars in V6 are balanced to the Exige S.',
    uk: 'Три класи Lotus Cup Europe на одній стартовій решітці з окремим заліком: V6, Open і Production. '
      + 'Гоночні машини у V6 вирівняно під Exige S.',
  },
  teams: [
    team('hethel', 'Hethel Race Group', 'GBR', TeamBudget.INDEPENDENT),
    team('brooklands', 'Brooklands Lightweight', 'GBR', TeamBudget.INDEPENDENT),
    team('ardennes', 'Ecurie Ardennes', 'BEL', TeamBudget.PRIVATEER),
    team('kleinsee', 'Kleinsee Sportwagen', 'DEU', TeamBudget.PRIVATEER),
    team('ostwind', 'Ostwind Clubsport', 'NLD', TeamBudget.PRIVATEER),
    team('valdarno', 'Valdarno Corse', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'v6',
      name: 'V6',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      // The teams run cars in every class, which is the point of holding them
      // on the championship rather than on a class entry.
      seats: [
        seat('v6-hethel-1', 'hethel', 'Gareth Pryce', 'GBR'),
        seat('v6-hethel-2', 'hethel', 'Imogen Shaw', 'GBR'),
        seat('v6-brook-1', 'brooklands', 'Neil Garrick', 'GBR'),
        seat('v6-ard-1', 'ardennes', 'Vincent Delacroix', 'BEL'),
        seat('v6-kle-1', 'kleinsee', 'Hanno Reimer', 'DEU'),
        seat('v6-val-1', 'valdarno', 'Cesare Bonanno', 'ITA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['lotus_exige_v6_cup', 'lotus_evora_gx', 'lotus_exige_s'],
      },
      // Both race cars are brought to the road car, the Evora GX furthest:
      // it is a Grand-Am car against a track-day special.
      bop: [
        { car: 'lotus_evora_gx', ballast: 60, restrictor: 10 },
        { car: 'lotus_exige_v6_cup', ballast: 60 },
      ],
    },
    {
      id: 'open',
      name: 'Open',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      seats: [
        seat('opn-brook-1', 'brooklands', 'Fraser Dunnett', 'GBR'),
        seat('opn-ard-1', 'ardennes', 'Mathieu Servais', 'BEL'),
        seat('opn-ost-1', 'ostwind', 'Bram Kuipers', 'NLD'),
        seat('opn-ost-2', 'ostwind', 'Joost Tielemans', 'NLD'),
        seat('opn-kle-1', 'kleinsee', 'Sabine Nowak', 'DEU'),
        seat('opn-val-1', 'valdarno', 'Emilio Rasetti', 'ITA'),
      ],
      eligibility: { kind: 'cars', cars: ['lotus_2_eleven', 'lotus_exige_240'] },
      // 252 bhp on 670 kg against 243 on 930: the 2-Eleven carries weight.
      bop: [{ car: 'lotus_2_eleven', ballast: 110 }],
    },
    {
      id: 'production',
      name: 'Production',
      ladder: { discipline: Discipline.ROAD, tier: 5 },
      seats: [
        seat('prd-hethel-1', 'hethel', 'Dermot Kavanagh', 'IRL'),
        seat('prd-brook-1', 'brooklands', 'Sally Wenlock', 'GBR'),
        seat('prd-brook-2', 'brooklands', 'Toby Ferreira', 'ZAF'),
        seat('prd-ard-1', 'ardennes', 'Lotte Vandenberghe', 'BEL'),
        seat('prd-ost-1', 'ostwind', 'Femke Dijkstra', 'NLD'),
        seat('prd-val-1', 'valdarno', 'Rocco Santambrogio', 'ITA'),
      ],
      eligibility: { kind: 'cars', cars: ['lotus_elise_sc'] },
      grid: { strength: -4 },
      entryFee: 1200,
      prizes: {
        positions: [3600, 2500, 1800, 1300, 950, 700, 550, 350, 250, 100],
        standings: [27000, 16000, 11000, 7000, 4500],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 25, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        { type: 'race', classGrid: 'mixed', name: 'Race', distance: 55, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'magione', name: 'Magione', track: { id: 'magione' } },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    {
      id: 'zandvoort', name: 'Zandvoort', track: { id: 'ks_zandvoort' }, climate: Climate.TEMPERATE,
    },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 1,
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -2 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 50, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2000,
  prizes: {
    positions: [6000, 4200, 3000, 2200, 1600, 1200, 900, 600, 400, 200],
    standings: [45000, 27000, 18000, 12000, 7500],
  },
};
