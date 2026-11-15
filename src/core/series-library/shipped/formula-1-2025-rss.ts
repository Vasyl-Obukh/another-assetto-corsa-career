import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2025: three practices, the three-part
 * knockout, and the race.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 60, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 60, day: 0 },
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
 * A sprint event: Friday's sprint qualifying lines up Saturday's
 * sprint, and Saturday's knockout the grand prix.
 */
const SPRINT: EventFormat = {
  id: 'sprint',
  name: 'Sprint',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 60, day: 0 },
    { id: 'sq1', type: 'qualify', name: 'SQ1', minutes: 12, day: 0 },
    {
      id: 'sq2',
      type: 'qualify',
      name: 'SQ2',
      minutes: 10,
      day: 0,
      inherit: { from: 'sq1', top: 15 },
    },
    {
      id: 'sq3',
      type: 'qualify',
      name: 'SQ3',
      minutes: 8,
      day: 0,
      inherit: { from: 'sq2', top: 10 },
    },
    {
      id: 'sprint',
      type: 'race',
      name: 'Sprint',
      distance: 100,
      day: 1,
      inherit: { from: 'sq3' },
      pointsSystem: 'sprint',
    },
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
 * Formula 1, 2025 - Lando Norris' first title, by two points.
 *
 * The real entry list on RSS's Formula Hybrid Alpine 2025 - one team's car,
 * which the whole field drives, every seat in it. The 2025 season is a
 * championship per spec, so VRC's car of the same year races its own. All 24
 * rounds at their real distances, the six sprint rounds included - sprint
 * qualifying on Friday, the sprint and the grand prix knockout on Saturday.
 * Yas Marina runs the layout before its 2021 rebuild, so its laps cover the
 * real distance.
 *
 * Qualifying is the three-part knockout, twenty cars cut to fifteen and then
 * to ten. Points are 25-18-15-12-10-8-6-4-2-1, and a sprint pays
 * 8-7-6-5-4-3-2-1.
 *
 * The seats are the teams as they finished the season, after Alpine's change
 * of second driver.
 *
 * Source: https://en.wikipedia.org/wiki/2025_Formula_One_World_Championship
 */
export const FORMULA_1_2025_RSS: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2025-rss',
  name: 'Formula 1 2025 (RSS)',
  description: {
    en: 'Lando Norris\' first title, with the real entry list on RSS\'s Formula Hybrid Alpine 2025 '
      + 'and all twenty-four of its grands prix at their real distances.',
    uk: 'Перший титул Ландо Норріса: реальний список учасників на Formula Hybrid Alpine 2025 від RSS і '
      + 'всі двадцять чотири гран-прі сезону на їхніх справжніх дистанціях.',
  },
  teams: [
    team('mclaren', 'McLaren Formula 1 Team', 'GBR', TeamBudget.WORKS),
    team('mercedes', 'Mercedes-AMG Petronas F1 Team', 'DEU', TeamBudget.WORKS),
    team('red-bull', 'Oracle Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari HP', 'ITA', TeamBudget.WORKS),
    team('williams', 'Atlassian Williams Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('racing-bulls', 'Visa Cash App Racing Bulls F1 Team', 'ITA', TeamBudget.INDEPENDENT),
    team('aston-martin', 'Aston Martin Aramco F1 Team', 'GBR', TeamBudget.WORKS),
    team('haas', 'MoneyGram Haas F1 Team', 'USA', TeamBudget.INDEPENDENT),
    team('sauber', 'Stake F1 Team Kick Sauber', 'CHE', TeamBudget.INDEPENDENT),
    team('alpine', 'BWT Alpine F1 Team', 'FRA', TeamBudget.WORKS),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // By team.
      seats: [
        seat('mclaren-norris', 'mclaren', 'Lando Norris', 'GBR'),
        seat('mclaren-piastri', 'mclaren', 'Oscar Piastri', 'AUS'),
        seat('mercedes-russell', 'mercedes', 'George Russell', 'GBR'),
        seat('mercedes-antonelli', 'mercedes', 'Andrea Kimi Antonelli', 'ITA'),
        seat('red-bull-verstappen', 'red-bull', 'Max Verstappen', 'NLD'),
        seat('red-bull-tsunoda', 'red-bull', 'Yuki Tsunoda', 'JPN'),
        seat('ferrari-leclerc', 'ferrari', 'Charles Leclerc', 'MCO'),
        seat('ferrari-hamilton', 'ferrari', 'Lewis Hamilton', 'GBR'),
        seat('williams-albon', 'williams', 'Alexander Albon', 'THA'),
        seat('williams-sainz', 'williams', 'Carlos Sainz', 'ESP'),
        seat('racing-bulls-hadjar', 'racing-bulls', 'Isack Hadjar', 'FRA'),
        seat('racing-bulls-lawson', 'racing-bulls', 'Liam Lawson', 'NZL'),
        seat('aston-martin-alonso', 'aston-martin', 'Fernando Alonso', 'ESP'),
        seat('aston-martin-stroll', 'aston-martin', 'Lance Stroll', 'CAN'),
        seat('haas-ocon', 'haas', 'Esteban Ocon', 'FRA'),
        seat('haas-bearman', 'haas', 'Oliver Bearman', 'GBR'),
        seat('sauber-hulkenberg', 'sauber', 'Nico Hülkenberg', 'DEU'),
        seat('sauber-bortoleto', 'sauber', 'Gabriel Bortoleto', 'BRA'),
        seat('alpine-gasly', 'alpine', 'Pierre Gasly', 'FRA'),
        seat('alpine-colapinto', 'alpine', 'Franco Colapinto', 'ARG'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2025_RSS },
    },
  ],
  eventFormats: [EVENT, SPRINT],
  defaultEventFormat: 'sprint',
  rounds: [
    {
      id: 'albert-park',
      name: 'Australian Grand Prix',
      track: recommendedTrack('albert-park/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: recommendedTrack('shanghai/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'suzuka',
      name: 'Japanese Grand Prix',
      track: recommendedTrack('suzuka/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: recommendedTrack('bahrain/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.ARID,
    },
    {
      id: 'jeddah',
      name: 'Saudi Arabian Grand Prix',
      track: recommendedTrack('jeddah/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.ARID,
    },
    {
      id: 'miami',
      name: 'Miami Grand Prix',
      track: recommendedTrack('miami/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'emilia-romagna',
      name: 'Emilia Romagna Grand Prix',
      track: recommendedTrack('imola/gp'),
      eventFormat: 'grand-prix',
    },
    {
      id: 'monaco',
      name: 'Monaco Grand Prix',
      track: recommendedTrack('monaco/gp'),
      eventFormat: 'grand-prix',
      sessionLengths: [{ session: 'grand-prix', laps: 78 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'spain',
      name: 'Spanish Grand Prix',
      track: recommendedTrack('barcelona/gp'),
      eventFormat: 'grand-prix',
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: recommendedTrack('montreal/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: recommendedTrack('red-bull-ring/gp'),
      eventFormat: 'grand-prix',
      sessionLengths: [{ session: 'grand-prix', laps: 70 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: recommendedTrack('silverstone/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.OCEANIC,
    },
    { id: 'belgium', name: 'Belgian Grand Prix', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: recommendedTrack('hungaroring/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'netherlands',
      name: 'Dutch Grand Prix',
      track: recommendedTrack('zandvoort/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.OCEANIC,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: recommendedTrack('monza/gp'), eventFormat: 'grand-prix' },
    {
      id: 'baku',
      name: 'Azerbaijan Grand Prix',
      track: recommendedTrack('baku/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.ARID,
    },
    {
      id: 'marina-bay',
      name: 'Singapore Grand Prix',
      track: recommendedTrack('marina-bay/gp'),
      eventFormat: 'grand-prix',
      sessionLengths: [{ session: 'grand-prix', laps: 62 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: recommendedTrack('cota/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'mexico-city',
      name: 'Mexico City Grand Prix',
      track: recommendedTrack('mexico-city/gp'),
      eventFormat: 'grand-prix',
      sessionLengths: [{ session: 'grand-prix', laps: 71 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sao-paulo',
      name: 'São Paulo Grand Prix',
      track: recommendedTrack('interlagos/gp'),
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'las-vegas',
      name: 'Las Vegas Grand Prix',
      track: recommendedTrack('las-vegas/gp'),
      eventFormat: 'grand-prix',
      sessionLengths: [{ session: 'grand-prix', laps: 50 }],
      climate: Climate.ARID,
    },
    {
      id: 'losail',
      name: 'Qatar Grand Prix',
      track: recommendedTrack('losail/gp'),
      climate: Climate.ARID,
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi Grand Prix',
      track: recommendedTrack('yas-marina/gp'),
      eventFormat: 'grand-prix',
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
    { id: 'sprint', name: 'Sprint points', positions: [8, 7, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 10 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: true },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [100000, 70000, 50000, 36000, 27000, 20000, 15000, 10000, 6000, 3000],
    standings: [700000, 420000, 280000, 180000, 120000],
  },
};
