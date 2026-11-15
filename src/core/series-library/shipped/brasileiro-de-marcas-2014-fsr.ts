import { seat, team } from './utils.ts';
import {
  Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A Marcas meeting: practice and qualifying on the first day, two races on
 * the second - the first from qualifying, the second, shorter, from the
 * first's result with its front reversed.
 * @param id Stable identifier of the format
 * @param name Display name
 * @param pointsSystem Which points both races pay, the default when omitted
 * @returns The event format
 */
const meeting = (id: string, name: string, pointsSystem?: string): EventFormat => ({
  id,
  name,
  sessions: [
    { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
    { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
    {
      id: 'race-1',
      type: 'race',
      name: 'Race 1',
      distance: 60,
      day: 1,
      inherit: { from: 'qualifying' },
      ...(pointsSystem === undefined ? {} : { pointsSystem }),
    },
    {
      id: 'race-2',
      type: 'race',
      name: 'Race 2',
      distance: 40,
      day: 1,
      inherit: { from: 'race-1', reverse: 10 },
      ...(pointsSystem === undefined ? {} : { pointsSystem }),
    },
  ],
});

/**
 * Brasileiro de Marcas, 2014 - the Copa Petrobras de Marcas, Brazil's
 * manufacturers' touring car championship, on First Studio Race's cars.
 *
 * FSR's Toyota Corolla, Ford Focus, Honda Civic and Mitsubishi Lancer are the
 * four makes of the season it has a car for; the Chevrolet Cruze that J. Star
 * and C2 raced has none. FSR's Renault Fluence is left out, since Renault
 * joined only in 2015. All eight meetings in the real order: Taruma, Brasilia,
 * the Interlagos wildcard race, Goiania, Curitiba, Velopark, Curitiba again
 * and the Goiania finale. Brasilia runs its 5.5 km full circuit and Goiania
 * its 3.8 km mixed one; which layouts the season raced was not checked.
 *
 * Two races a meeting, the second from the first's result with its top ten
 * reversed - the second races carry no pole, but how many places were
 * reversed, and the race lengths, were not checked: 60 km and 40 km stand for
 * a longer and a shorter race of about thirty and twenty minutes. Interlagos
 * was a single race with a guest driver sharing each car, run here as one 80
 * km race, its length not checked either. Points are 23-20-18-16-14-12-10-8-
 * 7-6-5-4-3-2-1, doubled at the finale; the dropped scores cannot be stated.
 * Velopark's twenty-three boxes fit a field of about twenty. The field is
 * invented.
 *
 * Source: https://en.wikipedia.org/wiki/2014_Brasileiro_de_Marcas
 */
export const BRASILEIRO_DE_MARCAS_2014_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'brasileiro-de-marcas-2014-fsr',
  name: 'Brasileiro de Marcas 2014 (FSR)',
  description: {
    en: 'Brazil\'s manufacturers\' touring car championship of 2014 on First Studio Race\'s Toyota, Ford, '
      + 'Honda and Mitsubishi: two races a meeting, the second from a reversed grid, and a double-points '
      + 'finale at Goiania.',
    uk: 'Бразильський чемпіонат марок 2014 року на Toyota, Ford, Honda і Mitsubishi від First Studio Race: '
      + 'дві гонки за етап, друга зі зворотної стартової решітки, і фінал у Гоянії з подвійними очками.',
  },
  teams: [
    team('serra', 'Serra Gaúcha Racing', 'BRA', TeamBudget.WORKS),
    team('cerrado', 'Cerrado Motorsport', 'BRA', TeamBudget.WORKS),
    team('litoral', 'Litoral Norte Racing', 'BRA', TeamBudget.WORKS),
    team('pampa', 'Pampa Competições', 'BRA', TeamBudget.INDEPENDENT),
    team('araucaria', 'Araucária Racing', 'BRA', TeamBudget.INDEPENDENT),
    team('mantiqueira', 'Mantiqueira Motorsport', 'BRA', TeamBudget.INDEPENDENT),
    team('pantanal', 'Pantanal Racing', 'BRA', TeamBudget.INDEPENDENT),
    team('paranapanema', 'Paranapanema Competições', 'BRA', TeamBudget.PRIVATEER),
    team('chapada', 'Chapada Racing', 'BRA', TeamBudget.PRIVATEER),
    team('tiete', 'Tietê Motorsport', 'BRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'marcas',
      name: 'Marcas',
      ladder: { discipline: Discipline.TOURING, tier: 3 },
      seats: [
        seat('ser-1', 'serra', 'Rodrigo Canela', 'BRA'),
        seat('ser-2', 'serra', 'Mateus Gramado', 'BRA'),
        seat('cer-1', 'cerrado', 'Leonardo Anápolis', 'BRA'),
        seat('cer-2', 'cerrado', 'Gustavo Pirenópolis', 'BRA'),
        seat('lit-1', 'litoral', 'Fernando Ubatuba', 'BRA'),
        seat('lit-2', 'litoral', 'Caio Ilhabela', 'BRA'),
        seat('pam-1', 'pampa', 'Henrique Bagé', 'BRA'),
        seat('pam-2', 'pampa', 'Eduardo Alegrete', 'BRA'),
        seat('ara-1', 'araucaria', 'Marcelo Guarapuava', 'BRA'),
        seat('ara-2', 'araucaria', 'Vinícius Irati', 'BRA'),
        seat('man-1', 'mantiqueira', 'Paulo Itajubá', 'BRA'),
        seat('man-2', 'mantiqueira', 'Renato Cruzeiro', 'BRA'),
        seat('pan-1', 'pantanal', 'Diego Corumbá', 'BRA'),
        seat('pan-2', 'pantanal', 'Lucas Aquidauana', 'BRA'),
        seat('ppm-1', 'paranapanema', 'André Ourinhos', 'BRA'),
        seat('ppm-2', 'paranapanema', 'Fábio Assis', 'BRA'),
        seat('cha-1', 'chapada', 'Ricardo Lençóis', 'BRA'),
        seat('cha-2', 'chapada', 'Sérgio Mucugê', 'BRA'),
        seat('tie-1', 'tiete', 'Marcos Barra Bonita', 'BRA'),
        seat('tie-2', 'tiete', 'Júlio Salto', 'BRA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'copa_marcas_corolla_v4',
          'copa_marcas_ford_v4',
          'copa_marcas_honda_v4',
          'copa_marcas_lancer_v4',
        ],
      },
    },
  ],
  eventFormats: [
    meeting('race-meeting', 'Two races'),
    {
      id: 'wildcard',
      name: 'Wildcard race',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        {
          type: 'race', name: 'Race', distance: 80, day: 1, inherit: { from: 'qualifying' },
        },
      ],
    },
    meeting('finale', 'Two races, double points', 'double'),
  ],
  defaultEventFormat: 'race-meeting',
  rounds: [
    {
      id: 'taruma',
      name: 'Taruma',
      track: recommendedTrack('taruma/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'brasilia',
      name: 'Brasilia',
      track: recommendedTrack('brasilia/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'interlagos',
      name: 'Interlagos',
      track: recommendedTrack('interlagos/gp'),
      eventFormat: 'wildcard',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'goiania',
      name: 'Goiania',
      track: recommendedTrack('goiania/mixed'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'curitiba',
      name: 'Curitiba',
      track: recommendedTrack('curitiba/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'velopark',
      name: 'Velopark',
      track: recommendedTrack('velopark/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'curitiba-2',
      name: 'Curitiba II',
      track: recommendedTrack('curitiba/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'goiania-2',
      name: 'Goiania finale',
      track: recommendedTrack('goiania/mixed'),
      eventFormat: 'finale',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [23, 20, 18, 16, 14, 12, 10, 8, 7, 6, 5, 4, 3, 2, 1],
    },
    {
      id: 'double',
      name: 'Double points',
      positions: [46, 40, 36, 32, 28, 24, 20, 16, 14, 12, 10, 8, 6, 4, 2],
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
  entryFee: 4000,
  prizes: {
    positions: [15000, 10500, 7500, 5700, 4350, 3300, 2400, 1800, 1200, 750],
    standings: [120000, 75000, 48000, 31500, 19500],
  },
};
