import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * RS 60 Spyder Cup - invented, for Porsche Pack 2's 718 RS 60 Spyder.
 *
 * The RS 60 won Sebring and the Targa Florio outright in 1960 and raced among
 * the two-litre sports cars everywhere else, none of which Assetto Corsa
 * ships, so it has no grid to join. This is a one-make cup of the kind
 * historic racing runs for it today, on circuits of its era: Sebring, the
 * Nordschleife, Monza's road course and Silverstone as it was. Invented, and
 * the description says so.
 */
export const PORSCHE_RS60_SPYDER_CUP: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'porsche-rs60-spyder-cup',
  name: 'RS 60 Spyder Cup',
  description: {
    en: 'Invented: a one-make cup for the 718 RS 60 Spyder, which has no grid in Assetto Corsa to'
      + ' join, on circuits of its era.',
    uk: 'Вигаданий: монокубок для 718 RS 60 Spyder, якому в Assetto Corsa більше ніде виступати, на '
      + 'трасах його епохи.',
  },
  teams: [
    team('zuffenhausen-spyder', 'Spyder Klassik', 'DEU', TeamBudget.INDEPENDENT),
    team('scuderia-spyder', 'Scuderia Piccola', 'ITA', TeamBudget.PRIVATEER),
    team('hamble', 'Hamble Historic', 'GBR', TeamBudget.PRIVATEER),
    team('ohio-spyder', 'Buckeye Vintage Racing', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'rs60',
      name: 'RS 60',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('spy-1', 'zuffenhausen-spyder', 'Wolfram Eichhorn', 'DEU'),
        seat('spy-2', 'zuffenhausen-spyder', 'Gisela Brandl', 'DEU'),
        seat('spy-3', 'zuffenhausen-spyder', 'Konrad Siebert', 'DEU'),
        seat('pic-1', 'scuderia-spyder', 'Ennio Balestrieri', 'ITA'),
        seat('pic-2', 'scuderia-spyder', 'Rinaldo Cappa', 'ITA'),
        seat('ham-1', 'hamble', 'Giles Wetherall', 'GBR'),
        seat('ham-2', 'hamble', 'Henry Pocklington', 'GBR'),
        seat('ham-3', 'hamble', 'Mabel Throssell', 'GBR'),
        seat('buc-1', 'ohio-spyder', 'Walt Kemper', 'USA'),
        seat('buc-2', 'ohio-spyder', 'Harlan Doyle', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: ['ks_porsche_718_spyder_rs'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Standard',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 60, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'sebring',
      name: 'Sebring',
      track: recommendedTrack('sebring/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nordschleife',
      name: 'Nordschleife',
      track: recommendedTrack('nordschleife/full'),
      climate: Climate.TEMPERATE,
    },
    { id: 'monza', name: 'Monza Road Course', track: recommendedTrack('monza/1966-road') },
    {
      id: 'silverstone',
      name: 'Silverstone 1967',
      track: recommendedTrack('silverstone/1967'),
      climate: Climate.OCEANIC,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: -5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 2500,
  prizes: {
    positions: [10000, 7000, 5000, 3800, 2900, 2200, 1600, 1200, 800, 500],
    standings: [80000, 50000, 32000, 21000, 13000],
  },
};
