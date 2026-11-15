import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2010: three practices, the three-part
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
      inherit: { from: 'q1', top: 17 },
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
 * Formula 1, 2010 - Sebastian Vettel's first title, four drivers in it at the last round.
 *
 * The real entry list on RSS's Formula 2010, every seat in it: twenty-four
 * cars, which the Kunos layouts' boxes just hold. Seventeen of nineteen rounds
 * at their real distances, Bahrain on the endurance layout it used that year
 * alone. Monaco needs monaco_2020's layouts, the older monaco mod having
 * boxes for only twenty-two cars; Valencia's street circuit and Yeongam are
 * not in Assetto Corsa.
 *
 * Qualifying is the three-part knockout, twenty-four cars cut to seventeen and
 * then to ten. Points are 25-18-15-12-10-8-6-4-2-1, the first season of the
 * scale.
 *
 * Source: https://en.wikipedia.org/wiki/2010_Formula_One_World_Championship
 */
export const FORMULA_1_2010: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2010',
  name: 'Formula 1 2010',
  description: {
    en: 'Sebastian Vettel\'s first title, with the real entry list on RSS\'s Formula 2010 and seventeen '
      + 'of its grands prix at their real distances.',
    uk: 'Перший титул Себастьяна Феттеля зі справжнім списком учасників на Formula 2010 від RSS '
      + 'і сімнадцятьма гран-прі на справжніх дистанціях.',
  },
  teams: [
    team('red-bull', 'Red Bull Racing', 'AUT', TeamBudget.WORKS),
    team('mclaren', 'Vodafone McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('mercedes', 'Mercedes GP Petronas', 'DEU', TeamBudget.WORKS),
    team('renault', 'Renault F1 Team', 'FRA', TeamBudget.WORKS),
    team('williams', 'AT&T Williams', 'GBR', TeamBudget.INDEPENDENT),
    team('force-india', 'Force India F1 Team', 'IND', TeamBudget.INDEPENDENT),
    team('sauber', 'BMW Sauber F1 Team', 'CHE', TeamBudget.INDEPENDENT),
    team('toro-rosso', 'Scuderia Toro Rosso', 'ITA', TeamBudget.INDEPENDENT),
    team('lotus', 'Lotus Racing', 'MYS', TeamBudget.PRIVATEER),
    team('virgin', 'Virgin Racing', 'GBR', TeamBudget.PRIVATEER),
    team('hrt', 'Hispania Racing F1 Team', 'ESP', TeamBudget.PRIVATEER),
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
        seat('mclaren-hamilton', 'mclaren', 'Lewis Hamilton', 'GBR'),
        seat('mclaren-button', 'mclaren', 'Jenson Button', 'GBR'),
        seat('ferrari-massa', 'ferrari', 'Felipe Massa', 'BRA'),
        seat('mercedes-rosberg', 'mercedes', 'Nico Rosberg', 'DEU'),
        seat('renault-kubica', 'renault', 'Robert Kubica', 'POL'),
        seat('mercedes-schumacher', 'mercedes', 'Michael Schumacher', 'DEU'),
        seat('williams-barrichello', 'williams', 'Rubens Barrichello', 'BRA'),
        seat('force-india-sutil', 'force-india', 'Adrian Sutil', 'DEU'),
        seat('sauber-kobayashi', 'sauber', 'Kamui Kobayashi', 'JPN'),
        seat('renault-petrov', 'renault', 'Vitaly Petrov', 'RUS'),
        seat('williams-hulkenberg', 'williams', 'Nico Hülkenberg', 'DEU'),
        seat('force-india-liuzzi', 'force-india', 'Vitantonio Liuzzi', 'ITA'),
        seat('toro-rosso-buemi', 'toro-rosso', 'Sébastien Buemi', 'CHE'),
        seat('sauber-rosa', 'sauber', 'Pedro de la Rosa', 'ESP'),
        seat('toro-rosso-alguersuari', 'toro-rosso', 'Jaime Alguersuari', 'ESP'),
        seat('lotus-kovalainen', 'lotus', 'Heikki Kovalainen', 'FIN'),
        seat('lotus-trulli', 'lotus', 'Jarno Trulli', 'ITA'),
        seat('virgin-glock', 'virgin', 'Timo Glock', 'DEU'),
        seat('hrt-senna', 'hrt', 'Bruno Senna', 'BRA'),
        seat('virgin-grassi', 'virgin', 'Lucas di Grassi', 'BRA'),
        seat('hrt-chandhok', 'hrt', 'Karun Chandhok', 'IND'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2010 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: recommendedTrack('bahrain/endurance'),
      climate: Climate.ARID,
    },
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
    { id: 'spain', name: 'Spanish Grand Prix', track: recommendedTrack('barcelona/gp-2007') },
    {
      id: 'monaco',
      name: 'Monaco Grand Prix',
      track: recommendedTrack('monaco/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 78 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'turkey',
      name: 'Turkish Grand Prix',
      track: recommendedTrack('istanbul/gp-2005'),
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
      id: 'hockenheim',
      name: 'German Grand Prix',
      track: recommendedTrack('hockenheim/gp'),
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
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: recommendedTrack('interlagos/gp'),
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi Grand Prix',
      track: recommendedTrack('yas-marina/gp'),
      climate: Climate.ARID,
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
