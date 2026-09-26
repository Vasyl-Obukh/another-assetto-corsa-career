import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Tour Auto - the revived Tour de France Automobile, in its competition
 * category.
 *
 * Peter Auto runs the Tour for models that raced the original between 1951 and
 * 1984, and its circuit stages are where the competitors race. Four of them
 * are on its eligible list and in the catalogue: the Ferrari 250 GTO, the Alfa
 * Romeo GTA, the Lamborghini Miura and the Porsche 911 Carrera RSR 3.0. The
 * Shelby Cobra 427 stands in for the Cobra 289 that is eligible, as an invited
 * car. GT and Touring race as classes, the GTs balanced on the install's
 * figures towards the GTO.
 *
 * Three circuit stages at circuits the Tour has visited: Le Mans' Bugatti
 * circuit, Magny-Cours and Charade. Nogaro, Albi, Pau-Arnos and Dijon are not
 * in Assetto Corsa. The stages' own results are not a championship, so the
 * 25-18-15 scale scores them. The field is invented.
 *
 * Source: https://www.peterauto.fr/en/events/tour-auto/eligible-models/
 */
export const TOUR_AUTO: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'tour-auto',
  name: 'Tour Auto',
  description: 'The revived Tour de France Automobile\'s circuit stages: the 250 GTO, Miura, Carrera RSR '
    + 'and Cobra in GT and the Alfa GTA in Touring.',
  teams: [
    team('tour-paris', 'Écurie Rive Gauche', 'FRA', TeamBudget.INDEPENDENT),
    team('tour-lyon', 'Écurie Lyonnaise', 'FRA', TeamBudget.PRIVATEER),
    team('tour-italia', 'Scuderia Transalpina', 'ITA', TeamBudget.PRIVATEER),
    team('tour-uk', 'Channel Crossing Racing', 'GBR', TeamBudget.PRIVATEER),
    team('tour-de', 'Rallye Klassik Team', 'DEU', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt',
      name: 'GT',
      ladder: { discipline: Discipline.ROAD, tier: 3 },
      seats: [
        seat('gt-par-1', 'tour-paris', 'Édouard Sainte-Colombe', 'FRA'),
        seat('gt-par-2', 'tour-paris', 'Philippe Aubrac', 'FRA'),
        seat('gt-lyo-1', 'tour-lyon', 'Gilles Chabanne', 'FRA'),
        seat('gt-ita-1', 'tour-italia', 'Vittorio Spallanzani', 'ITA'),
        seat('gt-ita-2', 'tour-italia', 'Aldo Ferrucci', 'ITA'),
        seat('gt-uk-1', 'tour-uk', 'Hugh Carrington', 'GBR'),
        seat('gt-uk-2', 'tour-uk', 'Archie Latymer', 'GBR'),
        seat('gt-de-1', 'tour-de', 'Konstantin Waldeck', 'DEU'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_ferrari_250_gto',
          'ks_lamborghini_miura_sv',
          'ks_porsche_911_carrera_rsr',
          'shelby_cobra_427sc',
        ],
      },
      // Towards the GTO; the Miura is slower as it comes.
      bop: [
        { car: 'shelby_cobra_427sc', ballast: 60, restrictor: 20 },
        { car: 'ks_porsche_911_carrera_rsr', ballast: 60 },
      ],
    },
    {
      id: 'touring',
      name: 'Touring',
      ladder: { discipline: Discipline.ROAD, tier: 4 },
      seats: [
        seat('tc-par-1', 'tour-paris', 'Anne-Sophie Delorme', 'FRA'),
        seat('tc-ita-1', 'tour-italia', 'Beppe Garavaglia', 'ITA'),
        seat('tc-ita-2', 'tour-italia', 'Carla Montefusco', 'ITA'),
        seat('tc-lyo-1', 'tour-lyon', 'Rémi Bouchardeau', 'FRA'),
        seat('tc-de-1', 'tour-de', 'Detlef Kronshage', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_alfa_romeo_gta'] },
      grid: { strength: -4 },
      prizes: {
        positions: [14400, 10100, 7200, 5450, 4150, 3200, 2300, 1750, 1150, 700],
        standings: [115000, 72000, 46000, 30500, 18500],
      },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Circuit stage',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 65, day: 1 },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'bugatti',
      name: 'Circuit Bugatti',
      track: { id: 'bugatti_GPE2023', layout: 'lfm_standing' },
      climate: Climate.TEMPERATE,
    },
    { id: 'magny-cours', name: 'Magny-Cours', track: { id: 'magnycours22' }, climate: Climate.TEMPERATE },
    {
      id: 'charade',
      name: 'Charade',
      track: { id: 'circuit_charade2023', layout: 'charade2023_4km' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -2 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 6000,
  prizes: {
    positions: [24000, 16800, 12000, 9100, 6950, 5300, 3850, 2900, 1900, 1200],
    standings: [192000, 120000, 77000, 50500, 31000],
  },
};
