import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Formula X Invitational - invented, for RSS's Formula Hybrid X cars.
 *
 * The Formula Hybrid X, its EVO and the V12-R are RSS's own imaginings of what
 * a grand prix car could be without a rulebook, so nothing real races them;
 * this is made up and says so. The three cars run as one class on nearly the
 * same power to weight, at circuits Formula 1 races.
 */
export const FORMULA_X_INVITATIONAL: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-x-invitational',
  name: 'Formula X Invitational',
  description: {
    en: 'Invented: RSS\'s rule-free Formula Hybrid X, X EVO and V12-R in one class, at grand prix '
      + 'circuits.',
    uk: 'Вигаданий чемпіонат: Formula Hybrid X, X EVO і V12-R від RSS, машини без жодного регламенту, в '
      + 'одному класі на трасах гран-прі.',
  },
  teams: [
    team('vanguard', 'Vanguard X', 'GBR', TeamBudget.WORKS),
    team('zenith', 'Zenith Racing', 'ITA', TeamBudget.WORKS),
    team('equinox', 'Equinox Racing', 'FRA', TeamBudget.WORKS),
    team('titan', 'Titan Hybrid', 'DEU', TeamBudget.WORKS),
    team('aurora', 'Aurora X', 'NOR', TeamBudget.INDEPENDENT),
    team('solaris', 'Solaris Racing', 'ESP', TeamBudget.INDEPENDENT),
    team('corsair', 'Corsair Racing', 'USA', TeamBudget.INDEPENDENT),
    team('ronin', 'Ronin Racing', 'JPN', TeamBudget.INDEPENDENT),
    team('meteor', 'Meteor Grand Prix', 'AUS', TeamBudget.PRIVATEER),
    team('nimbus', 'Nimbus Racing', 'CHE', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-x',
      name: 'Formula X',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      seats: [
        seat('van-1', 'vanguard', 'Alistair Carbery', 'GBR'),
        seat('van-2', 'vanguard', 'Rhys Tolhurst', 'GBR'),
        seat('zen-1', 'zenith', 'Dario Monteleone', 'ITA'),
        seat('zen-2', 'zenith', 'Cesare Vitrioli', 'ITA'),
        seat('equ-1', 'equinox', 'Florian Lecourtois', 'FRA'),
        seat('equ-2', 'equinox', 'Aurélien Bastide', 'FRA'),
        seat('tit-1', 'titan', 'Konrad Asbeck', 'DEU'),
        seat('tit-2', 'titan', 'Levin Stöhr', 'DEU'),
        seat('aur-1', 'aurora', 'Magnus Rekdal', 'NOR'),
        seat('aur-2', 'aurora', 'Tobias Skjelbred', 'NOR'),
        seat('sol-1', 'solaris', 'Gonzalo Irazusta', 'ESP'),
        seat('sol-2', 'solaris', 'Rubén Castrillo', 'ESP'),
        seat('cor-1', 'corsair', 'Parker Ashdown', 'USA'),
        seat('cor-2', 'corsair', 'Reid Vandermolen', 'USA'),
        seat('ron-1', 'ronin', 'Kazuma Ishizaki', 'JPN'),
        seat('ron-2', 'ronin', 'Tatsuki Ogura', 'JPN'),
        seat('met-1', 'meteor', 'Jaxon Pennycuick', 'AUS'),
        seat('met-2', 'meteor', 'Lachlan Merriweather', 'AUS'),
        seat('nim-1', 'nimbus', 'Luca Hänggi', 'CHE'),
        seat('nim-2', 'nimbus', 'Noah Bürgisser', 'CHE'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'rss_formula_hybrid_x',
          'rss_formula_hybrid_x_evo',
          'rss_formula_hybrid_v12-r',
        ],
      },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Invitational',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        { type: 'race', name: 'Race', distance: 160, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'spielberg',
      name: 'Red Bull Ring',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    {
      id: 'yas-marina',
      name: 'Yas Marina',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 6, aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [90000, 63000, 45000, 34200, 26100, 19800, 14400, 10800, 7200, 4500],
    standings: [720000, 450000, 288000, 189000, 117000],
  },
};
