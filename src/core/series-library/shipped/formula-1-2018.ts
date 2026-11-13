import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2018: three practices, the three-part
 * knockout, and the race.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 3', minutes: 60, day: 1 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 18, day: 1 },
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
      minutes: 12,
      day: 1,
      inherit: { from: 'q2', top: 10 },
    },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * Formula 1, 2018 - Lewis Hamilton's fifth title, over Sebastian Vettel's Ferrari.
 *
 * The real entry list on RSS's Formula Hybrid 2018, standard or S1, every seat
 * in it. Thirteen of twenty-one rounds at their real distances; Barcelona runs
 * the layout with its final chicane. Melbourne, Baku, Monaco, Paul Ricard,
 * Hockenheim, Marina Bay, Sochi and Suzuka are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty cars cut to fifteen and then
 * to ten. Points are 25-18-15-12-10-8-6-4-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2018_Formula_One_World_Championship
 */
export const FORMULA_1_2018: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2018',
  name: 'Formula 1 2018',
  description: {
    en: 'Lewis Hamilton\'s fifth title, with the real entry list on RSS\'s Formula Hybrid 2018 and '
      + 'thirteen of its grands prix at their real distances.',
    uk: 'П\'ятий титул Льюїса Гемілтона зі справжнім списком учасників на Formula Hybrid 2018 '
      + 'від RSS і тринадцятьма гран-прі на справжніх дистанціях.',
  },
  teams: [
    team('mercedes', 'Mercedes AMG Petronas Motorsport', 'DEU', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('red-bull', 'Aston Martin Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('renault', 'Renault Sport F1 Team', 'FRA', TeamBudget.WORKS),
    team('haas', 'Haas F1 Team', 'USA', TeamBudget.INDEPENDENT),
    team('mclaren', 'McLaren F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('force-india', 'Sahara Force India F1 Team', 'IND', TeamBudget.INDEPENDENT),
    team('sauber', 'Alfa Romeo Sauber F1 Team', 'CHE', TeamBudget.INDEPENDENT),
    team('toro-rosso', 'Red Bull Toro Rosso Honda', 'ITA', TeamBudget.INDEPENDENT),
    team('williams', 'Williams Martini Racing', 'GBR', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'GBR'),
        seat('ferrari-vettel', 'ferrari', 'Sebastian Vettel', 'DEU'),
        seat('ferrari-raikkonen', 'ferrari', 'Kimi Räikkönen', 'FIN'),
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'NLD'),
        seat('mercedes-bottas', 'mercedes', 'Valtteri Bottas', 'FIN'),
        seat('red-bull-ricciardo', 'red-bull', 'Daniel Ricciardo', 'AUS'),
        seat('renault-hulkenberg', 'renault', 'Nico Hülkenberg', 'DEU'),
        seat('force-india-perez', 'force-india', 'Sergio Pérez', 'MEX'),
        seat('haas-magnussen', 'haas', 'Kevin Magnussen', 'DNK'),
        seat('renault-sainz', 'renault', 'Carlos Sainz', 'ESP'),
        seat('mclaren-alonso', 'mclaren', 'Fernando Alonso', 'ESP'),
        seat('force-india-ocon', 'force-india', 'Esteban Ocon', 'FRA'),
        seat('sauber-leclerc', 'sauber', 'Charles Leclerc', 'MCO'),
        seat('haas-grosjean', 'haas', 'Romain Grosjean', 'FRA'),
        seat('toro-rosso-gasly', 'toro-rosso', 'Pierre Gasly', 'FRA'),
        seat('mclaren-vandoorne', 'mclaren', 'Stoffel Vandoorne', 'BEL'),
        seat('sauber-ericsson', 'sauber', 'Marcus Ericsson', 'SWE'),
        seat('williams-stroll', 'williams', 'Lance Stroll', 'CAN'),
        seat('toro-rosso-hartley', 'toro-rosso', 'Brendon Hartley', 'NZL'),
        seat('williams-sirotkin', 'williams', 'Sergey Sirotkin', 'RUS'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2018 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: { id: 'fn_bahrain', layout: 'gp' },
      climate: Climate.ARID,
    },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: { id: 'shanghai_v2', layout: 'gp' },
      climate: Climate.TEMPERATE,
    },
    { id: 'spain', name: 'Spanish Grand Prix', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: { id: 'canada_2021', layout: 'lfm' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: { id: 'ks_red_bull_ring', layout: 'layout_gp' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
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
      id: 'united-states',
      name: 'United States Grand Prix',
      track: { id: 'acu_unitedstates' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico',
      name: 'Mexican Grand Prix',
      track: { id: 'vrc_mexico', layout: 'fa_layout' },
      sessionLengths: [{ session: 'grand-prix', laps: 71 }],
      climate: Climate.TEMPERATE,
    },
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
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
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
