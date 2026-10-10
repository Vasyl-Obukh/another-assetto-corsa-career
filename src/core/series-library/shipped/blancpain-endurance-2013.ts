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
    team('meuse', 'Meuse Racing Club', 'BEL', TeamBudget.WORKS),
    team('vds', 'Vauclair Racing Team', 'BEL', TeamBudget.WORKS),
    team('hartwig', 'Hartwig Performance', 'DEU', TeamBudget.INDEPENDENT),
    team('falkenstein', 'Falkenstein Racing', 'DEU', TeamBudget.INDEPENDENT),
    team('solent', 'Solent Motorsport', 'GBR', TeamBudget.INDEPENDENT),
    team('rhone', 'Rhône Compétition', 'FRA', TeamBudget.INDEPENDENT),
    team('tricolore', 'Squadra Tricolore', 'ITA', TeamBudget.PRIVATEER),
    team('noord', 'Noordkaap Motorsport', 'NLD', TeamBudget.PRIVATEER),
    team('kvarken', 'Kvarken Racing', 'FIN', TeamBudget.PRIVATEER),
    team('lusitania', 'Lusitânia Sport', 'PRT', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt3',
      name: 'GT3',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('meu-1', 'meuse', 'Laurent Vandamme', 'BEL'),
        seat('meu-2', 'meuse', 'Rahel Fenner', 'CHE'),
        seat('vds-1', 'vds', 'Maxime Delhaye', 'BEL'),
        seat('vds-2', 'vds', 'Bas Lindeman', 'NLD'),
        seat('har-1', 'hartwig', 'Maximilian Brückner', 'DEU'),
        seat('har-2', 'hartwig', 'Harald Pirkner', 'AUT'),
        seat('fal-1', 'falkenstein', 'Hubert Brenner', 'DEU'),
        seat('fal-2', 'falkenstein', 'Abdul Rahman Qasim', 'SAU'),
        seat('sol-1', 'solent', 'Rob Bellamy', 'GBR'),
        seat('sol-2', 'solent', 'Álvaro Pestana', 'PRT'),
        seat('rho-1', 'rhone', 'Henri Badoux', 'FRA'),
        seat('rho-2', 'rhone', 'Ludovic Hassier', 'FRA'),
        seat('tri-1', 'tricolore', 'Stefano Comani', 'ITA'),
        seat('tri-2', 'tricolore', 'Davide Rigamonti', 'ITA'),
        seat('noo-1', 'noord', 'Niek Hoornstra', 'NLD'),
        seat('noo-2', 'noord', 'Louis Mertens', 'BEL'),
        seat('kva-1', 'kvarken', 'Markus Parkkinen', 'FIN'),
        seat('kva-2', 'kvarken', 'Tuomas Haapalainen', 'FIN'),
        seat('lus-1', 'lusitania', 'Pedro Lamego', 'PRT'),
        seat('lus-2', 'lusitania', 'Filipe Almada', 'PRT'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['bmw_z4_gt3', 'mclaren_mp412c_gt3', 'mercedes_sls_gt3', 'ks_audi_r8_lms'],
      },
      // The R8 Ultra is the unrestricted Audi, 40 bhp up on the rest.
      bop: [{ car: 'ks_audi_r8_lms', ballast: 15, restrictor: 8 }],
    },
  ],
  eventFormats: [
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
  defaultEventFormat: 'three-hours',
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
      eventFormat: 'twenty-four-hours',
      climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring 1000 km',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      eventFormat: 'thousand-km',
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], qualifying: [1],
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 1 },
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
