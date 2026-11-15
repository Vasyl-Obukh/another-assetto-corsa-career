import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of 2007: three practices, the three-part
 * knockout, and the race.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice 1', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 2', minutes: 90, day: 0 },
    { type: 'practice', name: 'Free practice 3', minutes: 60, day: 1 },
    { id: 'q1', type: 'qualify', name: 'Q1', minutes: 15, day: 1 },
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
      minutes: 15,
      day: 1,
      inherit: { from: 'q2', top: 10 },
    },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2, inherit: { from: 'q3' } },
  ],
};

/**
 * Formula 1, 2007 - Kimi Räikkönen's title by a single point.
 *
 * The real entry list on VRC's Formula Alpha 2007, its Ferrenzo F07 and
 * McLenna MC22 - the Ferrari and the McLaren in all but name - every seat in
 * whichever is installed. All seventeen rounds at their real distances, Fuji's
 * Japanese Grand Prix among them; where a circuit has changed since, the laps
 * cover the real race's distance. Monaco's boxes just hold the twenty-two
 * cars.
 *
 * Qualifying is the three-part knockout, twenty-two cars cut to sixteen and
 * then to ten. Points are 10-8-6-5-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/2007_Formula_One_World_Championship
 */
export const FORMULA_1_2007: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-2007',
  name: 'Formula 1 2007',
  description: {
    en: 'Kimi Räikkönen\'s title by a point, with the real entry list in VRC\'s Formula Alpha 2007 '
      + 'and all seventeen of its grands prix at their real distances.',
    uk: 'Титул Кімі Райкконена з перевагою в одне очко, зі справжнім списком учасників на Formula '
      + 'Alpha 2007 від VRC і всіма сімнадцятьма гран-прі на справжніх дистанціях.',
  },
  teams: [
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'Vodafone McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('bmw-sauber', 'BMW Sauber F1 Team', 'DEU', TeamBudget.WORKS),
    team('renault', 'ING Renault F1 Team', 'FRA', TeamBudget.WORKS),
    team('williams', 'AT&T Williams', 'GBR', TeamBudget.INDEPENDENT),
    team('red-bull', 'Red Bull Racing', 'AUT', TeamBudget.INDEPENDENT),
    team('toyota', 'Panasonic Toyota Racing', 'JPN', TeamBudget.WORKS),
    team('toro-rosso', 'Scuderia Toro Rosso', 'ITA', TeamBudget.INDEPENDENT),
    team('honda', 'Honda Racing F1 Team', 'JPN', TeamBudget.WORKS),
    team('super-aguri', 'Super Aguri F1 Team', 'JPN', TeamBudget.PRIVATEER),
    team('spyker', 'Etihad Aldar Spyker F1 Team', 'NLD', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('ferrari-raikkonen', 'ferrari', 'Kimi Räikkönen', 'FIN'),
        seat('mclaren-hamilton', 'mclaren', 'Lewis Hamilton', 'GBR'),
        seat('mclaren-alonso', 'mclaren', 'Fernando Alonso', 'ESP'),
        seat('ferrari-massa', 'ferrari', 'Felipe Massa', 'BRA'),
        seat('bmw-sauber-heidfeld', 'bmw-sauber', 'Nick Heidfeld', 'DEU'),
        seat('bmw-sauber-kubica', 'bmw-sauber', 'Robert Kubica', 'POL'),
        seat('renault-kovalainen', 'renault', 'Heikki Kovalainen', 'FIN'),
        seat('renault-fisichella', 'renault', 'Giancarlo Fisichella', 'ITA'),
        seat('williams-rosberg', 'williams', 'Nico Rosberg', 'DEU'),
        seat('red-bull-coulthard', 'red-bull', 'David Coulthard', 'GBR'),
        seat('williams-wurz', 'williams', 'Alexander Wurz', 'AUT'),
        seat('red-bull-webber', 'red-bull', 'Mark Webber', 'AUS'),
        seat('toyota-trulli', 'toyota', 'Jarno Trulli', 'ITA'),
        seat('toro-rosso-vettel', 'toro-rosso', 'Sebastian Vettel', 'DEU'),
        seat('honda-button', 'honda', 'Jenson Button', 'GBR'),
        seat('toyota-schumacher', 'toyota', 'Ralf Schumacher', 'DEU'),
        seat('toro-rosso-liuzzi', 'toro-rosso', 'Vitantonio Liuzzi', 'ITA'),
        seat('super-aguri-sato', 'super-aguri', 'Takuma Sato', 'JPN'),
        seat('super-aguri-davidson', 'super-aguri', 'Anthony Davidson', 'GBR'),
        seat('honda-barrichello', 'honda', 'Rubens Barrichello', 'BRA'),
        seat('spyker-sutil', 'spyker', 'Adrian Sutil', 'DEU'),
        seat('spyker-albers', 'spyker', 'Christijan Albers', 'NLD'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_2007 },
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
      id: 'spain',
      name: 'Spanish Grand Prix',
      track: recommendedTrack('barcelona/gp-2007'),
      sessionLengths: [{ session: 'grand-prix', laps: 65 }],
    },
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
      id: 'europe',
      name: 'European Grand Prix',
      track: recommendedTrack('nurburgring/gp'),
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
      id: 'japan',
      name: 'Japanese Grand Prix',
      track: recommendedTrack('fuji/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 67 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'china',
      name: 'Chinese Grand Prix',
      track: recommendedTrack('shanghai/gp'),
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
