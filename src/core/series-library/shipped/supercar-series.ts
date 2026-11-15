import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Supercar Series - invented, for the base game's road supercars.
 *
 * No real series races unmodified supercars against each other: a production
 * class caps them out on price, and their makers' own track days are not races.
 * So this one is made up and says so. The seven cars span 2.2 to 3.0 kg per
 * horsepower on the install's own figures, which is too wide to race as they
 * come, so the lightest three are ballasted and restricted to the SLS and the
 * R8 in the middle of the field.
 */
export const SUPERCAR_SERIES: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'supercar-series',
  name: 'Supercar Series',
  description: {
    en: 'Invented, with no real series behind it: the base game\'s road supercars balanced '
      + 'against each other, over 100 km races on the grand prix circuits.',
    uk: 'Вигаданий, без реальної серії за ним: дорожні суперкари з базової гри, вирівняні між собою, у '
      + 'гонках на 100 км на трасах Гран-прі.',
  },
  teams: [
    team('maranello-road', 'Rosso Strada', 'ITA', TeamBudget.WORKS),
    team('woking-road', 'Surrey Supercars', 'GBR', TeamBudget.WORKS),
    team('ingolstadt-road', 'Donau Performance', 'DEU', TeamBudget.INDEPENDENT),
    team('bologna-road', 'Toro Nero Racing', 'ITA', TeamBudget.INDEPENDENT),
    team('affalterbach-road', 'Neckartal Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('yokohama-road', 'Bayside Tuning', 'JPN', TeamBudget.PRIVATEER),
    team('monaco-road', 'Riviera Supercar Club', 'MCO', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'supercar',
      name: 'Supercar',
      ladder: { discipline: Discipline.ROAD, tier: 2 },
      seats: [
        seat('ros-1', 'maranello-road', 'Vittorio Sassoli', 'ITA'),
        seat('ros-2', 'maranello-road', 'Giada Monteverdi', 'ITA'),
        seat('sur-1', 'woking-road', 'Jonty Harcourt', 'GBR'),
        seat('sur-2', 'woking-road', 'Felix Ashdown', 'GBR'),
        seat('don-1', 'ingolstadt-road', 'Benedikt Kranzl', 'DEU'),
        seat('don-2', 'ingolstadt-road', 'Svenja Ortlieb', 'DEU'),
        seat('tor-1', 'bologna-road', 'Leonardo Bertazzoni', 'ITA'),
        seat('tor-2', 'bologna-road', 'Achille Fontanesi', 'ITA'),
        seat('nec-1', 'affalterbach-road', 'Konstantin Uhland', 'DEU'),
        seat('nec-2', 'affalterbach-road', 'Ralf Dürrschmidt', 'DEU'),
        seat('bay-1', 'yokohama-road', 'Kenta Mizoguchi', 'JPN'),
        seat('bay-2', 'yokohama-road', 'Takumi Ebisawa', 'JPN'),
        seat('riv-1', 'monaco-road', 'Louis Grimaldo', 'MCO'),
        seat('riv-2', 'monaco-road', 'Anouk Bellamare', 'FRA'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_lamborghini_huracan_performante',
          'ks_lamborghini_gallardo_sl',
          'mclaren_mp412c',
          'ferrari_458',
          'mercedes_sls',
          'ks_audi_r8_plus',
          'ks_nissan_gtr',
        ],
      },
      // Everything brought to about 2.8 kg per horsepower, where the SLS sits.
      bop: [
        { car: 'ks_lamborghini_huracan_performante', ballast: 150, restrictor: 15 },
        { car: 'ks_lamborghini_gallardo_sl', ballast: 100, restrictor: 8 },
        { car: 'mclaren_mp412c', ballast: 80, restrictor: 10 },
      ],
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 100, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC,
    },
    { id: 'mugello', name: 'Mugello', track: recommendedTrack('mugello/gp') },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: recommendedTrack('nurburgring/gp-gt'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    { id: 'imola', name: 'Imola', track: recommendedTrack('imola/gp') },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 15,
  },
  entryFee: 7000,
  prizes: {
    positions: [25000, 17000, 12000, 9000, 7000, 5200, 4000, 3000, 2000, 1200],
    standings: [160000, 100000, 65000, 42000, 26000],
  },
};
