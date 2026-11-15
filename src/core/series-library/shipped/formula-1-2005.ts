import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2005: practice both days and single-lap
 * qualifying. The aggregate of two sessions the season opened with is one
 * session here.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 120, day: 0 },
    { type: 'practice', name: 'Saturday practice', minutes: 90, day: 1 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2 },
  ],
};

/**
 * Formula 1, 2005 - Fernando Alonso's first title, Renault against McLaren.
 *
 * The real entry list on VRC's McLaren MP4-20 and Renault R25 - the two cars
 * that fought for the title - every seat in whichever of them is installed.
 * All nineteen rounds at their real distances; Barcelona runs the layout
 * without its later chicane, and where a circuit has changed since, the laps
 * cover the real race's distance.
 *
 * Points are 10-8-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2005_Formula_One_World_Championship
 */
export const FORMULA_1_2005: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2005',
  name: 'Formula 1 2005',
  description: {
    en: 'Fernando Alonso\'s first title, with the real entry list in VRC\'s MP4-20 and R25 and '
      + 'all nineteen of its grands prix at their real distances.',
    uk: 'Перший титул Фернандо Алонсо зі справжнім списком учасників на MP4-20 і R25 від VRC '
      + 'та всіма дев\'ятнадцятьма гран-прі на справжніх дистанціях.',
  },
  teams: [
    team('renault', 'Mild Seven Renault F1 Team', 'FRA', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('toyota', 'Panasonic Toyota Racing', 'JPN', TeamBudget.WORKS),
    team('williams', 'BMW WilliamsF1 Team', 'GBR', TeamBudget.WORKS),
    team('bar', 'Lucky Strike BAR Honda', 'GBR', TeamBudget.WORKS),
    team('red-bull', 'Red Bull Racing', 'AUT', TeamBudget.INDEPENDENT),
    team('sauber', 'Sauber Petronas', 'CHE', TeamBudget.INDEPENDENT),
    team('jordan', 'Jordan Toyota', 'IRL', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Cosworth', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('renault-alonso', 'renault', 'Fernando Alonso', 'ESP'),
        seat('mclaren-raikkonen', 'mclaren', 'Kimi Räikkönen', 'FIN'),
        seat('ferrari-schumacher', 'ferrari', 'Michael Schumacher', 'DEU'),
        seat('mclaren-montoya', 'mclaren', 'Juan Pablo Montoya', 'COL'),
        seat('renault-fisichella', 'renault', 'Giancarlo Fisichella', 'ITA'),
        seat('toyota-schumacher', 'toyota', 'Ralf Schumacher', 'DEU'),
        seat('toyota-trulli', 'toyota', 'Jarno Trulli', 'ITA'),
        seat('ferrari-barrichello', 'ferrari', 'Rubens Barrichello', 'BRA'),
        seat('bar-button', 'bar', 'Jenson Button', 'GBR'),
        seat('williams-webber', 'williams', 'Mark Webber', 'AUS'),
        seat('williams-heidfeld', 'williams', 'Nick Heidfeld', 'DEU'),
        seat('red-bull-coulthard', 'red-bull', 'David Coulthard', 'GBR'),
        seat('sauber-massa', 'sauber', 'Felipe Massa', 'BRA'),
        seat('sauber-villeneuve', 'sauber', 'Jacques Villeneuve', 'CAN'),
        seat('bar-sato', 'bar', 'Takuma Sato', 'JPN'),
        seat('red-bull-klien', 'red-bull', 'Christian Klien', 'AUT'),
        seat('jordan-monteiro', 'jordan', 'Tiago Monteiro', 'PRT'),
        seat('jordan-karthikeyan', 'jordan', 'Narain Karthikeyan', 'IND'),
        seat('minardi-albers', 'minardi', 'Christijan Albers', 'NLD'),
        seat('minardi-friesacher', 'minardi', 'Patrick Friesacher', 'AUT'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2005 },
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
      id: 'bahrain',
      name: 'Bahrain Grand Prix',
      track: recommendedTrack('bahrain/gp'),
      climate: Climate.ARID,
    },
    {
      id: 'san-marino',
      name: 'San Marino Grand Prix',
      track: recommendedTrack('imola/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 62 }],
    },
    {
      id: 'spain',
      name: 'Spanish Grand Prix',
      track: recommendedTrack('barcelona/moto'),
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
    },
    {
      id: 'monaco',
      name: 'Monaco Grand Prix',
      track: recommendedTrack('monaco/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 78 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'europe',
      name: 'European Grand Prix',
      track: recommendedTrack('nurburgring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: recommendedTrack('montreal/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'indianapolis',
      name: 'United States Grand Prix',
      track: recommendedTrack('indianapolis/road'),
      climate: Climate.TEMPERATE,
    },
    { id: 'france', name: 'French Grand Prix', track: recommendedTrack('magny-cours/gp'), climate: Climate.TEMPERATE },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: recommendedTrack('silverstone/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 53 }],
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
    {
      id: 'turkey',
      name: 'Turkish Grand Prix',
      track: recommendedTrack('istanbul/gp-2005'),
      climate: Climate.MEDITERRANEAN,
    },
    { id: 'italy', name: 'Italian Grand Prix', track: recommendedTrack('monza/gp') },
    { id: 'belgium', name: 'Belgian Grand Prix', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC },
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: recommendedTrack('interlagos/gp'),
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'suzuka',
      name: 'Japanese Grand Prix',
      track: recommendedTrack('suzuka/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: recommendedTrack('shanghai/gp'),
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [10, 8, 6, 5, 4, 3, 2, 1] },
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
