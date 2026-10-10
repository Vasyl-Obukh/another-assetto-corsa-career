import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * Hot Hatch Trophy - invented, for the base game's front-wheel-drive hot
 * hatches and the Audi S1.
 *
 * No real series races these five cars together, but production-car racing
 * classes them together all the time: the NLS runs turbocharged two-litre
 * road cars as VT2, and the Bathurst 6 Hour its hot hatches as Class C. So the
 * grouping is real and the championship is not, and its description says so.
 * The Giuliettas and the S1 are restricted towards the Abarth 500 and the Mito,
 * which is what a class with a performance window does.
 *
 * A club format: one qualifying, then two sprint races, the second with the
 * first's top six turned round. Short circuits, because a hot hatch on the
 * full Spa is a procession.
 */
export const HOT_HATCH_TROPHY: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'hot-hatch-trophy',
  name: 'Hot Hatch Trophy',
  description: 'Invented, with no real series behind it: the base game\'s hot hatches balanced into one '
    + 'class, the way production-car endurance racing classes them. Club sprints on short circuits, '
    + 'the second race from the first\'s result with the top six reversed.',
  teams: [
    team('shed', 'Back Shed Racing', 'GBR', TeamBudget.PRIVATEER),
    team('biscione', 'Biscione Club', 'ITA', TeamBudget.INDEPENDENT),
    team('quattroring', 'Vierring Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('polder', 'Polder Pistons', 'NLD', TeamBudget.PRIVATEER),
    team('garrigue', 'Garrigue Sport', 'FRA', TeamBudget.PRIVATEER),
    team('fjord', 'Fjordkant Racing', 'NOR', TeamBudget.PRIVATEER),
    team('dunes', 'Dunes Club Racing', 'BEL', TeamBudget.PRIVATEER),
    team('pampas', 'Pampa Competición', 'ARG', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'hot-hatch',
      name: 'Hot Hatch',
      ladder: { discipline: Discipline.ROAD, tier: 5 },
      seats: [
        seat('bis-1', 'biscione', 'Ottavio Lanfranchi', 'ITA'),
        seat('bis-2', 'biscione', 'Serena Mazzoleni', 'ITA'),
        seat('vie-1', 'quattroring', 'Jannik Wohlfahrt', 'DEU'),
        seat('vie-2', 'quattroring', 'Carsten Pohlmann', 'DEU'),
        seat('she-1', 'shed', 'Liam Ogilvie', 'GBR'),
        seat('she-2', 'shed', 'Becky Tattersall', 'GBR'),
        seat('pol-1', 'polder', 'Gijs Wiersma', 'NLD'),
        seat('pol-2', 'polder', 'Maarten Bosschaart', 'NLD'),
        seat('gar-1', 'garrigue', 'Bastien Roumanille', 'FRA'),
        seat('gar-2', 'garrigue', 'Élodie Cabanis', 'FRA'),
        seat('fjo-1', 'fjord', 'Eirik Haugland', 'NOR'),
        seat('fjo-2', 'fjord', 'Sindre Tveitan', 'NOR'),
        seat('dun-1', 'dunes', 'Wannes Declercq', 'BEL'),
        seat('dun-2', 'dunes', 'Ines Vanhoutte', 'BEL'),
        seat('pam-1', 'pampas', 'Tomás Echeverría', 'ARG'),
        seat('pam-2', 'pampas', 'Facundo Irigoyen', 'ARG'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'abarth500',
          'ks_alfa_mito_qv',
          'alfa_romeo_giulietta_qv',
          'alfa_romeo_giulietta_qv_le',
          'ks_audi_a1s1',
        ],
      },
      // Everything brought to the Abarth's 6.4 kg per horsepower.
      bop: [
        { car: 'alfa_romeo_giulietta_qv', restrictor: 8 },
        { car: 'alfa_romeo_giulietta_qv_le', restrictor: 10 },
        { car: 'ks_audi_a1s1', ballast: 40, restrictor: 8 },
      ],
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Club',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 20, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 15, day: 0 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 35,
          day: 0,
          inherit: { from: 'qualifying' },
        },
        {
          type: 'race',
          name: 'Race 2',
          distance: 35,
          day: 1,
          inherit: { from: 'race-1', reverse: 6 },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'magione', name: 'Magione', track: { id: 'magione' } },
    {
      id: 'silverstone',
      name: 'Silverstone National',
      track: { id: 'ks_silverstone', layout: 'national' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'vallelunga',
      name: 'Vallelunga Classic',
      track: { id: 'ks_vallelunga', layout: 'classic_circuit' },
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring Sprint',
      track: { id: 'ks_nurburgring', layout: 'layout_sprint_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'zandvoort', name: 'Zandvoort', track: { id: 'ks_zandvoort' }, climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'race',
      name: 'Race points',
      positions: [20, 17, 15, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      fastestLap: 1,
    },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: -7, aggression: 15 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 50, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 600,
  prizes: {
    positions: [2000, 1400, 1000, 750, 550, 400, 300, 200, 150, 100],
    standings: [15000, 9000, 6000, 4000, 2500],
  },
};
