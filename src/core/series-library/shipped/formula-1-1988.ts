import { seat, team } from './utils.ts';
import { Hemisphere } from '../../../shared/types/index.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of the era: practice both days and the hour of
 * qualifying on Saturday. Friday's hour, whose best times counted too, is
 * not run.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Friday practice', minutes: 90, day: 0 },
    { type: 'practice', name: 'Saturday practice', minutes: 90, day: 1 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2 },
  ],
};

/**
 * Formula 1, 1988 - McLaren's fifteen wins from sixteen, and Ayrton Senna's first title.
 *
 * The real entry list on VRC's McLaren MP4/4, in whichever of its four chassis
 * are installed - every seat drives one, so the season's dominant car is the
 * whole grid. Cut to twenty by Silverstone's pit boxes: the drivers who
 * started most of the season. Fourteen of sixteen rounds at their real
 * distances; Imola, Monaco, Silverstone before its rebuild, Spa and Monza run
 * their real laps or near them, and where a circuit has changed since, the laps
 * cover the real race's distance. Jacarepagua and Detroit are not in Assetto
 * Corsa.
 *
 * Points are 9-6-4-3-2-1, counting a driver's best eleven, which a points
 * system cannot say yet.
 *
 * Source: https://en.wikipedia.org/wiki/1988_Formula_One_World_Championship
 */
export const FORMULA_1_1988: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1988',
  name: 'Formula 1 1988',
  description: {
    en: 'Ayrton Senna\'s first title and McLaren\'s fifteen wins, with the real entry list in VRC\'s '
      + 'MP4/4 and fourteen of its grands prix at their real distances.',
    uk: 'Перший титул Айртона Сенни і п\'ятнадцять перемог McLaren зі справжнім списком учасників '
      + 'на MP4/4 від VRC та чотирнадцятьма гран-прі на справжніх дистанціях.',
  },
  teams: [
    team('mclaren', 'Honda Marlboro McLaren', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('benetton', 'Benetton Formula', 'GBR', TeamBudget.WORKS),
    team('lotus', 'Camel Team Lotus Honda', 'GBR', TeamBudget.WORKS),
    team('march', 'Leyton House March Racing Team', 'GBR', TeamBudget.INDEPENDENT),
    team('arrows', 'USF&G Arrows Megatron', 'GBR', TeamBudget.INDEPENDENT),
    team('williams', 'Canon Williams Team', 'GBR', TeamBudget.INDEPENDENT),
    team('tyrrell', 'Tyrrell Racing Organisation', 'GBR', TeamBudget.PRIVATEER),
    team('rial', 'Rial Racing', 'DEU', TeamBudget.PRIVATEER),
    team('minardi', 'Minardi Team', 'ITA', TeamBudget.PRIVATEER),
    team('larrousse', 'Larrousse Calmels', 'FRA', TeamBudget.PRIVATEER),
    team('dallara', 'BMS Scuderia Italia', 'ITA', TeamBudget.PRIVATEER),
    team('ags', 'Automobiles Gonfaronnaises Sportives', 'FRA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // Roughly in the order the season finished.
      seats: [
        seat('mclaren-senna', 'mclaren', 'Ayrton Senna', 'BRA'),
        seat('mclaren-prost', 'mclaren', 'Alain Prost', 'FRA'),
        seat('ferrari-berger', 'ferrari', 'Gerhard Berger', 'AUT'),
        seat('benetton-boutsen', 'benetton', 'Thierry Boutsen', 'BEL'),
        seat('ferrari-alboreto', 'ferrari', 'Michele Alboreto', 'ITA'),
        seat('lotus-piquet', 'lotus', 'Nelson Piquet', 'BRA'),
        seat('march-capelli', 'march', 'Ivan Capelli', 'ITA'),
        seat('arrows-warwick', 'arrows', 'Derek Warwick', 'GBR'),
        seat('benetton-nannini', 'benetton', 'Alessandro Nannini', 'ITA'),
        seat('williams-patrese', 'williams', 'Riccardo Patrese', 'ITA'),
        seat('arrows-cheever', 'arrows', 'Eddie Cheever', 'USA'),
        seat('williams-mansell', 'williams', 'Nigel Mansell', 'GBR'),
        seat('march-gugelmin', 'march', 'Maurício Gugelmin', 'BRA'),
        seat('lotus-nakajima', 'lotus', 'Satoru Nakajima', 'JPN'),
        seat('tyrrell-palmer', 'tyrrell', 'Jonathan Palmer', 'GBR'),
        seat('rial-cesaris', 'rial', 'Andrea de Cesaris', 'ITA'),
        seat('minardi-martini', 'minardi', 'Pierluigi Martini', 'ITA'),
        seat('larrousse-alliot', 'larrousse', 'Philippe Alliot', 'FRA'),
        seat('dallara-caffi', 'dallara', 'Alex Caffi', 'ITA'),
        seat('ags-streiff', 'ags', 'Philippe Streiff', 'FRA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1988 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
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
      sessionLengths: [{ session: 'grand-prix', laps: 78 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'mexico',
      name: 'Mexican Grand Prix',
      track: recommendedTrack('mexico-city/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 69 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: recommendedTrack('montreal/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'paul-ricard',
      name: 'French Grand Prix',
      track: recommendedTrack('paul-ricard/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'britain',
      name: 'British Grand Prix',
      track: recommendedTrack('silverstone/1967'),
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'hockenheim',
      name: 'German Grand Prix',
      track: recommendedTrack('hockenheim/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 66 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hungary',
      name: 'Hungarian Grand Prix',
      track: recommendedTrack('hungaroring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'belgium',
      name: 'Belgian Grand Prix',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 43 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'italy',
      name: 'Italian Grand Prix',
      track: recommendedTrack('monza/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 51 }],
    },
    {
      id: 'portugal',
      name: 'Portuguese Grand Prix',
      track: recommendedTrack('estoril/no-chicane'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'jerez',
      name: 'Spanish Grand Prix',
      track: recommendedTrack('jerez/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'suzuka',
      name: 'Japanese Grand Prix',
      track: recommendedTrack('suzuka/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 52 }],
      climate: Climate.TEMPERATE,
    },
    {
      id: 'adelaide',
      name: 'Australian Grand Prix',
      track: recommendedTrack('adelaide/street'),
      sessionLengths: [{ session: 'grand-prix', laps: 97 }],
      climate: Climate.MEDITERRANEAN,
      hemisphere: Hemisphere.SOUTH,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship points', positions: [9, 6, 4, 3, 2, 1] },
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
