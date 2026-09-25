import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Supercar Classic - invented, for the base game's road icons of the sixties to
 * the eighties.
 *
 * No real series races them, so this one is made up and says so. They race as
 * two classes by era rather than being balanced across twenty years: the
 * Eighties class is the Ferrari F40 and the RUF CTR Yellowbird, which the
 * install's own figures put within a hair of each other; the Classic class is
 * the Miura, the Countach, the 33 Stradale and the Sport quattro, the three
 * quickest ballasted and restricted towards the Audi, which still trails them.
 * Old cars, which is why it starts switched off with the historic seasons.
 */
export const SUPERCAR_CLASSIC: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'supercar-classic',
  name: 'Supercar Classic',
  description: 'Invented, with no real series behind it: road icons of the sixties to the eighties in '
    + 'two classes by era - the F40 and the Yellowbird, and the Miura, Countach, 33 Stradale and Sport '
    + 'quattro balanced against each other.',
  teams: [
    team('collezione', 'Collezione Privata', 'Italy', 'ITA', TeamBudget.WORKS),
    team('pfaffenhausen-classic', 'Allgäu Klassik', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('concours', 'Concours Racing', 'Great Britain', 'GBR', TeamBudget.INDEPENDENT),
    team('riviera-classic', 'Riviera Classic Club', 'Monaco', 'MON', TeamBudget.PRIVATEER),
    team('ingolstadt-classic', 'Donau Klassik', 'Germany', 'GER', TeamBudget.PRIVATEER),
    team('pebble', 'Pebble Coast Collection', 'United States', 'USA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'eighties',
      name: 'Eighties',
      ladder: { discipline: Discipline.ROAD, tier: 2 },
      seats: [
        seat('eig-col-1', 'collezione', 'Massimo Terrazzani', 'Italy', 'ITA'),
        seat('eig-col-2', 'collezione', 'Aurelio Brambati', 'Italy', 'ITA'),
        seat('eig-pfa-1', 'pfaffenhausen-classic', 'Ludwig Holzapfel', 'Germany', 'GER'),
        seat('eig-pfa-2', 'pfaffenhausen-classic', 'Gregor Tannheimer', 'Germany', 'GER'),
        seat('eig-con-1', 'concours', 'Hugo Fairweather', 'Great Britain', 'GBR'),
        seat('eig-riv-1', 'riviera-classic', 'Stéphane Garibaldo', 'Monaco', 'MON'),
        seat('eig-peb-1', 'pebble', 'Warren Kittredge', 'United States', 'USA'),
        seat('eig-peb-2', 'pebble', 'Dana Holbrook', 'United States', 'USA'),
      ],
      eligibility: { kind: 'cars', cars: ['ferrari_f40', 'ruf_yellowbird'] },
    },
    {
      id: 'classic',
      name: 'Classic',
      ladder: { discipline: Discipline.ROAD, tier: 3 },
      seats: [
        seat('cla-col-1', 'collezione', 'Vittorio Lenzi', 'Italy', 'ITA'),
        seat('cla-con-1', 'concours', 'Rupert Ashcombe', 'Great Britain', 'GBR'),
        seat('cla-con-2', 'concours', 'Penelope Waverley', 'Great Britain', 'GBR'),
        seat('cla-ing-1', 'ingolstadt-classic', 'Walter Bauernfeind', 'Germany', 'GER'),
        seat('cla-ing-2', 'ingolstadt-classic', 'Michaela Hinterberger', 'Germany', 'GER'),
        seat('cla-riv-1', 'riviera-classic', 'Albert Castellane', 'Monaco', 'MON'),
        seat('cla-peb-1', 'pebble', 'Clayton Ridgeway', 'United States', 'USA'),
        seat('cla-pfa-1', 'pfaffenhausen-classic', 'Otto Grünwald', 'Germany', 'GER'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['ks_lamborghini_miura_sv', 'ks_lamborghini_countach', 'ks_alfa_33_stradale', 'ks_audi_sport_quattro'],
      },
      // Towards the Sport quattro's 4.2 kg per horsepower, as far as ballast and
      // a restrictor sensibly go.
      bop: [
        { car: 'ks_lamborghini_miura_sv', ballast: 90, restrictor: 5 },
        { car: 'ks_lamborghini_countach', restrictor: 8 },
        { car: 'ks_alfa_33_stradale', ballast: 100, restrictor: 5 },
      ],
      grid: { strength: -3 },
      prizes: {
        positions: [13200, 9000, 6600, 4800, 3600, 2700, 2100, 1500, 1000, 600],
        standings: [90000, 54000, 36000, 23000, 14500],
      },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 95, day: 1 },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    {
      id: 'monza', name: 'Monza Road Course', track: { id: 'ks_monza66', layout: 'road' },
    },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC,
    },
    {
      id: 'silverstone',
      name: 'Silverstone 1967',
      track: { id: 'ks_silverstone1967' },
      climate: Climate.OCEANIC,
    },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 2 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 15,
  },
  entryFee: 6000,
  prizes: {
    positions: [22000, 15000, 11000, 8000, 6000, 4500, 3500, 2500, 1700, 1000],
    standings: [150000, 90000, 60000, 38000, 24000],
  },
};
