import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * BOSS GP Open - the Lotus Exos 125's honest home.
 *
 * BOSS GP races privately owned big single-seaters in classes, and its Open
 * class names the Lotus T125 - the Exos - by name. This is that class on its
 * own, which is what the base game can field: the Exos and its Stage 1
 * upgrade, the latter restricted and ballasted to the standard car.
 *
 * The event is BOSS GP's shape - two practices, one qualifying, two short
 * races, the second lined up on the first's result. The calendar is the 2019
 * season's: Hockenheim, the Red Bull Ring, Monza, Assen and Imola as raced,
 * with Mugello standing in for Brno, which is not in Assetto Corsa. The points
 * are the common 25-18-15 scale: BOSS GP's own table was not found.
 *
 * Grids of twelve, which is BOSS GP's usual size.
 *
 * Sources: https://en.wikipedia.org/wiki/BOSS_GP,
 * https://en.wikipedia.org/wiki/2019_BOSS_GP_Series
 */
export const BOSS_GP_OPEN: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'boss-gp-open',
  name: 'BOSS GP Open',
  description: {
    en: 'The Open class of the series for privately owned big single-seaters, run by the Lotus '
      + 'Exos 125 and its Stage 1 upgrade balanced to it, on the 2019 calendar. Mugello stands in '
      + 'for Brno.',
    uk: 'Клас Open серії для великих формульних машин приватних власників: Lotus Exos 125 '
      + 'і його версія Stage 1, зрівняна з ним за характеристиками, за календарем 2019 року. '
      + 'Муджелло замінює Брно.',
  },
  teams: [
    team('ascari', 'Scuderia Ascari', 'NLD', TeamBudget.WORKS),
    team('bruhl', 'Brühl Grand Prix', 'DEU', TeamBudget.INDEPENDENT),
    team('frauenfeld', 'Frauenfeld Racing', 'CHE', TeamBudget.INDEPENDENT),
    team('mosel', 'Moselblick Motorsport', 'LUX', TeamBudget.PRIVATEER),
    team('pannonia', 'Pannonia Formula', 'AUT', TeamBudget.PRIVATEER),
    team('lagune', 'Lagune Racing', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'open',
      name: 'Open',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 2 },
      seats: [
        seat('asc-1', 'ascari', 'Jeroen Hoogeveen', 'NLD'),
        seat('asc-2', 'ascari', 'Ricardo Almeida', 'BRA'),
        seat('bru-1', 'bruhl', 'Florian Ehrenberg', 'DEU'),
        seat('bru-2', 'bruhl', 'Markus Tiedemann', 'DEU'),
        seat('fra-1', 'frauenfeld', 'Reto Imhof', 'CHE'),
        seat('fra-2', 'frauenfeld', 'Nadine Kälin', 'CHE'),
        seat('mos-1', 'mosel', 'Claude Wagner', 'LUX'),
        seat('mos-2', 'mosel', 'Pit Reuter', 'LUX'),
        seat('pan-1', 'pannonia', 'Stefan Hollerer', 'AUT'),
        seat('pan-2', 'pannonia', 'Gábor Takács', 'HUN'),
        seat('lag-1', 'lagune', 'Federico Zanin', 'ITA'),
        seat('lag-2', 'lagune', 'Walter Pizzolato', 'ITA'),
      ],
      eligibility: { kind: 'cars', cars: ['lotus_exos_125', 'lotus_exos_125_s1'] },
      // 750 bhp against 640 on the same 660 kg: the upgrade is held back to the
      // standard car rather than the other way round.
      bop: [{ car: 'lotus_exos_125_s1', ballast: 40, restrictor: 12 }],
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Free practice 1', minutes: 30, day: 0 },
        { type: 'practice', name: 'Free practice 2', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 70,
          day: 1,
          inherit: { from: 'qualifying' },
        },
        {
          type: 'race', name: 'Race 2', distance: 70, day: 2, inherit: { from: 'race-1' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'hockenheim',
      name: 'Hockenheim',
      track: recommendedTrack('hockenheim/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'red-bull-ring',
      name: 'Red Bull Ring',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
    {
      id: 'assen',
      name: 'Assen',
      track: recommendedTrack('assen/autosport'),
      climate: Climate.OCEANIC,
    },
    { id: 'brno', name: 'Mugello', track: recommendedTrack('mugello/gp') },
    { id: 'imola', name: 'Imola', track: recommendedTrack('imola/gp') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, slipstream: 1 },
    penalties: true,
    jumpStartPenalty: 15,
  },
  entryFee: 6000,
  prizes: {
    positions: [22000, 15000, 11000, 8500, 6500, 5000, 3800, 2800, 1800, 1000],
    standings: [150000, 95000, 62000, 40000, 25000],
  },
};
