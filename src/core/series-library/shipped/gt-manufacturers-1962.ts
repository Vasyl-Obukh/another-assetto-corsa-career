import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * International Championship for GT Manufacturers, 1962 - the Ferrari 250
 * GTO's first season.
 *
 * The over-two-litre division, which the 250 GTO won for Ferrari and whose
 * grids it largely was: the Ferrari 70th pack's car, one-make. Five rounds at
 * their real lengths - the Sebring 12 Hours, the Spa 500 km, the Nurburgring
 * 1000 km on the Nordschleife, Le Mans without its later chicanes, and the
 * Coppa Inter-Europa's three hours at Monza. The Targa Florio, the Tourist
 * Trophy at Goodwood, Bridgehampton and the Paris 1000 km are not in Assetto
 * Corsa. Points are 9-6-4-3-2-1. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/1962_World_Sportscar_Championship
 */
export const GT_MANUFACTURERS_1962: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt-manufacturers-1962',
  name: 'GT Manufacturers Championship 1962',
  description: 'The 250 GTO\'s first season: five rounds of the 1962 GT championship at their real '
    + 'lengths, from Sebring to Le Mans.',
  teams: [
    team('maranello-gt', 'Scuderia Serenissima Veneta', 'Italy', 'ITA', TeamBudget.WORKS),
    team('ecurie-francorchamps', 'Écurie des Hautes Fagnes', 'Belgium', 'BEL', TeamBudget.INDEPENDENT),
    team('uk-gto', 'Chelsea Racing Stable', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('nart-gt', 'Hudson Valley Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('ecurie-lorraine', 'Écurie Lorraine', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('scuderia-sant-ambroeus', 'Scuderia Brianza', 'Italy', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt',
      name: 'GT over 2 litres',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('ser-1', 'maranello-gt', 'Giorgio Scapinelli', 'Italy', 'ITA'),
        seat('ser-2', 'maranello-gt', 'Ludovico Bertazzi', 'Italy', 'ITA'),
        seat('ser-3', 'maranello-gt', 'Nino Rasella', 'Italy', 'ITA'),
        seat('fag-1', 'ecurie-francorchamps', 'Olivier Delhasse', 'Belgium', 'BEL'),
        seat('fag-2', 'ecurie-francorchamps', 'Paul Frédéricq', 'Belgium', 'BEL'),
        seat('che-1', 'uk-gto', 'Rupert Blandford', 'Great Britain', 'GBR'),
        seat('che-2', 'uk-gto', 'Michael Ashbrook', 'Great Britain', 'GBR'),
        seat('che-3', 'uk-gto', 'Colin Fairlie', 'Great Britain', 'GBR'),
        seat('hud-1', 'nart-gt', 'Ed Kessler', 'United States', 'USA'),
        seat('hud-2', 'nart-gt', 'Bob Gattling', 'United States', 'USA'),
        seat('lor-1', 'ecurie-lorraine', 'Jacques Vauthier', 'France', 'FRA'),
        seat('lor-2', 'ecurie-lorraine', 'Pierre Marmande', 'France', 'FRA'),
        seat('bri-1', 'scuderia-sant-ambroeus', 'Carlo Mezzanotte', 'Italy', 'ITA'),
        seat('bri-2', 'scuderia-sant-ambroeus', 'Franco Villani', 'Italy', 'ITA'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_ferrari_250_gto'] },
    },
  ],
  weekendFormats: [
    {
      id: 'three-hours',
      name: 'Three hours',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '3 Hours', distance: 450, day: 1 },
      ],
    },
    {
      id: 'twelve-hours',
      name: 'Twelve hours',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
        { id: 'race', type: 'race', name: '12 Hours', laps: 287, day: 2 },
      ],
    },
    {
      id: 'twenty-four-hours',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 180, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 120, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 340, day: 2 },
      ],
    },
    {
      id: 'spa-500',
      name: '500 km (Spa)',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '500 km', laps: 71, day: 1 },
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
  defaultWeekendFormat: 'three-hours',
  rounds: [
    {
      id: 'sebring',
      name: '12 Hours of Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      weekendFormat: 'twelve-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spa',
      name: '500 km of Spa',
      track: { id: 'spa' },
      weekendFormat: 'spa-500',
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: '1000 km of the Nurburgring',
      track: { id: 'ks_nordschleife', layout: 'nordschleife' },
      weekendFormat: 'nurburgring-1000',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'le-mans',
      name: '24 Hours of Le Mans',
      track: { id: 'sx_lemans_lfm', layout: 'nochicane' },
      weekendFormat: 'twenty-four-hours',
      climate: Climate.TEMPERATE,
    },
    { id: 'monza', name: 'Coppa Inter-Europa', track: { id: 'ks_monza66', layout: 'road' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 1, aggression: -5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 7000,
  prizes: {
    positions: [28000, 19600, 14000, 10650, 8100, 6150, 4500, 3350, 2250, 1400],
    standings: [224000, 140000, 89500, 59000, 36500],
  },
};
