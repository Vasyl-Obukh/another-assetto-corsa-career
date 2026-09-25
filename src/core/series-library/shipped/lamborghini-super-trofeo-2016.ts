import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Lamborghini Super Trofeo Europe, 2016 - the Huracan Super Trofeo's own
 * one-make championship.
 *
 * The 2016 season was the second on the Huracan LP620-2 Super Trofeo, which is
 * the car the base game ships: six double-header rounds of 50-minute races,
 * each race with its own qualifying. Monza, Silverstone, Spa and the
 * Nurburgring are base circuits, and the season closed at Valencia's World
 * Final; Paul Ricard is not in Assetto Corsa, so Mugello stands in.
 *
 * The Pro, Pro-Am, Am and Lamborghini Cup classes shared one grid and are one
 * class entry here: they were scored against the same car. The points are the
 * common 15-12-10-8-6-5-4-3-2-1 one-make scale; the Super Trofeo's own table
 * was not found.
 *
 * Sources: https://en.wikipedia.org/wiki/2016_Lamborghini_Super_Trofeo,
 * https://gtspirit.com/2016/04/25/lamborghini-blancpain-super-trofeo-monza-2016-highlights/
 */
export const LAMBORGHINI_SUPER_TROFEO_2016: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'lamborghini-super-trofeo-2016',
  name: 'Lamborghini Super Trofeo Europe 2016',
  description: 'The Huracan Super Trofeo\'s one-make championship: double headers of 50-minute '
    + 'races, each with its own qualifying. Mugello stands in for Paul Ricard.',
  teams: [
    team('baldoni', 'Scuderia Baldoni', 'Italy', 'ITA', TeamBudget.WORKS),
    team('imperatore', 'Imperatore Racing', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('lawson', 'Lawson Squadra', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('leitner', 'Leitner Motorsport', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('taurus', 'Taurus Racing', 'Spain', 'ESP', TeamBudget.PRIVATEER),
    team('duindorp', 'Duindorp Racing', 'Netherlands', 'NED', TeamBudget.PRIVATEER),
    team('vosges', 'Écurie des Vosges', 'France', 'FRA', TeamBudget.PRIVATEER),
    team('silesia', 'Silesia Motorsport', 'Poland', 'POL', TeamBudget.PRIVATEER),
    team('taunus', 'Taunus Sportwagen', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('alpine-lake', 'Alpsee Racing', 'Austria', 'AUT', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'super-trofeo',
      name: 'Super Trofeo',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('bon-1', 'baldoni', 'Edoardo Piscitelli', 'Italy', 'ITA'),
        seat('bon-2', 'baldoni', 'Kiko Galbusera', 'Italy', 'ITA'),
        seat('imp-1', 'imperatore', 'Giacomo Barri', 'Italy', 'ITA'),
        seat('imp-2', 'imperatore', 'Vito Scalabrini', 'Italy', 'ITA'),
        seat('law-1', 'lawson', 'Oliver Rushworth', 'Great Britain', 'GBR'),
        seat('law-2', 'lawson', 'Ciaran Doyle', 'Ireland', 'IRL'),
        seat('lei-1', 'leitner', 'Dennis Marschner', 'Germany', 'GER'),
        seat('lei-2', 'leitner', 'Kai Brandauer', 'Germany', 'GER'),
        seat('tau-1', 'taurus', 'Álvaro Quintana', 'Spain', 'ESP'),
        seat('tau-2', 'taurus', 'Lucía Ferrándiz', 'Spain', 'ESP'),
        seat('dui-1', 'duindorp', 'Stijn Vermeer', 'Netherlands', 'NED'),
        seat('dui-2', 'duindorp', 'Roel Hagedoorn', 'Netherlands', 'NED'),
        seat('vos-1', 'vosges', 'Adrien Keller', 'France', 'FRA'),
        seat('vos-2', 'vosges', 'Hugo Marchetti', 'France', 'FRA'),
        seat('sil-1', 'silesia', 'Jakub Wrona', 'Poland', 'POL'),
        seat('sil-2', 'silesia', 'Karol Mazur', 'Poland', 'POL'),
        seat('tns-1', 'taunus', 'Henrik Albers', 'Germany', 'GER'),
        seat('tns-2', 'taunus', 'Ulrike Dahm', 'Germany', 'GER'),
        seat('alp-1', 'alpine-lake', 'Florian Gaisberger', 'Austria', 'AUT'),
        seat('alp-2', 'alpine-lake', 'Raphael Moosbrugger', 'Austria', 'AUT'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_lamborghini_huracan_st'] },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Double header',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { id: 'qualifying-1', type: 'qualify', name: 'Qualifying 1', minutes: 15, day: 1 },
        { id: 'qualifying-2', type: 'qualify', name: 'Qualifying 2', minutes: 15, day: 1 },
        {
          type: 'race', name: 'Race 1', distance: 135, day: 1, inherit: { from: 'qualifying-1' },
        },
        {
          type: 'race', name: 'Race 2', distance: 135, day: 2, inherit: { from: 'qualifying-2' },
        },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'valencia',
      name: 'World Final, Valencia',
      track: { id: 'fn_valencia', layout: 'gp' },
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [15, 12, 10, 8, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -2, aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 3500,
  prizes: {
    positions: [10000, 7000, 5000, 3800, 2900, 2200, 1600, 1200, 800, 500],
    standings: [80000, 50000, 32000, 21000, 13000],
  },
};
