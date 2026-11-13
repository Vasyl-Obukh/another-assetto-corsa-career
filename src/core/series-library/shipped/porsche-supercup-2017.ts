import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Porsche Mobil 1 Supercup, 2017 - the one-make support series of Formula 1,
 * on the 991 GT3 Cup.
 *
 * The Porsche Cup 991 spec, which is Porsche Pack 3's 911 GT3 Cup 2017. Seven
 * of the eleven races: Barcelona, the Red Bull Ring, Silverstone, the
 * Hungaroring, Spa's double header and Monza; Monaco and Mexico City are not
 * in Assetto Corsa. Races run half an hour. The base circuits' twenty-four
 * boxes cap a grid that ran thirty and more.
 *
 * The points are the 20-18-16 table the Supercup is described as using; it was
 * not confirmed for 2017. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2017_Porsche_Supercup
 */
export const PORSCHE_SUPERCUP_2017: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'porsche-supercup-2017',
  name: 'Porsche Supercup 2017',
  description: {
    en: 'Formula 1\'s one-make support series in 2017, on the 911 GT3 Cup: seven of its races, '
      + 'Spa\'s double header included.',
    uk: 'Монокубок підтримки Формули-1 сезону 2017 на 911 GT3 Cup: сім його гонок, зокрема дві гонки в '
      + 'Спа.',
  },
  teams: [
    team('lechner-sc', 'Salzach Racing', 'AUT', TeamBudget.WORKS),
    team('fach-sc', 'Rhein-Main Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('mrs-sc', 'Oberpfalz Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('dinamic-sc', 'Scuderia Ducale', 'ITA', TeamBudget.INDEPENDENT),
    team('martinet-sc', 'Équipe Côte d\'Opale', 'FRA', TeamBudget.PRIVATEER),
    team('ebimotors-sc', 'Team Lagunare', 'ITA', TeamBudget.PRIVATEER),
    team('fach-nl', 'Brabant Porsche Racing', 'NLD', TeamBudget.PRIVATEER),
    team('walter-sc', 'Team Nordlicht', 'DNK', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'supercup',
      name: 'Supercup',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('sal-1', 'lechner-sc', 'Markus Pöttinger', 'AUT'),
        seat('sal-2', 'lechner-sc', 'Julian Wiesflecker', 'AUT'),
        seat('sal-3', 'lechner-sc', 'Leon Hochleitner', 'AUT'),
        seat('rhe-1', 'fach-sc', 'Tim Wolfsberger', 'DEU'),
        seat('rhe-2', 'fach-sc', 'Nils Hagedorn', 'DEU'),
        seat('rhe-3', 'fach-sc', 'Moritz Ebeling', 'DEU'),
        seat('obe-1', 'mrs-sc', 'Jonas Mitterer', 'DEU'),
        seat('obe-2', 'mrs-sc', 'Florian Scheibl', 'DEU'),
        seat('obe-3', 'mrs-sc', 'Lukas Rudhart', 'DEU'),
        seat('duc-1', 'dinamic-sc', 'Matteo Arcaini', 'ITA'),
        seat('duc-2', 'dinamic-sc', 'Riccardo Buttazzoni', 'ITA'),
        seat('duc-3', 'dinamic-sc', 'Simone Galante', 'ITA'),
        seat('opa-1', 'martinet-sc', 'Théo Lambrecq', 'FRA'),
        seat('opa-2', 'martinet-sc', 'Maxime Fourneret', 'FRA'),
        seat('opa-3', 'martinet-sc', 'Alexis Carbonnel', 'FRA'),
        seat('lag-1', 'ebimotors-sc', 'Diego Bassanelli', 'ITA'),
        seat('lag-2', 'ebimotors-sc', 'Enrico Vanzetti', 'ITA'),
        seat('lag-3', 'ebimotors-sc', 'Pietro Canepari', 'ITA'),
        seat('bra-1', 'fach-nl', 'Jesse Verhulst', 'NLD'),
        seat('bra-2', 'fach-nl', 'Rik van Oirschot', 'NLD'),
        seat('bra-3', 'fach-nl', 'Lars Wijnbergen', 'NLD'),
        seat('nor-1', 'walter-sc', 'Mikkel Skovgaard', 'DNK'),
        seat('nor-2', 'walter-sc', 'Frederik Lund', 'DNK'),
        seat('nor-3', 'walter-sc', 'Anders Kjærholm', 'DNK'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.PORSCHE_CUP_991 },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 45, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { type: 'race', name: 'Race', distance: 75, day: 2 },
      ],
    },
    {
      id: 'double',
      name: 'Double header',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 45, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { type: 'race', name: 'Race 1', distance: 75, day: 1, inherit: { from: 'qualifying' } },
        { type: 'race', name: 'Race 2', distance: 75, day: 2, inherit: { from: 'qualifying' } },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'spain', name: 'Barcelona', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'austria',
      name: 'Red Bull Ring',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    { id: 'hungary', name: 'Hungaroring', track: { id: 'rt_hungaroring' }, climate: Climate.TEMPERATE },
    {
      id: 'belgium',
      name: 'Spa-Francorchamps',
      track: { id: 'spa' },
      eventFormat: 'double',
      climate: Climate.OCEANIC,
    },
    { id: 'italy', name: 'Monza', track: { id: 'monza' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [20, 18, 16, 14, 12, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 4000,
  prizes: {
    positions: [13000, 9100, 6500, 4950, 3750, 2850, 2100, 1550, 1050, 650],
    standings: [104000, 65000, 41500, 27500, 17000],
  },
};
