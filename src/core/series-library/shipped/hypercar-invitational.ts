import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Hypercar Invitational - invented, the top of the road ladder.
 *
 * The base game's hypercars and the track specials of their makers: the
 * Zonda R, both Huayras, the Sesto Elemento, the RUF RT12 R in both drivelines
 * and the LaFerrari. No real series races them - the nearest things, the
 * makers' own track programmes, are not competitions - so this one is made up
 * and says so. The Zonda R and the Sesto Elemento are track cars and carry the
 * most weight; the LaFerrari ships no weight figure, so it is held back by a
 * restrictor alone.
 */
export const HYPERCAR_INVITATIONAL: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'hypercar-invitational',
  name: 'Hypercar Invitational',
  description: {
    en: 'Invented, with no real series behind it: the base game\'s hypercars and track specials '
      + 'balanced against each other, by invitation only.',
    uk: 'Вигаданий чемпіонат без реальної серії за ним: гіперкари й трекові версії базової гри, '
      + 'збалансовані між собою, участь лише за запрошеннями.',
  },
  teams: [
    team('modena-hyper', 'Atelier Modena', 'ITA', TeamBudget.WORKS),
    team('sant-agata', 'Squadra Sant\'Agata', 'ITA', TeamBudget.WORKS),
    team('pfaffenhausen', 'Allgäu Sportwagen', 'DEU', TeamBudget.INDEPENDENT),
    team('geneva-hyper', 'Lac Léman Collection', 'CHE', TeamBudget.INDEPENDENT),
    team('dubai-hyper', 'Falcon Hypercar Club', 'ARE', TeamBudget.PRIVATEER),
    team('monterey-hyper', 'Monterey Collectors', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'hypercar',
      name: 'Hypercar',
      ladder: { discipline: Discipline.ROAD, tier: 1 },
      seats: [
        seat('ate-1', 'modena-hyper', 'Guglielmo Ferrandino', 'ITA'),
        seat('ate-2', 'modena-hyper', 'Beatrice Castelvetri', 'ITA'),
        seat('sag-1', 'sant-agata', 'Raffaele Tremonti', 'ITA'),
        seat('sag-2', 'sant-agata', 'Ettore Balzarini', 'ITA'),
        seat('all-1', 'pfaffenhausen', 'Wendelin Hartinger', 'DEU'),
        seat('all-2', 'pfaffenhausen', 'Veronika Stadlmayr', 'DEU'),
        seat('lem-1', 'geneva-hyper', 'Étienne Rochat', 'CHE'),
        seat('lem-2', 'geneva-hyper', 'Mathias Jaquier', 'CHE'),
        seat('fal-1', 'dubai-hyper', 'Hamdan Al Suwaidi', 'ARE'),
        seat('fal-2', 'dubai-hyper', 'Rashid Al Mansoori', 'ARE'),
        seat('mon-1', 'monterey-hyper', 'Preston Whitcombe', 'USA'),
        seat('mon-2', 'monterey-hyper', 'Caroline Ashbury', 'USA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'pagani_zonda_r',
          'ks_pagani_huayra_bc',
          'pagani_huayra',
          'ks_lamborghini_sesto_elemento',
          'ks_ruf_rt12r',
          'ks_ruf_rt12r_awd',
          'ferrari_laferrari',
        ],
      },
      // Brought towards the road Huayra and the RUFs, at about 1.9 to 2 kg per
      // horsepower.
      bop: [
        { car: 'pagani_zonda_r', ballast: 200, restrictor: 20 },
        { car: 'ks_pagani_huayra_bc', ballast: 100, restrictor: 10 },
        { car: 'ks_lamborghini_sesto_elemento', ballast: 150, restrictor: 5 },
        { car: 'ferrari_laferrari', restrictor: 20 },
      ],
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Invitational',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 85, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC,
    },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 15,
  },
  entryFee: 15000,
  prizes: {
    positions: [60000, 40000, 28000, 20000, 15000, 11000, 8000, 6000, 4000, 2500],
    standings: [400000, 250000, 160000, 100000, 60000],
  },
};
