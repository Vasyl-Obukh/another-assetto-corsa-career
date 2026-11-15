import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Stock Car Pro Series, 2023 - Brazil's premier touring car series, on First
 * Studio Race's Corolla and Cruze.
 *
 * FSR's 2023 Toyota Corolla and Chevrolet Cruze make up the spec and are the
 * two makes that raced the season. Eleven of twelve rounds in the real order:
 * Goiania's mixed circuit, Interlagos, Taruma, Cascavel, Interlagos again, Velo
 * Citta, Goiania's external circuit, Velopark, Velo Citta and Cascavel again,
 * and the Super Final at Interlagos. The ninth round, at Buenos Aires, has no
 * recommended track. The Brasilia round planned for November became the second
 * Cascavel round.
 *
 * Each round runs a three-part knockout on the Saturday - fifteen cars into Q2,
 * six into Q3, the counts read off two results pages - and two races back to
 * back on the Sunday, the second from the first's result with its top ten
 * reversed. The real races run thirty minutes; Assetto Corsa times no race
 * offline, so each is the 80 km that half an hour and a lap covered at
 * Goiania's opening race, 21 laps of its mixed circuit.
 *
 * Points are 30-26-22-19-17-15-14-13-12-11 down to a point for twentieth in the
 * first race, with two for pole, and 24-20-18-17-16 down to a point in the
 * second. The four worst results the real season dropped cannot be dropped
 * here, and the Super Final scores as any other round. Velo Citta's eighteen
 * boxes cap a field of thirty-two; dropping both of its rounds would only gain
 * five cars, since Velopark holds twenty-three. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2023_Stock_Car_Pro_Series
 */
export const STOCK_CAR_PRO_2023_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'stock-car-pro-2023-fsr',
  name: 'Stock Car Pro Series 2023 (FSR)',
  description: {
    en: 'Brazil\'s top touring car series of 2023 on First Studio Race\'s Corolla and Cruze: two '
      + 'races a round, the second with the top ten reversed, from Goiania to the Super Final at Interlagos.',
    uk: 'Головна кузовна серія Бразилії 2023 року на Corolla і Cruze від First Studio Race: дві гонки '
      + 'за етап, у другій перша десятка стартує у зворотному порядку, від Гоянії до Суперфіналу в Інтерлагосі.',
  },
  teams: [
    team('cerrado', 'Cerrado Racing', 'BRA', TeamBudget.WORKS),
    team('paulista', 'Paulista Competições', 'BRA', TeamBudget.WORKS),
    team('guanabara', 'Guanabara Motorsport', 'BRA', TeamBudget.WORKS),
    team('pampa', 'Pampa Racing', 'BRA', TeamBudget.INDEPENDENT),
    team('serra-gaucha', 'Serra Gaúcha Motorsport', 'BRA', TeamBudget.INDEPENDENT),
    team('araucaria', 'Araucária Racing', 'BRA', TeamBudget.INDEPENDENT),
    team('ipe', 'Ipê Competições', 'BRA', TeamBudget.PRIVATEER),
    team('tiete', 'Tietê Racing', 'BRA', TeamBudget.PRIVATEER),
    team('pantanal', 'Pantanal Motorsport', 'BRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'stock-car',
      name: 'Stock Car',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('cer-1', 'cerrado', 'Rodrigo Albuquerque', 'BRA'),
        seat('cer-2', 'cerrado', 'Thiago Valadares', 'BRA'),
        seat('pau-1', 'paulista', 'Marcelo Cavalcanti', 'BRA'),
        seat('pau-2', 'paulista', 'Felipe Quintela', 'BRA'),
        seat('gua-1', 'guanabara', 'Bruno Siqueira', 'BRA'),
        seat('gua-2', 'guanabara', 'Gustavo Lacerda', 'BRA'),
        seat('pam-1', 'pampa', 'Matías Echeverría', 'ARG'),
        seat('pam-2', 'pampa', 'Eduardo Brum', 'BRA'),
        seat('ser-1', 'serra-gaucha', 'Leonardo Tonietto', 'BRA'),
        seat('ser-2', 'serra-gaucha', 'Vinícius Bertoldi', 'BRA'),
        seat('ara-1', 'araucaria', 'Diego Kowalski', 'BRA'),
        seat('ara-2', 'araucaria', 'Rafael Guimarães', 'BRA'),
        seat('ipe-1', 'ipe', 'Caio Nogueira', 'BRA'),
        seat('ipe-2', 'ipe', 'Santiago Olivera', 'URY'),
        seat('tie-1', 'tiete', 'André Pimentel', 'BRA'),
        seat('tie-2', 'tiete', 'Duarte Magalhães', 'PRT'),
        seat('pan-1', 'pantanal', 'Henrique Bastos', 'BRA'),
        seat('pan-2', 'pantanal', 'Lucas Figueiró', 'BRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.STOCK_CAR_2023_FSR },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 50, day: 0 },
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 10, day: 1 },
        {
          id: 'q2',
          type: 'qualify',
          name: 'Q2',
          minutes: 10,
          day: 1,
          inherit: { from: 'q1', top: 15 },
        },
        {
          id: 'q3',
          type: 'qualify',
          name: 'Q3',
          minutes: 10,
          day: 1,
          inherit: { from: 'q2', top: 6 },
        },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 80,
          day: 2,
          inherit: { from: 'q3' },
          pointsSystem: 'race-1',
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 80,
          day: 2,
          inherit: { from: 'race-1', reverse: 10 },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'goiania',
      name: 'Goiania',
      track: recommendedTrack('goiania/mixed'),
      climate: Climate.ARID,
    },
    { id: 'interlagos', name: 'Interlagos', track: recommendedTrack('interlagos/gp') },
    { id: 'taruma', name: 'Taruma', track: recommendedTrack('taruma/full') },
    { id: 'cascavel', name: 'Cascavel', track: recommendedTrack('cascavel/full') },
    { id: 'interlagos-2', name: 'Interlagos', track: recommendedTrack('interlagos/gp') },
    { id: 'velocitta', name: 'Velo Citta', track: recommendedTrack('velocitta/full') },
    {
      id: 'goiania-external',
      name: 'Goiania external circuit',
      track: recommendedTrack('goiania/external'),
      // The layout's ui_track.json gives the mixed circuit's 3820 m, which
      // would make 80 km 21 laps of a 2590 m lap.
      sessionLengths: [{ session: 'race-1', laps: 31 }, { session: 'race-2', laps: 31 }],
      climate: Climate.ARID,
    },
    { id: 'velopark', name: 'Velopark', track: recommendedTrack('velopark/full') },
    { id: 'velocitta-2', name: 'Velo Citta', track: recommendedTrack('velocitta/full') },
    { id: 'cascavel-2', name: 'Cascavel', track: recommendedTrack('cascavel/full') },
    { id: 'super-final', name: 'Super Final', track: recommendedTrack('interlagos/gp') },
  ],
  pointsSystems: [
    {
      id: 'race-1',
      name: 'Race 1 points',
      positions: [30, 26, 22, 19, 17, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      qualifying: [2],
    },
    {
      id: 'race-2',
      name: 'Race 2 points',
      positions: [24, 20, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    },
  ],
  defaultPointsSystem: 'race-2',
  grid: { aggression: 30 },
  generatedWeather: { climate: Climate.TEMPERATE, hemisphere: Hemisphere.SOUTH },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 12000,
  prizes: {
    positions: [45000, 31500, 22500, 17100, 13050, 9900, 7200, 5400, 3600, 2250],
    standings: [360000, 225000, 144000, 94500, 58500],
  },
};
