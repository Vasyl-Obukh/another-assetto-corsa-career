import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * World Sportscar Championship, 1969 - the GT40's last season, and the 917's
 * first.
 *
 * The 1960s sports prototype spec: the base game's Ford GT40, with the Ferrari
 * 330 P4 of the Ferrari 70th pack and Porsche Pack 3's 908 LH and 917 K
 * joining the grid for anyone who owns them. The GT40 won Le Mans that June;
 * Porsche's 908s took the title.
 *
 * Eight of ten rounds at their real lengths: the Daytona 24 Hours, the
 * Sebring 12 Hours, the BOAC 500's six hours at Brands Hatch, the Monza 1000 km
 * on the circuit with its banking, which the 1966 Monza still has, the Spa
 * 1000 km, the Nurburgring 1000 km on the Nordschleife, Le Mans without its
 * later chicanes, and the Watkins Glen Six Hours. The Targa Florio and the
 * Osterreichring are not in Assetto Corsa. Points are 9-6-4-3-2-1.
 *
 * The field is invented: a car of 1969 was crewed by two, and the cars are
 * assigned from whatever of the spec is installed, so the real crews would be
 * in the wrong cars.
 *
 * Source: https://en.wikipedia.org/wiki/1969_World_Sportscar_Championship
 */
export const WORLD_SPORTSCAR_1969: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'world-sportscar-1969',
  name: 'World Sportscar Championship 1969',
  description: {
    en: 'The GT40\'s last season and the 917\'s first: eight rounds at their real lengths, from '
      + 'Daytona to Le Mans and the banked Monza. The 330 P4, 908 and 917 join the grid if you own their '
      + 'packs.',
    uk: 'Останній сезон GT40 і перший для 917: вісім етапів у реальній тривалості, від Дайтони до '
      + 'Ле-Мана й Монци з віражами. 330 P4, 908 і 917 виходять на стартову решітку, якщо у вас є їхні '
      + 'паки.',
  },
  teams: [
    team('gulf-wyer', 'Slough Engineering', 'GBR', TeamBudget.WORKS),
    team('zuffenhausen', 'Salzburg Sportwagen', 'AUT', TeamBudget.WORKS),
    team('maranello', 'Scuderia Modenese', 'ITA', TeamBudget.WORKS),
    team('ecurie-bleue', 'Écurie Bleue', 'FRA', TeamBudget.INDEPENDENT),
    team('dearborn', 'Dearborn Racing', 'USA', TeamBudget.INDEPENDENT),
    team('scuderia-lario', 'Scuderia del Lario', 'ITA', TeamBudget.PRIVATEER),
    team('ostschweiz', 'Ecurie Ostschweiz', 'CHE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'sports',
      name: 'Sports and prototypes',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('gul-1', 'gulf-wyer', 'Anthony Latchford', 'GBR'),
        seat('gul-2', 'gulf-wyer', 'Malcolm Everingham', 'GBR'),
        seat('zuf-1', 'zuffenhausen', 'Werner Hollenstein', 'AUT'),
        seat('zuf-2', 'zuffenhausen', 'Kurt Messerschmied', 'DEU'),
        seat('zuf-3', 'zuffenhausen', 'Hubert Lehrbach', 'DEU'),
        seat('mar-1', 'maranello', 'Carlo Ruggerini', 'ITA'),
        seat('mar-2', 'maranello', 'Nino Vacchelli', 'ITA'),
        seat('ecu-1', 'ecurie-bleue', 'Jean-Claude Arnaudet', 'FRA'),
        seat('ecu-2', 'ecurie-bleue', 'Gérard Lafforgue', 'FRA'),
        seat('dea-1', 'dearborn', 'Walt Henning', 'USA'),
        seat('dea-2', 'dearborn', 'Bobby Tennant', 'USA'),
        seat('lar-1', 'scuderia-lario', 'Ernesto Colnaghi', 'ITA'),
        seat('lar-2', 'scuderia-lario', 'Piero Galimberti', 'ITA'),
        seat('ost-1', 'ostschweiz', 'Toni Blattmann', 'CHE'),
        seat('ost-2', 'ostschweiz', 'Herbert Rüegg', 'CHE'),
        seat('dea-3', 'dearborn', 'Chuck Maddox', 'USA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.SPORTS_PROTOTYPE_60S },
    },
  ],
  eventFormats: [
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 273, day: 1 },
      ],
    },
    {
      id: 'twelve-hours',
      name: 'Twelve hours',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
        { id: 'race', type: 'race', name: '12 Hours', laps: 333, day: 2 },
      ],
    },
    {
      id: 'twenty-four-hours',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 180, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 120, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 670, day: 2 },
      ],
    },
    {
      id: 'monza-1000',
      name: '1000 km (Monza)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '1000 km', laps: 100, day: 1 },
      ],
    },
    {
      id: 'spa-1000',
      name: '1000 km (Spa)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '1000 km', laps: 143, day: 1 },
      ],
    },
    {
      id: 'nurburgring-1000',
      name: '1000 km (Nurburgring)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '1000 km', laps: 44, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'six-hours',
  rounds: [
    {
      id: 'daytona',
      name: '24 Hours of Daytona',
      track: { id: 'rt_daytona', layout: 'sportscar' },
      eventFormat: 'twenty-four-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sebring',
      name: '12 Hours of Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      eventFormat: 'twelve-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'boac-500',
      name: 'BOAC 500',
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 248 }],
      eventFormat: 'six-hours',
      climate: Climate.OCEANIC,
    },
    {
      id: 'monza',
      name: '1000 km of Monza',
      track: { id: 'ks_monza66', layout: 'full' },
      eventFormat: 'monza-1000',
    },
    {
      id: 'spa',
      name: '1000 km of Spa',
      track: { id: 'spa' },
      eventFormat: 'spa-1000',
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: '1000 km of the Nurburgring',
      track: { id: 'ks_nordschleife', layout: 'nordschleife' },
      eventFormat: 'nurburgring-1000',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'le-mans',
      name: '24 Hours of Le Mans',
      track: { id: 'sx_lemans_lfm', layout: 'nochicane' },
      sessionLengths: [{ session: 'race', laps: 382 }],
      eventFormat: 'twenty-four-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'watkins-glen',
      name: 'Watkins Glen Six Hours',
      track: { id: 'lilski_watkins_glen', layout: 'short_classic' },
      eventFormat: 'six-hours',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 3, aggression: -5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 9000,
  prizes: {
    positions: [45000, 29000, 19000, 13500, 10000, 7000],
    standings: [300000, 180000, 120000, 80000, 50000],
  },
};
