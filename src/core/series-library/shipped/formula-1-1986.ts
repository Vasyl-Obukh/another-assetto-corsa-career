import { seat, team } from './utils.ts';
import { Hemisphere } from '../../../shared/types/index.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A grand prix event of the turbo era: untimed practice, qualifying, and the
 * race. The two real hour-long qualifying sessions are one here, since a grid
 * is set from one session's order.
 */
const EVENT: EventFormat = {
  id: 'grand-prix',
  name: 'Grand Prix',
  sessions: [
    { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
    { id: 'grand-prix', type: 'race', name: 'Grand Prix', distance: 305, day: 2 },
  ],
};

/**
 * Formula 1, 1986 - the height of the turbo era, and Alain Prost's second
 * title.
 *
 * The real entry list on the 1986 spec: the base game's Lotus 98T, which Ayrton
 * Senna drove to eight poles, with RSS's Formula 1986 joining the field for
 * anyone who owns it. Thirteen of sixteen rounds at their real distances:
 * Imola, Monaco, Spa, Montreal, Paul Ricard, Brands Hatch, Hockenheim, the
 * Hungaroring, the Osterreichring, Monza, Estoril, Mexico City and Adelaide.
 * Where a circuit has changed since, the laps cover the real race's distance.
 * Jacarepagua and Detroit are not in Assetto Corsa.
 *
 * Points are 9-6-4-3-2-1 over a driver's best eleven results, which a points
 * system cannot say yet. The base circuits' twenty-four boxes cap a grid that
 * ran twenty-six, and Jerez's twenty-two cannot hold it; Monaco needs
 * monaco_2020's layouts, the older monaco mod having twenty-two.
 *
 * Source: https://en.wikipedia.org/wiki/1986_Formula_One_World_Championship
 */
export const FORMULA_1_1986: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-1-1986',
  name: 'Formula 1 1986',
  description: {
    en: 'The height of the turbo era, with the real entry list in the base game\'s Lotus 98T and '
      + 'thirteen grands prix at their real distances. RSS\'s Formula 1986 joins the grid if you own it.',
    uk: 'Розквіт турбоери зі справжнім списком учасників на Lotus 98T з базової гри та тринадцятьма '
      + 'гран-прі на справжніх дистанціях. Formula 1986 від RSS поповнює стартову решітку, '
      + 'якщо вона у вас є.',
  },
  teams: [
    team('williams', 'Canon Williams Team', 'GBR', TeamBudget.WORKS),
    team('mclaren', 'Marlboro McLaren International', 'GBR', TeamBudget.WORKS),
    team('lotus', 'John Player Special Team Lotus', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('benetton', 'Benetton Formula', 'GBR', TeamBudget.INDEPENDENT),
    team('ligier', 'Équipe Ligier', 'FRA', TeamBudget.INDEPENDENT),
    team('brabham', 'Motor Racing Developments', 'GBR', TeamBudget.INDEPENDENT),
    team('tyrrell', 'Data General Team Tyrrell', 'GBR', TeamBudget.INDEPENDENT),
    team('arrows', 'Barclay Arrows', 'GBR', TeamBudget.PRIVATEER),
    team('haas', 'Team Haas (USA)', 'USA', TeamBudget.INDEPENDENT),
    team('minardi', 'Minardi Team', 'ITA', TeamBudget.PRIVATEER),
    team('zakspeed', 'West Zakspeed Racing', 'DEU', TeamBudget.PRIVATEER),
    team('osella', 'Osella Squadra Corse', 'ITA', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-1',
      name: 'Formula 1',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 1 },
      // In the order the season finished.
      seats: [
        seat('mclaren-prost', 'mclaren', 'Alain Prost', 'FRA'),
        seat('williams-mansell', 'williams', 'Nigel Mansell', 'GBR'),
        seat('williams-piquet', 'williams', 'Nelson Piquet', 'BRA'),
        seat('lotus-senna', 'lotus', 'Ayrton Senna', 'BRA'),
        seat('ferrari-johansson', 'ferrari', 'Stefan Johansson', 'SWE'),
        seat('mclaren-rosberg', 'mclaren', 'Keke Rosberg', 'FIN'),
        seat('benetton-berger', 'benetton', 'Gerhard Berger', 'AUT'),
        seat('ligier-laffite', 'ligier', 'Jacques Laffite', 'FRA'),
        seat('ferrari-alboreto', 'ferrari', 'Michele Alboreto', 'ITA'),
        seat('ligier-arnoux', 'ligier', 'René Arnoux', 'FRA'),
        seat('tyrrell-brundle', 'tyrrell', 'Martin Brundle', 'GBR'),
        seat('arrows-boutsen', 'arrows', 'Thierry Boutsen', 'BEL'),
        seat('benetton-fabi', 'benetton', 'Teo Fabi', 'ITA'),
        seat('lotus-dumfries', 'lotus', 'Johnny Dumfries', 'GBR'),
        seat('haas-tambay', 'haas', 'Patrick Tambay', 'FRA'),
        seat('haas-jones', 'haas', 'Alan Jones', 'AUS'),
        seat('brabham-patrese', 'brabham', 'Riccardo Patrese', 'ITA'),
        seat('tyrrell-streiff', 'tyrrell', 'Philippe Streiff', 'FRA'),
        seat('brabham-warwick', 'brabham', 'Derek Warwick', 'GBR'),
        seat('arrows-surer', 'arrows', 'Marc Surer', 'CHE'),
        seat('zakspeed-palmer', 'zakspeed', 'Jonathan Palmer', 'GBR'),
        seat('minardi-de-cesaris', 'minardi', 'Andrea de Cesaris', 'ITA'),
        seat('minardi-nannini', 'minardi', 'Alessandro Nannini', 'ITA'),
        seat('osella-ghinzani', 'osella', 'Piercarlo Ghinzani', 'ITA'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.FORMULA_1_1986 },
    },
  ],
  eventFormats: [EVENT],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'san-marino',
      name: 'San Marino Grand Prix',
      track: recommendedTrack('imola/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 60 }],
    },
    {
      id: 'monaco',
      name: 'Monaco Grand Prix',
      track: recommendedTrack('monaco/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 78 }],
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'belgium',
      name: 'Belgian Grand Prix',
      track: recommendedTrack('spa/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 43 }],
      climate: Climate.OCEANIC,
    },
    {
      id: 'canada',
      name: 'Canadian Grand Prix',
      track: recommendedTrack('montreal/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 69 }],
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
      track: recommendedTrack('brands-hatch/gp'),
      sessionLengths: [{ session: 'grand-prix', laps: 75 }],
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
      id: 'osterreichring',
      name: 'Austrian Grand Prix',
      track: recommendedTrack('osterreichring/gp'),
      climate: Climate.TEMPERATE,
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
      track: recommendedTrack('estoril/gp'),
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'mexico-city',
      name: 'Mexican Grand Prix',
      track: recommendedTrack('mexico-city/gp'),
      // VRC's Mexico reports a 2.6 km lap for the 4.3 km circuit.
      sessionLengths: [{ session: 'grand-prix', laps: 71 }],
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
  grid: { aggression: 5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 17500,
  prizes: {
    positions: [70000, 45000, 30000, 21000, 15000, 11000],
    standings: [450000, 270000, 180000, 120000, 80000],
  },
};
