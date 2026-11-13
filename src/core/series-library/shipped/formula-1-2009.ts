import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2009: three practices, the three-part
 * knockout, and the race.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 3', minutes: 60, day: 1 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 20, day: 1 },
    {
      id: 'q2',
      type: 'qualify',
      name: 'Q2',
      minutes: 15,
      day: 1,
      inherit: { from: 'q1', top: 15 },
    },
    {
      id: 'q3',
      type: 'qualify',
      name: 'Q3',
      minutes: 10,
      day: 1,
      inherit: { from: 'q2', top: 10 },
    },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * Formula 1, 2009 - Brawn GP's single season, and Jenson Button's title.
 *
 * The real entry list on VRC's Williams FW31, standard or S1, every seat in
 * it. Twelve of seventeen rounds at their real distances, the German Grand
 * Prix at the Nurburgring and the first Abu Dhabi Grand Prix on the layout it
 * used; Silverstone has changed since, so its laps cover the real race's
 * distance. Melbourne, Monaco, Valencia's street circuit, Marina Bay and
 * Suzuka are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty cars cut to fifteen and then
 * to ten. Points are 10-8-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2009_Formula_One_World_Championship
 */
export const FORMULA_1_2009: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2009',
  name: 'Formula 1 2009',
  description: {
    en: 'Brawn GP\'s single season and Jenson Button\'s title, with the real entry list in VRC\'s FW31'
      + ' and twelve of its grands prix at their real distances.',
    uk: 'Єдиний сезон Brawn GP і титул Дженсона Баттона зі справжнім списком учасників на FW31 '
      + 'від VRC та дванадцятьма гран-прі на справжніх дистанціях.',
  },
  teams: [
    team('brawn', 'Brawn GP', 'GBR', TeamBudget.WORKS),
    team('red-bull', 'Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('mclaren', 'Vodafone McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('toyota', 'Panasonic Toyota Racing', 'JPN', TeamBudget.WORKS),
    team('bmw-sauber', 'BMW Sauber F1 Team', 'DEU', TeamBudget.WORKS),
    team('williams', 'AT&T Williams', 'GBR', TeamBudget.INDEPENDENT),
    team('renault', 'ING Renault F1 Team', 'FRA', TeamBudget.WORKS),
    team('force-india', 'Force India F1 Team', 'IND', TeamBudget.INDEPENDENT),
    team('toro-rosso', 'Scuderia Toro Rosso', 'ITA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('brawn-button', 'brawn', 'Jenson Button', 'GBR'),
        seat('red-bull-vettel', 'red-bull', 'Sebastian Vettel', 'DEU'),
        seat('brawn-barrichello', 'brawn', 'Rubens Barrichello', 'BRA'),
        seat('red-bull-webber', 'red-bull', 'Mark Webber', 'AUS'),
        seat('mclaren-hamilton', 'mclaren', 'Lewis Hamilton', 'GBR'),
        seat('ferrari-raikkonen', 'ferrari', 'Kimi Räikkönen', 'FIN'),
        seat('williams-rosberg', 'williams', 'Nico Rosberg', 'DEU'),
        seat('toyota-trulli', 'toyota', 'Jarno Trulli', 'ITA'),
        seat('renault-alonso', 'renault', 'Fernando Alonso', 'ESP'),
        seat('toyota-glock', 'toyota', 'Timo Glock', 'DEU'),
        seat('ferrari-massa', 'ferrari', 'Felipe Massa', 'BRA'),
        seat('bmw-sauber-heidfeld', 'bmw-sauber', 'Nick Heidfeld', 'DEU'),
        seat('bmw-sauber-kubica', 'bmw-sauber', 'Robert Kubica', 'POL'),
        seat('mclaren-kovalainen', 'mclaren', 'Heikki Kovalainen', 'FIN'),
        seat('force-india-fisichella', 'force-india', 'Giancarlo Fisichella', 'ITA'),
        seat('toro-rosso-buemi', 'toro-rosso', 'Sébastien Buemi', 'CHE'),
        seat('force-india-sutil', 'force-india', 'Adrian Sutil', 'DEU'),
        seat('williams-nakajima', 'williams', 'Kazuki Nakajima', 'JPN'),
        seat('renault-piquet', 'renault', 'Nelson Piquet Jr.', 'BRA'),
        seat('toro-rosso-bourdais', 'toro-rosso', 'Sébastien Bourdais', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2009 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    { id: 'malaysia', name: 'Malaysian Grand Prix', track: { id: 'acu_sepang' }, climate: Climate.TEMPERATE },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: { id: 'shanghai_v2', layout: 'gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: { id: 'fn_bahrain', layout: 'gp' },
      climate: Climate.ARID,
    },
    { id: 'spain', name: 'Spanish Grand Prix', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'turkey',
      name: 'Turkish Grand Prix',
      track: { id: 'rj_istanbul_park', layout: 'layout_f1_2005' },
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      sessionLengths: [{ session: 'grand-prix', laps: 53 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'germany',
      name: 'German Grand Prix',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: { id: 'rt_hungaroring' },
      climate: Climate.TEMPERATE,
    },
    { id: 'belgium', name: 'Belgian Grand Prix', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'italy', name: 'Italian Grand Prix', track: { id: 'monza' } },
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi Grand Prix',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [10, 8, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5, aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
