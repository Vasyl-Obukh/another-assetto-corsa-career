import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * The GTEs of the 2015 season, URD's Valor, 9SR and Ferruccio, and the Venom
 * where the Viper raced.
 */
const GTE = ['urd_egt_am', 'urd_egt_darche', 'urd_egt_ferruccio', 'urd_egt_venom'];

/**
 * FIA World Endurance Championship, 2015 - Porsche's first title with the 919
 * Hybrid, on URD's PX cars.
 *
 * LMP1, LMP2 and GTE. LMP1 is the LMP1 2015 (URD) spec - the PX1 Aura, Darche,
 * Shiro and Revolution standing for the Audi R18, the Porsche 919, the Nissan
 * GT-R LM and the Rebellion R-One; LMP2 is URD's PX2 Loire, the Oreca 05. GTE
 * is URD's EGT cars of the season, one class where the real season split GTE
 * Pro from GTE Am, since a split by driver means nothing to AI drivers.
 * Silverstone's twenty-four boxes cap the grid. All eight rounds: six hours at Silverstone, Spa, the
 * Nurburgring, the Circuit of the Americas, Fuji, Shanghai and Bahrain, and
 * Le Mans at double points over 2015's 395 laps. The six-hour races run the
 * laps the 2016 season's covered at each circuit, not checked against 2015's.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 with a point for pole. The field is
 * invented, the paddock of the 2014 and 2016 seasons.
 *
 * Source: https://en.wikipedia.org/wiki/2015_FIA_World_Endurance_Championship
 */
export const WEC_2015: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2015',
  name: 'World Endurance Championship 2015',
  description: {
    en: 'The 2015 season on URD\'s PX1 prototypes, the PX2 Loire in LMP2 and URD\'s GTEs: all eight'
      + ' rounds, Le Mans at double points.',
    uk: 'Сезон 2015 року на прототипах PX1 від URD, з PX2 Loire в LMP2 та GTE від URD: усі вісім'
      + ' етапів, Ле-Ман із подвійними очками.',
  },
  teams: [
    team('ingolstadt-lmp', 'Neuburg Prototype Team', 'DEU', TeamBudget.WORKS),
    team('weissach-lmp', 'Leonberg Hybrid Racing', 'DEU', TeamBudget.WORKS),
    team('atsugi', 'Atsugi Prototype Racing', 'JPN', TeamBudget.WORKS),
    team('leman', 'Léman Endurance', 'CHE', TeamBudget.INDEPENDENT),
    team('rhone', 'Rhône Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'PRT', TeamBudget.INDEPENDENT),
    team('gte-italia', 'Squadra Prancing Endurance', 'ITA', TeamBudget.WORKS),
    team('gte-uk', 'Gaydon Endurance', 'GBR', TeamBudget.WORKS),
    team('gte-de', 'Zuffenhausen Endurance', 'DEU', TeamBudget.WORKS),
    team('rennsport-eifel', 'Rennsport Eifel', 'DEU', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'ITA', TeamBudget.INDEPENDENT),
    team('gte-usa', 'Bowling Green Racing', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'lmp1',
      name: 'LMP1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('lmp-neu-1', 'ingolstadt-lmp', 'Martin Kesselring', 'DEU'),
        seat('lmp-neu-2', 'ingolstadt-lmp', 'Loïc Dambreville', 'DEU'),
        seat('lmp-leo-1', 'weissach-lmp', 'Florian Hessenauer', 'DEU'),
        seat('lmp-leo-2', 'weissach-lmp', 'Nick Halbrook', 'DEU'),
        seat('lmp-ats-1', 'atsugi', 'Daichi Furusawa', 'JPN'),
        seat('lmp-ats-2', 'atsugi', 'Owen Pritchard', 'GBR'),
        seat('lmp-lem-1', 'leman', 'Mathias Rochat', 'CHE'),
        seat('lmp-lem-2', 'leman', 'Nicolas Prod\'hom', 'CHE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP1_2015_URD },
    },
    {
      id: 'lmp2',
      name: 'LMP2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('p2-rho-1', 'rhone', 'Bastien Lagarrigue', 'FRA'),
        seat('p2-rho-2', 'rhone', 'Mathéo Coudray', 'FRA'),
        seat('p2-alg-1', 'algarve', 'Diogo Ferrão', 'PRT'),
        seat('p2-alg-2', 'algarve', 'Henrique Salgueiro', 'PRT'),
      ],
      eligibility: { kind: 'cars', cars: ['urd_px2_loire'] },
      entryFee: 12000,
      prizes: {
        positions: [48000, 33600, 24000, 18250, 13900, 10550, 7700, 5750, 3850, 2400],
        standings: [384000, 240000, 153500, 101000, 62500],
      },
    },
    {
      id: 'gte',
      name: 'GTE',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('gte-ita-1', 'gte-italia', 'Davide Rinaldini', 'ITA'),
        seat('gte-ita-2', 'gte-italia', 'Tommaso Scarpelli', 'ITA'),
        seat('gte-uk-1', 'gte-uk', 'Harry Wickstead', 'GBR'),
        seat('gte-uk-2', 'gte-uk', 'Toby Carrow', 'GBR'),
        seat('gte-de-1', 'gte-de', 'Lukas Riedmüller', 'DEU'),
        seat('gte-de-2', 'gte-de', 'Patrick Henneberg', 'DEU'),
        seat('gt-ren-1', 'rennsport-eifel', 'Florian Wirtgen', 'DEU'),
        seat('gt-ren-2', 'rennsport-eifel', 'Matthias Lehnhoff', 'DEU'),
        seat('gt-lar-1', 'lario', 'Gabriele Tentori', 'ITA'),
        seat('gt-lar-2', 'lario', 'Luca Bonacina', 'ITA'),
        seat('gte-usa-1', 'gte-usa', 'Garrett Fairbanks', 'USA'),
        seat('gte-usa-2', 'gte-usa', 'Jordan Tollefson', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: GTE },
      entryFee: 12000,
      prizes: {
        positions: [48000, 33600, 24000, 18250, 13900, 10550, 7700, 5750, 3850, 2400],
        standings: [384000, 240000, 153500, 101000, 62500],
      },
    },
  ],
  eventFormats: [
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 194, day: 2 },
      ],
    },
    {
      id: 'le-mans',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 120, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 395, day: 2, pointsSystem: 'le-mans' },
      ],
    },
  ],
  defaultEventFormat: 'six-hours',
  rounds: [
    {
      id: 'silverstone',
      name: '6 Hours of Silverstone',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'race', laps: 160 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'le-mans',
      name: '24 Hours of Le Mans',
      track: recommendedTrack('le-mans/24h'),
      eventFormat: 'le-mans',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nurburgring',
      name: '6 Hours of the Nurburgring',
      track: recommendedTrack('nurburgring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'cota',
      name: '6 Hours of the Circuit of the Americas',
      track: recommendedTrack('cota/gp'),
      sessionLengths: [{ session: 'race', laps: 186 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'fuji',
      name: '6 Hours of Fuji',
      track: recommendedTrack('fuji/gp'),
      sessionLengths: [{ session: 'race', laps: 244 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'shanghai',
      name: '6 Hours of Shanghai',
      track: recommendedTrack('shanghai/gp'),
      sessionLengths: [{ session: 'race', laps: 195 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: '6 Hours of Bahrain',
      track: recommendedTrack('bahrain/gp'),
      sessionLengths: [{ session: 'race', laps: 201 }],
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1] },
    {
      id: 'le-mans',
      name: 'Le Mans, double points',
      positions: [50, 36, 30, 24, 20, 16, 12, 8, 4, 2],
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
  entryFee: 20000,
  prizes: {
    positions: [80000, 56000, 40000, 30400, 23200, 17600, 12800, 9600, 6400, 4000],
    standings: [640000, 400000, 256000, 168000, 104000],
  },
};
