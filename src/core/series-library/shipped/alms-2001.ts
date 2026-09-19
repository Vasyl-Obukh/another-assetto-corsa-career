import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * American Le Mans Series, 2001 - the prototypes, the GTS class and the GT
 * class of the BMW M3 GTR.
 *
 * Three classes of the real four. LMP900 is RSS's LMP Ferruccio 33, the
 * Ferrari 333 SP in all but name; GTS is the GT1 (2000s) spec, RSS's front-
 * engined GTs and the base game's MC12; GT is Guerilla's E46 GTR - the car BMW
 * built for this very class - with RSS's 911 and 360 of the N-GT spec. LMP675
 * has no car and is left out. Five rounds at their real lengths as understood
 * - the Sebring 12 Hours, Sonoma, Road America, Petit Le Mans at Road Atlanta
 * and Laguna Seca - in an order that was not checked; Texas, Donington,
 * Jarama, Portland, Mosport and Mid-Ohio are not in Assetto Corsa. Laguna
 * Seca's twenty-four boxes cap the grid.
 *
 * The 25-18-15 scale scores each class, a stand-in: the season's own table was
 * not checked. The field is invented: the FIA GT 2004 paddock and three
 * prototype teams.
 *
 * Source: https://en.wikipedia.org/wiki/2001_American_Le_Mans_Series
 */
export const ALMS_2001: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'alms-2001',
  name: 'American Le Mans Series 2001',
  description: 'The American Le Mans Series of 2001 on RSS\'s and Guerilla\'s cars: the 333 SP in LMP900, '
    + 'the GTS class, and the E46 GTR\'s GT class, five rounds at their real lengths.',
  teams: [
    team('sarthe', 'Écurie Sarthoise', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('brescia', 'Scuderia Bresciana', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('vlaanderen', 'Team Vlaanderen', 'Belgium', 'BEL', TeamBudget.INDEPENDENT),
    team('rheintal', 'Rheintal Motorsport', 'Germany', 'GER', TeamBudget.INDEPENDENT),
    team('thames-valley', 'Thames Valley Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
    team('lusitania', 'Lusitânia Racing', 'Portugal', 'POR', TeamBudget.PRIVATEER),
    team('oranje', 'Oranje GT', 'Netherlands', 'NED', TeamBudget.PRIVATEER),
    team('steiermark', 'Steiermark Racing', 'Austria', 'AUT', TeamBudget.PRIVATEER),
    team('everglades', 'Everglades Racing', 'United States', 'USA', TeamBudget.WORKS),
    team('bayshore', 'Bayshore Prototypes', 'United States', 'USA', TeamBudget.INDEPENDENT),
    team('sierra-madre', 'Sierra Madre Racing', 'United States', 'USA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'lmp900',
      name: 'LMP900',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 1 },
      seats: [
        seat('lmp-eve-1', 'everglades', 'Clay Merriwether', 'United States', 'USA'),
        seat('lmp-eve-2', 'everglades', 'Grant Pellew', 'United States', 'USA'),
        seat('lmp-bay-1', 'bayshore', 'Scott Dunleavy', 'United States', 'USA'),
        seat('lmp-bay-2', 'bayshore', 'Reid Wexler', 'United States', 'USA'),
        seat('lmp-sie-1', 'sierra-madre', 'Nate Burkhalter', 'United States', 'USA'),
        seat('lmp-sie-b-1', 'sierra-madre', 'Victor Arana', 'Mexico', 'MEX'),
      ],
      eligibility: { kind: 'cars', cars: ['rss_lmp_ferruccio_33_v12'] },
    },
    {
      id: 'gts',
      name: 'GTS',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('gts-sar-1', 'sarthe', 'Jean-Marc Tessier', 'France', 'FRA'),
        seat('gts-sar-2', 'sarthe', 'Olivier Bourdonnais', 'France', 'FRA'),
        seat('gts-bre-1', 'brescia', 'Fabio Lanzavecchia', 'Italy', 'ITA'),
        seat('gts-bre-2', 'brescia', 'Marco Ottonelli', 'Italy', 'ITA'),
        seat('gts-vla-1', 'vlaanderen', 'Wim Declercq', 'Belgium', 'BEL'),
        seat('gts-vla-2', 'vlaanderen', 'Pieter Vanoverbeke', 'Belgium', 'BEL'),
        seat('gts-rhe-1', 'rheintal', 'Uwe Kellersmann', 'Germany', 'GER'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT1_2000S, minModels: 2 },
      grid: { aiLevel: 93, aiLevelMin: 86 },
      prizes: {
        positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
        standings: [240000, 150000, 96000, 63000, 39000],
      },
    },
    {
      id: 'gt',
      name: 'GT',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('gt-tha-1', 'thames-valley', 'Simon Brackley', 'Great Britain', 'GBR'),
        seat('gt-tha-2', 'thames-valley', 'Gareth Penhaligon', 'Great Britain', 'GBR'),
        seat('gt-lus-1', 'lusitania', 'Nuno Carvalhal', 'Portugal', 'POR'),
        seat('gt-lus-2', 'lusitania', 'Rui Bettencourt', 'Portugal', 'POR'),
        seat('gt-ora-1', 'oranje', 'Bas Heemskerk', 'Netherlands', 'NED'),
        seat('gt-ora-2', 'oranje', 'Ruud Kalsbeek', 'Netherlands', 'NED'),
        seat('gt-ste-1', 'steiermark', 'Harald Pöltl', 'Austria', 'AUT'),
        seat('gt-ste-2', 'steiermark', 'Gernot Strassegger', 'Austria', 'AUT'),
        seat('gt-rhe-1', 'rheintal', 'Dirk Kornmeier', 'Germany', 'GER'),
        seat('gt-rhe-2', 'rheintal', 'Holger Stapelfeld', 'Germany', 'GER'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'gue_bmw_m3_e46_gtr',
          'rss_gtn_protech_96',
          'rss_gtn_ferruccio_36',
          'rss_gtn_furiano_36',
        ],
      },
      grid: { aiLevel: 90, aiLevelMin: 83 },
      prizes: {
        positions: [18000, 12600, 9000, 6850, 5200, 3950, 2900, 2150, 1450, 900],
        standings: [144000, 90000, 57500, 38000, 23500],
      },
    },
  ],
  weekendFormats: [
    {
      id: 'sprint',
      name: 'Two hours forty-five',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { type: 'race', name: '2 Hours 45', distance: 480, day: 2 },
      ],
    },
    {
      id: 'four-hours',
      name: 'Four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 90, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { id: 'race', type: 'race', name: 'Road America 500', laps: 124, day: 2 },
      ],
    },
    {
      id: 'ten-hours',
      name: 'Ten hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { id: 'race', type: 'race', name: 'Petit Le Mans', laps: 394, day: 2 },
      ],
    },
    {
      id: 'twelve-hours',
      name: 'Twelve hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 30, day: 1 },
        { id: 'race', type: 'race', name: '12 Hours', laps: 370, day: 2 },
      ],
    },
  ],
  defaultWeekendFormat: 'sprint',
  rounds: [
    {
      id: 'sebring',
      name: '12 Hours of Sebring',
      track: { id: 'mx_sebring', layout: 'raceday_standing' },
      weekendFormat: 'twelve-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'sonoma',
      name: 'Grand Prix of Sonoma',
      track: { id: 'rt_sonoma', layout: 'long' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'road-america',
      name: 'Road America 500',
      track: { id: 'lilski_road_america' },
      weekendFormat: 'four-hours',
      climate: Climate.TEMPERATE,
    },
    {
      id: 'petit-le-mans',
      name: 'Petit Le Mans',
      track: { id: 'road_atlanta2018', layout: 'grandprix' },
      weekendFormat: 'ten-hours',
      climate: Climate.TEMPERATE,
    },
    { id: 'laguna-seca', name: 'Grand Prix of Monterey', track: { id: 'ks_laguna_seca' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 94, aiLevelMin: 86, aiAggression: 35 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 15000,
  prizes: {
    positions: [50000, 35000, 25000, 19000, 14500, 11000, 8000, 6000, 4000, 2500],
    standings: [400000, 250000, 160000, 105000, 65000],
  },
};
