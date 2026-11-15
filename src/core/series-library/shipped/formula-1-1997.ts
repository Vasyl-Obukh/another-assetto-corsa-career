import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, Hemisphere, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of the era: practice both days and Saturday's hour of
 * qualifying, twelve laps a driver.
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
 * Formula 1, 1997 - Jacques Villeneuve's title, settled at Jerez.
 *
 * The real entry list on VRC's Ferrari F310B and Williams FW19 - the two cars
 * that fought for the title - every seat in whichever of them is installed.
 * Michael Schumacher keeps his seat, though he was excluded from the standings
 * afterwards. Sixteen of seventeen rounds at their real distances, the A1-Ring
 * on the Red Bull Ring's layout; where a circuit has changed since, the laps
 * cover the real race's distance. Monaco's and Jerez's boxes just hold the
 * twenty-two cars. Buenos Aires is not in Assetto Corsa.
 *
 * Points are 10-6-4-3-2-1.
 *
 * Source: https://en.wikipedia.org/wiki/1997_Formula_One_World_Championship
 */
export const FORMULA_1_1997: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1997',
  name: 'Formula 1 1997',
  description: {
    en: 'Jacques Villeneuve\'s title season, with the real entry list in VRC\'s F310B and FW19 and '
      + 'sixteen of its grands prix at their real distances.',
    uk: 'Чемпіонський сезон Жака Вільнева зі справжнім списком учасників на F310B і FW19 від VRC '
      + 'та шістнадцятьма гран-прі на справжніх дистанціях.',
  },
  teams: [
    team('williams', 'Rothmans Williams Renault', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari Marlboro', 'ITA', TeamBudget.WORKS),
    team('mclaren', 'West McLaren Mercedes', 'GBR', TeamBudget.WORKS),
    team('benetton', 'Mild Seven Benetton Renault', 'GBR', TeamBudget.WORKS),
    team('jordan', 'B&H Total Jordan Peugeot', 'IRL', TeamBudget.INDEPENDENT),
    team('prost', 'Prost Gauloises Blondes', 'FRA', TeamBudget.INDEPENDENT),
    team('sauber', 'Red Bull Sauber Petronas', 'CHE', TeamBudget.INDEPENDENT),
    team('arrows', 'Danka Arrows Yamaha', 'GBR', TeamBudget.INDEPENDENT),
    team('stewart', 'Stewart Ford', 'GBR', TeamBudget.INDEPENDENT),
    team('tyrrell', 'Tyrrell', 'GBR', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Team', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('williams-villeneuve', 'williams', 'Jacques Villeneuve', 'CAN'),
        seat('ferrari-schumacher', 'ferrari', 'Michael Schumacher', 'DEU'),
        seat('williams-frentzen', 'williams', 'Heinz-Harald Frentzen', 'DEU'),
        seat('mclaren-coulthard', 'mclaren', 'David Coulthard', 'GBR'),
        seat('benetton-alesi', 'benetton', 'Jean Alesi', 'FRA'),
        seat('benetton-berger', 'benetton', 'Gerhard Berger', 'AUT'),
        seat('mclaren-hakkinen', 'mclaren', 'Mika Häkkinen', 'FIN'),
        seat('ferrari-irvine', 'ferrari', 'Eddie Irvine', 'GBR'),
        seat('jordan-fisichella', 'jordan', 'Giancarlo Fisichella', 'ITA'),
        seat('prost-panis', 'prost', 'Olivier Panis', 'FRA'),
        seat('sauber-herbert', 'sauber', 'Johnny Herbert', 'GBR'),
        seat('jordan-schumacher', 'jordan', 'Ralf Schumacher', 'DEU'),
        seat('arrows-hill', 'arrows', 'Damon Hill', 'GBR'),
        seat('stewart-barrichello', 'stewart', 'Rubens Barrichello', 'BRA'),
        seat('tyrrell-salo', 'tyrrell', 'Mika Salo', 'FIN'),
        seat('stewart-magnussen', 'stewart', 'Jan Magnussen', 'DNK'),
        seat('arrows-diniz', 'arrows', 'Pedro Diniz', 'BRA'),
        seat('prost-nakano', 'prost', 'Shinji Nakano', 'JPN'),
        seat('tyrrell-verstappen', 'tyrrell', 'Jos Verstappen', 'NLD'),
        seat('minardi-katayama', 'minardi', 'Ukyo Katayama', 'JPN'),
        seat('minardi-trulli', 'minardi', 'Jarno Trulli', 'ITA'),
        seat('sauber-larini', 'sauber', 'Nicola Larini', 'ITA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1997 },
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
    {
      id: 'brazil',
      name: 'Brazilian Grand Prix',
      track: recommendedTrack('interlagos/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 72 }],
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
    {
      id: 'san-marino',
      name: 'San Marino Grand Prix',
      track: recommendedTrack('imola/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 62 }],
    },
    {
      id: 'monaco',
      name: 'Monaco Grand Prix',
      track: recommendedTrack('monaco/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 63 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'spain',
      name: 'Spanish Grand Prix',
      track: recommendedTrack('barcelona/gp-2007'),
      sessionLengths: [{ session: 'grand-prix', laps: 65 }],
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: recommendedTrack('montreal/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'france',
      name: 'French Grand Prix',
      track: recommendedTrack('magny-cours/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 69 }],
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
      id: 'austria',
      name: 'Austrian Grand Prix',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'luxembourg',
      name: 'Luxembourg Grand Prix',
      track: recommendedTrack('nurburgring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'suzuka',
      name: 'Japanese Grand Prix',
      track: recommendedTrack('suzuka/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'jerez',
      name: 'European Grand Prix',
      track: recommendedTrack('jerez/gp'),
      climate: Climate.MEDITERRANEAN,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [10, 6, 4, 3, 2, 1] },
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
