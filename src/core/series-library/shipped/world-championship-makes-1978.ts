import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * World Championship for Makes, 1978 - Group 5, the silhouette era.
 *
 * The championship was Porsche 935s against each other, and Porsche Pack 1's
 * 935/78 "Moby Dick" - the factory's own ultimate version, which won the
 * Silverstone Six Hours - stands for the whole 935 field here, one-make. Seven
 * rounds at their real lengths: the Daytona 24 Hours, six hours at Mugello,
 * Silverstone, Watkins Glen, Brands Hatch and Vallelunga, and the Nurburgring
 * 1000 km on the Nordschleife. Dijon and Misano are not in Assetto Corsa.
 *
 * The points are the 20-15-12 scale of the day; the season's own table was not
 * confirmed. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/1978_World_Championship_for_Makes
 */
export const WORLD_CHAMPIONSHIP_MAKES_1978: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'world-championship-makes-1978',
  name: 'World Championship for Makes 1978',
  description: {
    en: 'Group 5\'s silhouette era, one-make on the 935/78 that stands for the whole 935 field: '
      + 'seven rounds of 1978 at their real lengths.',
    uk: 'Епоха силуетів Групи 5 як монокубок на 935/78, що замінює весь пелотон 935: сім етапів 1978 '
      + 'року в реальній тривалості.',
  },
  teams: [
    team('kremer-78', 'Kölner Rennstall', 'DEU', TeamBudget.WORKS),
    team('loos-78', 'Gelo Sportwagen', 'DEU', TeamBudget.WORKS),
    team('jmsa', 'Ile-de-France Compétition', 'FRA', TeamBudget.INDEPENDENT),
    team('dick-barbour', 'Pacific Coast Racing', 'USA', TeamBudget.INDEPENDENT),
    team('jolly-club', 'Scuderia Monzese', 'ITA', TeamBudget.PRIVATEER),
    team('charles-ivey', 'Kent Racing', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'group-5',
      name: 'Group 5',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('kol-1', 'kremer-78', 'Manfred Rösler', 'DEU'),
        seat('kol-2', 'kremer-78', 'Dieter Kasper', 'DEU'),
        seat('gel-1', 'loos-78', 'Klaus Niedermeier', 'DEU'),
        seat('gel-2', 'loos-78', 'Heinz-Otto Brandt', 'DEU'),
        seat('idf-1', 'jmsa', 'Claude Bardonnet', 'FRA'),
        seat('idf-2', 'jmsa', 'Bernard Darmon', 'FRA'),
        seat('pac-1', 'dick-barbour', 'Rick Hollister', 'USA'),
        seat('pac-2', 'dick-barbour', 'Gary Brandvold', 'USA'),
        seat('mon-1', 'jolly-club', 'Lella Castagna', 'ITA'),
        seat('mon-2', 'jolly-club', 'Martino Ferlini', 'ITA'),
        seat('ken-1', 'charles-ivey', 'Tony Hallam', 'GBR'),
        seat('ken-2', 'charles-ivey', 'Phil Ashwood', 'GBR'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_porsche_935_78_moby_dick'] },
    },
  ],
  eventFormats: [
    {
      id: 'six-hours',
      name: 'Six hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { id: 'race', type: 'race', name: '6 Hours', laps: 188, day: 1 },
      ],
    },
    {
      id: 'twenty-four-hours',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 180, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 120, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 734, day: 2 },
      ],
    },
    {
      id: 'nurburgring-1000',
      name: '1000 km (Nurburgring)',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
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
      id: 'mugello',
      name: 'Mugello 6 Hours',
      track: { id: 'mugello' },
      sessionLengths: [{ session: 'race', laps: 176 }],
    },
    {
      id: 'silverstone',
      name: 'Silverstone 6 Hours',
      track: { id: 'ks_silverstone', layout: 'gp' },
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
      id: 'watkins-glen',
      name: 'Watkins Glen 6 Hours',
      track: { id: 'lilski_watkins_glen', layout: 'boot_classic' },
      sessionLengths: [{ session: 'race', laps: 146 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'brands-hatch',
      name: 'Brands Hatch 6 Hours',
      track: { id: 'ks_brands_hatch', layout: 'gp' },
      sessionLengths: [{ session: 'race', laps: 249 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'vallelunga',
      name: 'Vallelunga 6 Hours',
      track: { id: 'ks_vallelunga', layout: 'extended_circuit' },
      sessionLengths: [{ session: 'race', laps: 209 }],
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 2 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 9000,
  prizes: {
    positions: [35000, 24500, 17500, 13300, 10150, 7700, 5600, 4200, 2800, 1750],
    standings: [280000, 175000, 112000, 73500, 45500],
  },
};
