import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * GT4 European Cup, 2010 - the base game's bottom rung of sportscar racing.
 *
 * The 2010 Cup ran two classes on one grid: GT4 proper, and SuperSport for the
 * lightweight track cars - the Lotus 2-Eleven and the KTM X-Bow, which are
 * exactly what the base game ships. Its GT4 class had no base car at all; the
 * Evora GTC stands in for Lotus' own Evora GT4, held back by ballast and a
 * restrictor to GT4 pace. The Maserati GranTurismo MC GT4 raced it and is DLC,
 * so it is not named: a car list is a requirement, and naming it would make
 * this a DLC championship.
 *
 * Six meetings of two races, five of them raced here: Silverstone, Spa, the
 * Nurburgring, Portimao and Magny-Cours. Paul Ricard is not in Assetto Corsa
 * and has no stand-in. The points are the Cup's
 * ten-point scale as its standings imply; the race length is not in the
 * sources found, so an hour, the length its rounds ran as a GT4 support race,
 * is an assumption.
 *
 * Source: https://en.wikipedia.org/wiki/2010_GT4_European_Cup
 */
export const GT4_EUROPEAN_CUP_2010: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt4-european-cup-2010',
  name: 'GT4 European Cup 2010',
  description: {
    en: 'Two classes on one grid: SuperSport for the 2-Eleven GT4 and the X-Bow R, and GT4, '
      + 'where the Evora GTC is restricted to stand in for Lotus\' own GT4 car. Five of the 2010 '
      + 'season\'s six meetings; Paul Ricard is not in Assetto Corsa.',
    uk: 'Два класи на одній стартовій решітці: SuperSport для 2-Eleven GT4 і X-Bow R та GT4, де обмежена '
      + 'Evora GTC замінює власну машину GT4 від Lotus. П\'ять із шести етапів сезону 2010 року; '
      + 'Поль-Рікара в Assetto Corsa немає.',
  },
  teams: [
    team('rhenus', 'Rhenus Racing', 'NLD', TeamBudget.INDEPENDENT),
    team('lindhoven', 'Lindhoven Motorsport', 'NLD', TeamBudget.PRIVATEER),
    team('chiltern', 'Chiltern Sportscars', 'GBR', TeamBudget.INDEPENDENT),
    team('tessin', 'Scuderia Tessin', 'CHE', TeamBudget.PRIVATEER),
    team('aegean', 'Aegean Motorsport', 'GRC', TeamBudget.PRIVATEER),
    team('eifelblick', 'Eifelblick Racing', 'DEU', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt4',
      name: 'GT4',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('gt4-rhe-1', 'rhenus', 'Pieter Mulder', 'NLD'),
        seat('gt4-rhe-2', 'rhenus', 'Sven Kroes', 'NLD'),
        seat('gt4-chi-1', 'chiltern', 'Rupert Haddon', 'GBR'),
        seat('gt4-chi-2', 'chiltern', 'Alasdair Kerr', 'GBR'),
        seat('gt4-eif-1', 'eifelblick', 'Moritz Kalkbrenner', 'DEU'),
        seat('gt4-lin-1', 'lindhoven', 'Ruud Verbeek', 'NLD'),
        seat('gt4-tes-1', 'tessin', 'Luca Bernasconi', 'CHE'),
        seat('gt4-aeg-1', 'aegean', 'Nikos Papadakis', 'GRC'),
      ],
      eligibility: { kind: 'cars', cars: ['lotus_evora_gtc'] },
      // 450 bhp on 1205 kg is GT3 pace; this brings it back to the 3.3 kg per
      // horsepower GT4 runs at.
      bop: [{ car: 'lotus_evora_gtc', ballast: 150, restrictor: 20 }],
      grid: { strength: -3 },
    },
    {
      id: 'supersport',
      name: 'SuperSport',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 5 },
      seats: [
        seat('ss-rhe-1', 'rhenus', 'Kevin Veldkamp', 'NLD'),
        seat('ss-lin-1', 'lindhoven', 'Daan Scheepers', 'NLD'),
        seat('ss-lin-2', 'lindhoven', 'Mila Hoekstra', 'NLD'),
        seat('ss-tes-1', 'tessin', 'Gianni Guidotti', 'CHE'),
        seat('ss-tes-2', 'tessin', 'Sandro Pedrazzini', 'CHE'),
        seat('ss-aeg-1', 'aegean', 'Anastasios Lamprou', 'GRC'),
        seat('ss-aeg-2', 'aegean', 'Eleni Vlachou', 'GRC'),
        seat('ss-eif-1', 'eifelblick', 'Tobias Ruland', 'DEU'),
        seat('ss-chi-1', 'chiltern', 'Hamish Fordyce', 'GBR'),
        seat('ss-eif-2', 'eifelblick', 'Jana Wesseling', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['lotus_2_eleven_gt4', 'ktm_xbow_r'] },
      grid: { strength: -6 },
      entryFee: 1100,
      prizes: {
        positions: [3000, 2100, 1500, 1150, 850, 600, 450, 300, 200, 100],
        standings: [21500, 13000, 9000, 6000, 3500],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 20, day: 0 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 20, day: 0 },
        {
          type: 'race', name: 'Race 1', distance: 140, day: 0, inherit: { from: 'qualifying-1' },
          classGrid: 'mixed',
        },
        {
          type: 'race', name: 'Race 2', distance: 140, day: 1, inherit: { from: 'qualifying-2' },
          classGrid: 'mixed',
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'portimao',
      name: 'Portimao',
      track: { id: 'algarve_portimao_2023', layout: 'lfm_nodrs' },
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'magny-cours',
      name: 'Magny-Cours',
      track: { id: 'magnycours22' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [10, 8, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 1800,
  prizes: {
    positions: [5000, 3500, 2500, 1900, 1400, 1000, 750, 500, 300, 200],
    standings: [36000, 22000, 15000, 10000, 6000],
  },
};
