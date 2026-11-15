import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2013: three practices, the three-part knockout, and
 * the race.
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
      inherit: { from: 'q1', top: 16 },
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
 * Formula 1, 2013 - the last season of the V8s, and Sebastian Vettel's fourth title.
 *
 * The real entry list on the 2013 spec - the Red Pack's Ferrari F138 and
 * RSS's Formula 2013, either of which fields the grid on its own - with every
 * seat in whichever of it is installed. 17 of 19 rounds at their real
 * distances; Barcelona runs the layout with its final chicane, and where a
 * circuit has changed since, the laps cover the real race's distance. Yeongam
 * and the Buddh circuit are not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, 22 cars cut to 16 and
 * then to 10. Points are 25-18-15-12-10-8-6-4-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2013_Formula_One_World_Championship
 */
export const FORMULA_1_2013: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2013',
  name: 'Formula 1 2013',
  description: {
    en: 'The last season of the V8s, with the real entry list and seventeen of its grands prix at '
      + 'their real distances. It runs on the Red Pack\'s F138 or RSS\'s Formula 2013, whichever '
      + 'you own.',
    uk: 'Останній сезон V8 зі справжнім списком учасників і сімнадцятьма гран-прі на справжніх '
      + 'дистанціях. Він проходить на F138 з Red Pack або на Formula 2013 від RSS, залежно від '
      + 'того, що у вас є.',
  },
  teams: [
    team('red-bull', 'Infiniti Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('mercedes', 'Mercedes AMG Petronas', 'DEU', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('lotus', 'Lotus F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('mclaren', 'Vodafone McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('force-india', 'Sahara Force India', 'IND', TeamBudget.INDEPENDENT),
    team('sauber', 'Sauber F1 Team', 'CHE', TeamBudget.INDEPENDENT),
    team('toro-rosso', 'Scuderia Toro Rosso', 'ITA', TeamBudget.INDEPENDENT),
    team('williams', 'Williams F1 Team', 'GBR', TeamBudget.INDEPENDENT),
    team('marussia', 'Marussia F1 Team', 'RUS', TeamBudget.PRIVATEER),
    team('caterham', 'Caterham F1 Team', 'MYS', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('red-bull-vettel', 'red-bull', 'Sebastian Vettel', 'DEU'),
        seat('ferrari-alonso', 'ferrari', 'Fernando Alonso', 'ESP'),
        seat('red-bull-webber', 'red-bull', 'Mark Webber', 'AUS'),
        seat('mercedes-hamilton', 'mercedes', 'Lewis Hamilton', 'GBR'),
        seat('lotus-raikkonen', 'lotus', 'Kimi Räikkönen', 'FIN'),
        seat('mercedes-rosberg', 'mercedes', 'Nico Rosberg', 'DEU'),
        seat('lotus-grosjean', 'lotus', 'Romain Grosjean', 'FRA'),
        seat('ferrari-massa', 'ferrari', 'Felipe Massa', 'BRA'),
        seat('mclaren-button', 'mclaren', 'Jenson Button', 'GBR'),
        seat('sauber-hulkenberg', 'sauber', 'Nico Hülkenberg', 'DEU'),
        seat('mclaren-perez', 'mclaren', 'Sergio Pérez', 'MEX'),
        seat('force-india-resta', 'force-india', 'Paul di Resta', 'GBR'),
        seat('force-india-sutil', 'force-india', 'Adrian Sutil', 'DEU'),
        seat('toro-rosso-ricciardo', 'toro-rosso', 'Daniel Ricciardo', 'AUS'),
        seat('toro-rosso-vergne', 'toro-rosso', 'Jean-Éric Vergne', 'FRA'),
        seat('sauber-gutierrez', 'sauber', 'Esteban Gutiérrez', 'MEX'),
        seat('williams-bottas', 'williams', 'Valtteri Bottas', 'FIN'),
        seat('williams-maldonado', 'williams', 'Pastor Maldonado', 'VEN'),
        seat('marussia-bianchi', 'marussia', 'Jules Bianchi', 'FRA'),
        seat('caterham-pic', 'caterham', 'Charles Pic', 'FRA'),
        seat('caterham-garde', 'caterham', 'Giedo van der Garde', 'NLD'),
        seat('marussia-chilton', 'marussia', 'Max Chilton', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2013 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'albert-park',
      name: 'Australian Grand Prix',
      track: recommendedTrack('albert-park/gp'),
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    { id: 'malaysia', name: 'Malaysian Grand Prix', track: recommendedTrack('sepang/gp'), climate: Climate.TEMPERATE },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: recommendedTrack('shanghai/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: recommendedTrack('bahrain/gp'),
      climate: Climate.ARID,
    },
    { id: 'spain', name: 'Spanish Grand Prix', track: recommendedTrack('barcelona/gp-2007') },
    {
      id: 'monaco',
      name: 'Monaco Grand Prix',
      track: recommendedTrack('monaco/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 78 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: recommendedTrack('montreal/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'germany',
      name: 'German Grand Prix',
      track: recommendedTrack('nurburgring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: recommendedTrack('hungaroring/gp'),
      climate: Climate.TEMPERATE,
    },
    { id: 'belgium', name: 'Belgian Grand Prix', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC },
    { id: 'italy', name: 'Italian Grand Prix', track: recommendedTrack('monza/gp') },
    {
      id: 'marina-bay',
      name: 'Singapore Grand Prix',
      track: recommendedTrack('marina-bay/gp-2008'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'suzuka',
      name: 'Japanese Grand Prix',
      track: recommendedTrack('suzuka/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi Grand Prix',
      track: recommendedTrack('yas-marina/gp'),
      climate: Climate.ARID,
    },
    {
      id: 'united-states',
      name: 'United States Grand Prix',
      track: recommendedTrack('cota/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: recommendedTrack('interlagos/gp'),
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
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
