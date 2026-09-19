import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Blancpain Endurance Series, 2013 - GT3 endurance racing on the base game's
 * own GT3 cars.
 *
 * The base game's four 2013-era GT3 cars are exactly four of the makes that
 * raced it: the BMW Z4, the McLaren 12C, the Mercedes SLS and the Audi R8 LMS
 * Ultra. The later 650S, Huracan and AMG GT3 are left out - they arrived after
 * the season - and so is everything DLC, since a car list is a requirement.
 *
 * Real lengths: three-hour races at Monza, Silverstone and Paul Ricard, the Spa
 * 24 Hours, and the Nurburgring 1000 km, raced here as the laps a thousand
 * kilometres takes on the GT layout. Paul Ricard is not in Assetto Corsa, so
 * Mugello stands in. The Pro, Pro-Am and Gentlemen cups raced one car against
 * another and are one class entry. The points are the 25-18-15 scale with a
 * point for pole; the Spa 24 Hours also paid at six and twelve hours, which a
 * points system cannot say yet.
 *
 * Grids capped at 24, the boxes Silverstone, Spa and the Nurburgring have,
 * against real fields of fifty and more.
 *
 * Source: https://en.wikipedia.org/wiki/2013_Blancpain_Endurance_Series
 */
export const BLANCPAIN_ENDURANCE_2013: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'blancpain-endurance-2013',
  name: 'Blancpain Endurance Series 2013',
  description: 'GT3 endurance racing at its real length: three three-hour races, the Spa 24 Hours '
    + 'and the Nurburgring 1000 km, on the four GT3 cars of 2013 the base game ships. Mugello '
    + 'stands in for Paul Ricard.',
  teams: [
    team('meuse', 'Meuse Racing Club', 'Belgium', 'BEL', TeamBudget.WORKS),
    team('vds', 'Vauclair Racing Team', 'Belgium', 'BEL', TeamBudget.WORKS),
    team('hartwig', 'Hartwig Performance', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('falkenstein', 'Falkenstein Racing', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('solent', 'Solent Motorsport', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('rhone', 'Rhône Compétition', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('tricolore', 'Squadra Tricolore', 'Italy', 'ITA', TeamBudget.PRIVATEER),
    team('noord', 'Noordkaap Motorsport', 'Netherlands', 'NED', TeamBudget.PRIVATEER),
    team('kvarken', 'Kvarken Racing', 'Finland', 'FIN', TeamBudget.PRIVATEER),
    team('lusitania', 'Lusitânia Sport', 'Portugal', 'POR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt3',
      name: 'GT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('meu-1', 'meuse', 'Laurent Vandamme', 'Belgium', 'BEL'),
        seat('meu-2', 'meuse', 'Rahel Fenner', 'Switzerland', 'SUI'),
        seat('vds-1', 'vds', 'Maxime Delhaye', 'Belgium', 'BEL'),
        seat('vds-2', 'vds', 'Bas Lindeman', 'Netherlands', 'NED'),
        seat('har-1', 'hartwig', 'Maximilian Brückner', 'Germany', 'GER'),
        seat('har-2', 'hartwig', 'Harald Pirkner', 'Austria', 'AUT'),
        seat('fal-1', 'falkenstein', 'Hubert Brenner', 'Germany', 'GER'),
        seat('fal-2', 'falkenstein', 'Abdul Rahman Qasim', 'Saudi Arabia', 'KSA'),
        seat('sol-1', 'solent', 'Rob Bellamy', 'Great Britain', 'GBR'),
        seat('sol-2', 'solent', 'Álvaro Pestana', 'Portugal', 'POR'),
        seat('rho-1', 'rhone', 'Henri Badoux', 'France', 'FRA'),
        seat('rho-2', 'rhone', 'Ludovic Hassier', 'France', 'FRA'),
        seat('tri-1', 'tricolore', 'Stefano Comani', 'Italy', 'ITA'),
        seat('tri-2', 'tricolore', 'Davide Rigamonti', 'Italy', 'ITA'),
        seat('noo-1', 'noord', 'Niek Hoornstra', 'Netherlands', 'NED'),
        seat('noo-2', 'noord', 'Louis Mertens', 'Belgium', 'BEL'),
        seat('kva-1', 'kvarken', 'Markus Parkkinen', 'Finland', 'FIN'),
        seat('kva-2', 'kvarken', 'Tuomas Haapalainen', 'Finland', 'FIN'),
        seat('lus-1', 'lusitania', 'Pedro Lamego', 'Portugal', 'POR'),
        seat('lus-2', 'lusitania', 'Filipe Almada', 'Portugal', 'POR'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['bmw_z4_gt3', 'mclaren_mp412c_gt3', 'mercedes_sls_gt3', 'ks_audi_r8_lms'],
      },
      // The R8 Ultra is the unrestricted Audi, 40 bhp up on the rest.
      bop: [{ car: 'ks_audi_r8_lms', ballast: 15, restrictor: 8 }],
    },
  ],
  weekendFormats: [
    {
      id: 'three-hours',
      name: 'Three hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: 'Race', distance: 480, day: 1 },
      ],
    },
    {
      id: 'twenty-four-hours',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
        { id: 'race', type: 'race', name: '24 Hours', laps: 564, day: 2 },
      ],
    },
    {
      id: 'thousand-km',
      name: '1000 km',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
        { type: 'race', name: '1000 km', laps: 195, day: 1 },
      ],
    },
  ],
  defaultWeekendFormat: 'three-hours',
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
      id: 'spa',
      name: 'Spa 24 Hours',
      track: { id: 'spa' },
      weekendFormat: 'twenty-four-hours',
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring 1000 km',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      weekendFormat: 'thousand-km',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 93, aiLevelMin: 85, aiAggression: 30 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, slipstream: 1 },
    penalties: true,
    jumpStartPenalty: 15,
  },
  entryFee: 6500,
  prizes: {
    positions: [26000, 18000, 13000, 10000, 8000, 6000, 4500, 3500, 2500, 1500],
    standings: [170000, 105000, 70000, 45000, 28000],
  },
};
