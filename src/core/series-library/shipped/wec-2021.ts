import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Qualifying and its Hyperpole, shared by every format.
 */
const QUALIFYING = [
  { id: 'qualifying', type: 'qualify', classes: 'apart', name: 'Qualifying', minutes: 12, day: 1 },
  {
    id: 'hyperpole',
    type: 'qualify',
    classes: 'apart',
    name: 'Hyperpole',
    minutes: 10,
    day: 1,
    inherit: { from: 'qualifying', top: 10 },
  },
] as const;

/**
 * FIA World Endurance Championship, 2021 - the first Hypercar season, on URD's
 * cars.
 *
 * Three classes of the real four, every one of them URD's. Hypercar is URD's
 * Moyoda Hybrid and SCG 007, the Toyota GR010 and the Glickenhaus that raced;
 * Alpine's grandfathered LMP1 has no car. LMP2 is the LMP2 (2021) spec, URD's
 * Loire 07 among the Oreca 07s; GTE the GTE (2020s) spec, URD's Porsche,
 * Ferrari, Aston Martin and Corvette, one class where the real season split
 * GTE Pro from GTE Am, since a split by driver means nothing to AI drivers.
 * All six rounds - six hours at Spa and Monza, eight at Portimao, Le Mans
 * at double points over 2021's 371 laps, and six and then eight hours in
 * Bahrain. The other races run the laps 2023's cars covered at each circuit,
 * scaled to the race's hours, not 2021's own.
 *
 * Every round runs one shape of qualifying, the top ten going through to
 * Hyperpole, where 2021 took the top six of each class. Points are
 * 25-18-15-12-10-8-6-4-2-1 in each class with a point for pole, Le Mans double
 * and the eight-hour races one and a half times, as understood rather than
 * checked. The field is invented, from the paddocks of the other WEC seasons.
 *
 * Source: https://en.wikipedia.org/wiki/2021_FIA_World_Endurance_Championship
 */
export const WEC_2021: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'wec-2021',
  name: 'World Endurance Championship 2021',
  description: {
    en: 'The first Hypercar season on URD\'s cars: the GR010 and the 007 against each other, URD\'s '
      + 'Oreca 07 in LMP2 and URD\'s GTEs, six rounds from Spa to Bahrain.',
    uk: 'Перший сезон Hypercar на машинах URD: GR010 проти 007, Oreca 07 від URD в LMP2 та GTE від '
      + 'URD, шість етапів від Спа до Бахрейну.',
  },
  teams: [
    team('higashi-fuji', 'Higashi-Fuji Racing', 'JPN', TeamBudget.WORKS),
    team('sleepy-hollow', 'Sleepy Hollow Hypercar', 'USA', TeamBudget.INDEPENDENT),
    team('rhone', 'Rhône Endurance', 'FRA', TeamBudget.INDEPENDENT),
    team('algarve', 'Algarve Prototypes', 'PRT', TeamBudget.INDEPENDENT),
    team('trent-valley', 'Trent Valley Prototypes', 'GBR', TeamBudget.INDEPENDENT),
    team('engadin', 'Engadin Racing', 'CHE', TeamBudget.PRIVATEER),
    team('warta', 'Warta Prototypes', 'POL', TeamBudget.PRIVATEER),
    team('gte-italia', 'Squadra Prancing Endurance', 'ITA', TeamBudget.WORKS),
    team('gte-uk', 'Gaydon Endurance', 'GBR', TeamBudget.WORKS),
    team('gte-de', 'Zuffenhausen Endurance', 'DEU', TeamBudget.WORKS),
    team('rennsport-eifel', 'Rennsport Eifel', 'DEU', TeamBudget.INDEPENDENT),
    team('lario', 'Scuderia Lario', 'ITA', TeamBudget.INDEPENDENT),
    team('lumiere', 'Garage Lumière', 'FRA', TeamBudget.INDEPENDENT),
    team('albion', 'Albion Endurance', 'GBR', TeamBudget.INDEPENDENT),
    team('dune', 'Dune Racing', 'ARE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'hypercar',
      name: 'Hypercar',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('hy-hig-1', 'higashi-fuji', 'Kenta Murayoshi', 'JPN'),
        seat('hy-hig-2', 'higashi-fuji', 'Adrian Wolstenholme', 'JPN'),
        seat('hy-sle-1', 'sleepy-hollow', 'Wyatt Vanderhoef', 'USA'),
        seat('hy-sle-2', 'sleepy-hollow', 'Romain Desforges', 'FRA'),
      ],
      eligibility: { kind: 'cars', cars: ['urd_gr010', 'urd_scg007_lmh'] },
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
        seat('p2-tre-1', 'trent-valley', 'Callum Ashworth', 'GBR'),
        seat('p2-tre-2', 'trent-valley', 'Rhys Penhallow', 'GBR'),
        seat('p2-eng-1', 'engadin', 'Gian Andri Tschanz', 'CHE'),
        seat('p2-eng-2', 'engadin', 'Linus Brändli', 'CHE'),
        seat('p2-war-1', 'warta', 'Kacper Wierzbicki', 'POL'),
        seat('p2-war-2', 'warta', 'Szymon Olejnik', 'POL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.LMP2_2021 },
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
        seat('gt-lum-1', 'lumiere', 'Hugo Delacourt', 'FRA'),
        seat('gt-lum-2', 'lumiere', 'Mathis Garrigue', 'FRA'),
        seat('gt-alb-1', 'albion', 'Oliver Kingswell', 'GBR'),
        seat('gt-alb-2', 'albion', 'James Parrington', 'GBR'),
        seat('gt-dun-1', 'dune', 'Sultan Al Kaabi', 'ARE'),
        seat('gt-dun-2', 'dune', 'Rashed Al Shamsi', 'ARE'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GTE_2020S },
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
        ...QUALIFYING,
        {
          id: 'race', type: 'race', name: '6 Hours', laps: 187, day: 2, inherit: { from: 'hyperpole' },
        },
      ],
    },
    {
      id: 'eight-hours',
      name: 'Eight hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        ...QUALIFYING,
        {
          id: 'race',
          type: 'race',
          name: '8 Hours',
          laps: 249,
          day: 2,
          inherit: { from: 'hyperpole' },
          pointsSystem: 'eight-hours',
        },
      ],
    },
    {
      id: 'le-mans',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 12, day: 1 },
        {
          id: 'hyperpole',
          type: 'qualify',
          name: 'Hyperpole',
          minutes: 10,
          day: 1,
          inherit: { from: 'qualifying', top: 10 },
        },
        {
          id: 'race',
          type: 'race',
          name: '24 Hours',
          laps: 371,
          day: 2,
          inherit: { from: 'hyperpole' },
          pointsSystem: 'le-mans',
        },
      ],
    },
  ],
  defaultEventFormat: 'six-hours',
  rounds: [
    {
      id: 'spa',
      name: '6 Hours of Spa',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'race', laps: 148 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'portimao',
      name: '8 Hours of Portimao',
      track: recommendedTrack('portimao/gp'),
      sessionLengths: [{ session: 'race', laps: 296 }],
      eventFormat: 'eight-hours',
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'monza',
      name: '6 Hours of Monza',
      track: recommendedTrack('monza/gp'),
      sessionLengths: [{ session: 'race', laps: 200 }],
    },
    {
      id: 'le-mans',
      name: '24 Hours of Le Mans',
      track: recommendedTrack('le-mans/24h'),
      eventFormat: 'le-mans',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain-6',
      name: '6 Hours of Bahrain',
      track: recommendedTrack('bahrain/gp'),
      climate: Climate.ARID,
    },
    {
      id: 'bahrain-8',
      name: '8 Hours of Bahrain',
      track: recommendedTrack('bahrain/gp'),
      eventFormat: 'eight-hours',
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
    {
      id: 'eight-hours',
      name: 'Eight hours, points and a half',
      positions: [37.5, 27, 22.5, 18, 15, 12, 9, 6, 3, 1.5],
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
