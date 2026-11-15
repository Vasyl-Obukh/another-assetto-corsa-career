import { seat, team } from './utils.ts';
import {
  Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Copa Truck, 2024 - Brazil's truck racing championship, on First Studio
 * Race's Scania E-Truck.
 *
 * The season raced diesel Volkswagen, Iveco, Mercedes-Benz, Volvo and Scania
 * trucks; FSR's E-Truck is an electric racing truck of its own imagining, and
 * stands in for all of them. Eight of the nine meetings in the real order:
 * Campo Grande, Goiania, Londrina, Interlagos, Cascavel, Taruma, Curvelo and
 * the Goiania finale. The June meeting, moved from flooded Santa Cruz do Sul
 * to Potenza, is left out - Potenza has no recommended layout. Curvelo runs
 * its 4.4 km full circuit where the trucks raced a 3.3 km layout. The Pro and
 * Elite classes share one class here.
 *
 * Qualifying is twelve minutes for everyone, then a ten-minute top
 * qualifying for the eight fastest. Two races a meeting: the first from
 * qualifying, the second from the first's result with its top eight
 * reversed. Races of 25 minutes and a lap and 20 minutes and a lap run 50 km
 * and 40 km; Campo Grande's first race was 20 minutes and a lap too. Points
 * are 24-20-18-16-15-14-13-12-11-10-9-8-7-6-5 in the first race with a point
 * for pole, and 20-16-14-12-11-10-9-8-7-6-5-4-3-2-1 in the second, from the
 * sporting regulations; the two worst scores were dropped, which cannot be
 * stated. Curvelo's eighteen boxes cap a field that ran about thirty. The
 * field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2024_Copa_Truck_season
 */
export const COPA_TRUCK_2024_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'copa-truck-2024-fsr',
  name: 'Copa Truck 2024 (FSR)',
  description: {
    en: 'Brazil\'s truck racing championship of 2024 on First Studio Race\'s Scania E-Truck: eight '
      + 'meetings of two races, the second from a reversed grid.',
    uk: 'Бразильський чемпіонат з гонок на вантажівках 2024 року на Scania E-Truck від First Studio Race: '
      + 'вісім етапів по дві гонки, друга зі зворотної стартової решітки.',
  },
  teams: [
    team('serra-azul', 'Serra Azul Truck Racing', 'BRA', TeamBudget.WORKS),
    team('rodovia', 'Rodovia Competições', 'BRA', TeamBudget.WORKS),
    team('carreteiro', 'Carreteiro Motorsport', 'BRA', TeamBudget.WORKS),
    team('graneleiro', 'Graneleiro Racing', 'BRA', TeamBudget.INDEPENDENT),
    team('boiadeiro', 'Boiadeiro Truck Team', 'BRA', TeamBudget.INDEPENDENT),
    team('cegonha', 'Cegonha Racing', 'BRA', TeamBudget.INDEPENDENT),
    team('bitrem', 'Bitrem Motorsport', 'BRA', TeamBudget.PRIVATEER),
    team('estradeiro', 'Estradeiro Racing', 'BRA', TeamBudget.PRIVATEER),
    team('cavalo-mecanico', 'Cavalo Mecânico Competições', 'BRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'copa-truck',
      name: 'Copa Truck',
      ladder: { discipline: Discipline.TOURING, tier: 3 },
      seats: [
        seat('sea-1', 'serra-azul', 'Valmir Jundiaí', 'BRA'),
        seat('sea-2', 'serra-azul', 'Edson Atibaia', 'BRA'),
        seat('rod-1', 'rodovia', 'Gilberto Rio Verde', 'BRA'),
        seat('rod-2', 'rodovia', 'Adriano Jataí', 'BRA'),
        seat('car-1', 'carreteiro', 'Claudio Maringá', 'BRA'),
        seat('car-2', 'carreteiro', 'Rogério Apucarana', 'BRA'),
        seat('gra-1', 'graneleiro', 'Nelson Rondonópolis', 'BRA'),
        seat('gra-2', 'graneleiro', 'Wagner Sinop', 'BRA'),
        seat('boi-1', 'boiadeiro', 'Ademir Barretos', 'BRA'),
        seat('boi-2', 'boiadeiro', 'Luciano Franca', 'BRA'),
        seat('ceg-1', 'cegonha', 'Silvio Betim', 'BRA'),
        seat('ceg-2', 'cegonha', 'Patrícia Contagem', 'BRA'),
        seat('bit-1', 'bitrem', 'Osmar Dourados', 'BRA'),
        seat('bit-2', 'bitrem', 'Reinaldo Ponta Porã', 'BRA'),
        seat('est-1', 'estradeiro', 'Jair Uberaba', 'BRA'),
        seat('est-2', 'estradeiro', 'Everton Araxá', 'BRA'),
        seat('cav-1', 'cavalo-mecanico', 'Nilson Toledo', 'BRA'),
        seat('cav-2', 'cavalo-mecanico', 'Cleber Cascavel', 'BRA'),
      ],
      eligibility: { kind: 'cars', cars: ['etruck_scania'] },
    },
  ],
  eventFormats: [
    {
      id: 'race-meeting',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 40, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 12, day: 0 },
        {
          id: 'top-qualifying',
          type: 'qualify',
          name: 'Top qualifying',
          minutes: 10,
          day: 0,
          inherit: { from: 'qualifying', top: 8 },
        },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 50,
          day: 1,
          inherit: { from: 'top-qualifying' },
          pointsSystem: 'race-1',
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 40,
          day: 1,
          inherit: { from: 'race-1', reverse: 8 },
        },
      ],
    },
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'campo-grande',
      name: 'Campo Grande',
      track: recommendedTrack('campo-grande/full'),
      sessionLengths: [{ session: 'race-1', distance: 40 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'goiania',
      name: 'Goiania',
      track: recommendedTrack('goiania/mixed'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'londrina',
      name: 'Londrina',
      track: recommendedTrack('londrina/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'interlagos',
      name: 'Interlagos',
      track: recommendedTrack('interlagos/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'cascavel',
      name: 'Cascavel',
      track: recommendedTrack('cascavel/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'taruma',
      name: 'Taruma',
      track: recommendedTrack('taruma/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'curvelo',
      name: 'Curvelo',
      track: recommendedTrack('curvelo/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'goiania-2',
      name: 'Goiania II',
      track: recommendedTrack('goiania/mixed'),
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race-1',
      name: 'Race 1 points',
      positions: [24, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5],
      qualifying: [1],
    },
    {
      id: 'race',
      name: 'Race 2 points',
      positions: [20, 16, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 30 },
  generatedWeather: { climate: Climate.TEMPERATE, hemisphere: Hemisphere.SOUTH },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5000,
  prizes: {
    positions: [20000, 14000, 10000, 7600, 5800, 4400, 3200, 2400, 1600, 1000],
    standings: [160000, 100000, 64000, 42000, 26000],
  },
};
