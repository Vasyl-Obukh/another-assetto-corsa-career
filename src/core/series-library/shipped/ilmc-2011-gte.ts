import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Intercontinental Le Mans Cup, 2011 - the GTE Pro class the base game's three
 * GT2 cars raced in.
 *
 * The BMW M3 GT2, the Ferrari 458 Italia GT2 and the Lotus Evora GTE are, by
 * themselves, the 2011 GTE Pro field: BMW Motorsport's two M3s, AF Corse's and
 * Luxury Racing's 458s and Lotus Jetalliance's two Evoras. The entry is real
 * and so are the drivers. Assetto Corsa races one driver to a car, so each
 * crew's two regulars drive a car of their own - which is why the works teams
 * field four and two.
 *
 * The season at its real lengths: the Sebring 12 Hours, the Spa 1000 km, the
 * Le Mans 24 Hours at double points, six hours at Imola and at Silverstone, and
 * Petit Le Mans at Road Atlanta over its ten hours. Zhuhai is not in Assetto
 * Corsa, so a Monza 1000 km - the distance Le Mans Series rounds ran there -
 * stands in. The M3 and the 458 are ballasted and restricted towards the
 * heavier Evora, the way the ACO balanced the class. Points are the 25-18-15
 * scale with a point for pole.
 *
 * Source: https://en.wikipedia.org/wiki/2011_Intercontinental_Le_Mans_Cup
 */
export const ILMC_2011_GTE: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'ilmc-2011-gte',
  name: 'Intercontinental Le Mans Cup 2011 GTE',
  description: {
    en: 'The 2011 GTE Pro field, which is exactly the base game\'s three GT2 cars, over the '
      + 'season at its real lengths - Sebring, Spa, Le Mans, Imola, Silverstone and Petit Le Mans - '
      + 'with a Monza 1000 km standing in for Zhuhai. Each crew\'s regulars drive a car each.',
    uk: 'Пелотон GTE Pro 2011 року - рівно три машини GT2 з базової гри - на сезоні справжніх дистанцій: '
      + 'Себрінг, Спа, Ле-Ман, Імола, Сільверстоун і Petit Le Mans, а 1000 км Монци замінюють Чжухай. '
      + 'Кожен постійний пілот екіпажу отримує власну машину.',
  },
  teams: [
    team('bmw', 'BMW Motorsport', 'DEU', TeamBudget.WORKS),
    team('af-corse', 'AF Corse', 'ITA', TeamBudget.WORKS),
    team('luxury', 'Luxury Racing', 'FRA', TeamBudget.INDEPENDENT),
    team('jetalliance', 'Lotus Jetalliance', 'AUT', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'gte-pro',
      name: 'GTE Pro',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('bmw-55a', 'bmw', 'Augusto Farfus', 'BRA'),
        seat('bmw-56a', 'bmw', 'Andy Priaulx', 'GBR'),
        seat('bmw-55b', 'bmw', 'Dirk Werner', 'DEU'),
        seat('bmw-56b', 'bmw', 'Dirk Müller', 'DEU'),
        seat('afc-51a', 'af-corse', 'Gianmaria Bruni', 'ITA'),
        seat('afc-51b', 'af-corse', 'Giancarlo Fisichella', 'ITA'),
        seat('lux-58a', 'luxury', 'Anthony Beltoise', 'FRA'),
        seat('lux-58b', 'luxury', 'François Jakubowski', 'FRA'),
        seat('jet-65a', 'jetalliance', 'Johnny Mowlem', 'GBR'),
        seat('jet-65b', 'jetalliance', 'James Rossiter', 'GBR'),
        seat('jet-64a', 'jetalliance', 'Oskar Slingerland', 'NLD'),
        seat('jet-64b', 'jetalliance', 'Martin Rich', 'GBR'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['bmw_m3_gt2', 'ferrari_458_gt2', 'lotus_evora_gte', 'lotus_evora_gte_carbon'],
      },
      // The Evora is 420 bhp on 1395 kg against 470-485 on 1245 for the other
      // two; the carbon car sheds 110 kg the ACO never gave it back.
      bop: [
        { car: 'bmw_m3_gt2', ballast: 60, restrictor: 10 },
        { car: 'ferrari_458_gt2', ballast: 60, restrictor: 8 },
        { car: 'lotus_evora_gte_carbon', ballast: 110 },
      ],
    },
  ],
  eventFormats: [
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 198, day: 1 },
      ],
    },
    {
      id: 'sebring-12',
      name: 'Twelve hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '12 Hours', laps: 312, day: 2 },
      ],
    },
    {
      id: 'le-mans-24',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 240, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 314, day: 2, pointsSystem: 'le-mans' },
      ],
    },
    {
      id: 'petit-le-mans',
      name: 'Ten hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 1 },
        { id: 'race', type: 'race', name: 'Petit Le Mans', laps: 367, day: 2 },
      ],
    },
    {
      id: 'spa-1000',
      name: 'Spa 1000 km',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: '1000 km', laps: 143, day: 1 },
      ],
    },
    {
      id: 'monza-1000',
      name: 'Monza 1000 km',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: '1000 km', laps: 173, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'six-hours',
  rounds: [
    {
      id: 'sebring',
      name: '12 Hours of Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      eventFormat: 'sebring-12',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spa',
      name: '1000 km of Spa',
      track: { id: 'spa' },
      eventFormat: 'spa-1000',
      climate: Climate.OCEANIC,
    },
    {
      id: 'le-mans',
      name: '24 Hours of Le Mans',
      track: { id: 'sx_lemans_lfm', layout: 'chicane' },
      eventFormat: 'le-mans-24',
      climate: Climate.TEMPERATE,
    },
    { id: 'imola', name: '6 Hours of Imola', track: { id: 'imola' } },
    {
      id: 'silverstone',
      name: '6 Hours of Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 168 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'petit-le-mans',
      name: 'Petit Le Mans',
      track: { id: 'road_atlanta2018', layout: 'grandprix' },
      eventFormat: 'petit-le-mans',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'zhuhai', name: '1000 km of Monza', track: { id: 'monza' }, eventFormat: 'monza-1000',
    },
  ],
  pointsSystems: [
    {
      id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1],
    },
    {
      id: 'le-mans',
      name: 'Le Mans, double points',
      positions: [50, 36, 30, 24, 20, 16, 12, 8, 4, 2],
      qualifying: [1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 4 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, slipstream: 1 },
    penalties: true,
    jumpStartPenalty: 15,
  },
  entryFee: 9000,
  prizes: {
    positions: [40000, 28000, 20000, 15000, 11000, 8500, 6500, 5000, 3500, 2000],
    standings: [260000, 160000, 105000, 70000, 45000],
  },
};
