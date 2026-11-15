import { seat, team } from './utils.ts';
import {
  Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A Turismo Nacional meeting of 2023: practice and two qualifying sessions on
 * Friday, four short races on Saturday in two back-to-back pairs - each pair's
 * first from one qualifying, its second from the first's result - and two
 * longer races on Sunday, one from each qualifying.
 * @param id Stable identifier of the format
 * @param name Display name
 * @param suffix Appended to every points system's id, for the finale's doubles
 * @returns The event format
 */
const meeting = (id: string, name: string, suffix = ''): EventFormat => ({
  id,
  name,
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
    { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 10, day: 0 },
    { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 10, day: 0 },
    {
      id: 'race-1',
      type: 'race',
      name: 'Race 1',
      distance: 40,
      day: 1,
      inherit: { from: 'qualifying-1' },
      pointsSystem: `long-pole${suffix}`,
    },
    {
      id: 'race-2',
      type: 'race',
      name: 'Race 2',
      distance: 40,
      day: 1,
      inherit: { from: 'race-1' },
      pointsSystem: `short${suffix}`,
    },
    {
      id: 'race-3',
      type: 'race',
      name: 'Race 3',
      distance: 40,
      day: 1,
      inherit: { from: 'qualifying-2' },
      pointsSystem: `long-pole${suffix}`,
    },
    {
      id: 'race-4',
      type: 'race',
      name: 'Race 4',
      distance: 40,
      day: 1,
      inherit: { from: 'race-3' },
      pointsSystem: `short${suffix}`,
    },
    {
      id: 'race-5',
      type: 'race',
      name: 'Race 5',
      distance: 50,
      day: 2,
      inherit: { from: 'qualifying-1' },
      pointsSystem: `long${suffix}`,
    },
    {
      id: 'race-6',
      type: 'race',
      name: 'Race 6',
      distance: 50,
      day: 2,
      inherit: { from: 'qualifying-2' },
      pointsSystem: `long${suffix}`,
    },
  ],
});

/**
 * Turismo Nacional, 2023 - Brazil's national championship for touring cars
 * built from small production hatchbacks and saloons, on First Studio Race's
 * Chevrolet Onix.
 *
 * The season was multi-make - Onix, Polo, Gol, Yaris, Argo, C3 and more on a
 * common powertrain kit - and FSR's Onix is the only one of them it builds, so
 * it races alone. All six meetings in the real order: Goiania, Taruma,
 * Interlagos, Goiania again, Velopark and Cascavel. The A and B driver
 * categories, the Senior and Rookie titles and the two-driver crews share one
 * class here.
 *
 * Six races a meeting: four of 15 minutes and a lap on Saturday, in pairs run
 * back to back, each pair's second lining up on the first's result; two of 20
 * minutes and a lap on Sunday. The Sunday races lined up on each driver's
 * second-best qualifying lap, which cannot be stated, so they line up on the
 * two qualifying sessions' results. The timed races run 40 km and 50 km, the
 * distances the field covered at Cascavel. Points are 22-18-15-14-13-12-11-10-
 * 9-8-7-6-5-4-3-2-1 in the first race of each pair and on Sunday, 18-15-13-
 * 12-11-10-9-8-7-6-5-4-3-2-1 in the second of each pair, with a point for pole
 * in each qualifying and one for the fastest lap in every race; the finale
 * pays double, its bonus points as read left single. The six worst results
 * were dropped, which cannot be stated. Velopark's twenty-three boxes fit the
 * field of about twenty. The field is invented.
 *
 * Source: https://cba.org.br/upload/downloads//686/turismo-nacional-regulamento-desportivo-2023-.pdf
 */
export const TURISMO_NACIONAL_2023_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'turismo-nacional-2023-fsr',
  name: 'Turismo Nacional 2023 (FSR)',
  description: {
    en: 'Brazil\'s national championship for small touring cars on First Studio Race\'s Chevrolet Onix: '
      + 'six meetings of six short races, the last at double points.',
    uk: 'Національний чемпіонат Бразилії для невеликих турингових машин на Chevrolet Onix від First Studio '
      + 'Race: шість етапів по шість коротких гонок, останній з подвійними очками.',
  },
  teams: [
    team('guaiba', 'Guaíba Racing', 'BRA', TeamBudget.INDEPENDENT),
    team('meia-ponte', 'Meia Ponte Motorsport', 'BRA', TeamBudget.INDEPENDENT),
    team('iguacu', 'Iguaçu Competições', 'BRA', TeamBudget.INDEPENDENT),
    team('jacui', 'Jacuí Racing', 'BRA', TeamBudget.PRIVATEER),
    team('capivari', 'Capivari Motorsport', 'BRA', TeamBudget.PRIVATEER),
    team('ribeira', 'Ribeira Racing', 'BRA', TeamBudget.PRIVATEER),
    team('taquari', 'Taquari Competições', 'BRA', TeamBudget.PRIVATEER),
    team('piracicaba', 'Piracicaba Racing', 'BRA', TeamBudget.PRIVATEER),
    team('araguaia', 'Araguaia Motorsport', 'BRA', TeamBudget.PRIVATEER),
    team('uruguai', 'Alto Uruguai Racing', 'BRA', TeamBudget.PRIVATEER),
    team('sapucai', 'Sapucaí Competições', 'BRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'turismo-nacional',
      name: 'Turismo Nacional',
      ladder: { discipline: Discipline.TOURING, tier: 5 },
      seats: [
        seat('gua-1', 'guaiba', 'Rafael Camaquã', 'BRA'),
        seat('gua-2', 'guaiba', 'Bruno Eldorado', 'BRA'),
        seat('mei-1', 'meia-ponte', 'Thiago Inhumas', 'BRA'),
        seat('mei-2', 'meia-ponte', 'Pedro Trindade', 'BRA'),
        seat('igu-1', 'iguacu', 'Felipe Medianeira', 'BRA'),
        seat('igu-2', 'iguacu', 'Gabriel Toledo', 'BRA'),
        seat('jac-1', 'jacui', 'Leandro Cachoeira', 'BRA'),
        seat('jac-2', 'jacui', 'Maurício Triunfo', 'BRA'),
        seat('cap-1', 'capivari', 'Daniel Itu', 'BRA'),
        seat('cap-2', 'capivari', 'Alexandre Indaiatuba', 'BRA'),
        seat('rib-1', 'ribeira', 'Juliano Registro', 'BRA'),
        seat('rib-2', 'ribeira', 'Otávio Iguape', 'BRA'),
        seat('taq-1', 'taquari', 'Cristiano Estrela', 'BRA'),
        seat('taq-2', 'taquari', 'Roberto Lajeado', 'BRA'),
        seat('pir-1', 'piracicaba', 'César Limeira', 'BRA'),
        seat('pir-2', 'piracicaba', 'Carla Americana', 'BRA'),
        seat('arg-1', 'araguaia', 'Wesley Barra do Garças', 'BRA'),
        seat('arg-2', 'araguaia', 'Igor Aruanã', 'BRA'),
        seat('uru-1', 'uruguai', 'Douglas Erechim', 'BRA'),
        seat('uru-2', 'uruguai', 'Murilo Chapecó', 'BRA'),
        seat('sap-1', 'sapucai', 'Hélio Pouso Alegre', 'BRA'),
        seat('sap-2', 'sapucai', 'Jonas Varginha', 'BRA'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_onix_2023'] },
    },
  ],
  eventFormats: [
    meeting('race-meeting', 'Six races'),
    meeting('finale', 'Six races, double points', '-double'),
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'goiania',
      name: 'Goiania',
      track: recommendedTrack('goiania/mixed'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'taruma',
      name: 'Taruma',
      track: recommendedTrack('taruma/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'interlagos',
      name: 'Interlagos',
      track: recommendedTrack('interlagos/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'goiania-2',
      name: 'Goiania II',
      track: recommendedTrack('goiania/mixed'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'velopark',
      name: 'Velopark',
      track: recommendedTrack('velopark/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'cascavel',
      name: 'Cascavel',
      track: recommendedTrack('cascavel/full'),
      eventFormat: 'finale',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'long-pole',
      name: 'First race points',
      positions: [22, 18, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
      qualifying: [1],
    },
    {
      id: 'short',
      name: 'Second race points',
      positions: [18, 15, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
    },
    {
      id: 'long',
      name: 'Sunday race points',
      positions: [22, 18, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
    },
    {
      id: 'long-pole-double',
      name: 'First race points, doubled',
      positions: [44, 36, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2],
      fastestLap: 1,
      qualifying: [1],
    },
    {
      id: 'short-double',
      name: 'Second race points, doubled',
      positions: [36, 30, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2],
      fastestLap: 1,
    },
    {
      id: 'long-double',
      name: 'Sunday race points, doubled',
      positions: [44, 36, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2],
      fastestLap: 1,
    },
  ],
  defaultPointsSystem: 'long',
  grid: { aggression: 25 },
  generatedWeather: { climate: Climate.TEMPERATE, hemisphere: Hemisphere.SOUTH },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 900,
  prizes: {
    positions: [3000, 2100, 1500, 1100, 800, 600, 450, 300, 200, 100],
    standings: [22000, 13000, 9000, 6000, 4000],
  },
};
