import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A GT3 sprint championship, configured by a spec rather than by a car list.
 *
 * The weekend is the Blancpain Sprint Series' of 2013: one qualifying, then an
 * hour-long qualifying race whose result sets the grid of the hour-long main
 * race. The qualifying race pays the 8-6-4-3-2-1 of the FIA GT1 World
 * Championship it grew out of and the main race 25-18-15; the Sprint Series'
 * own 2013 tables were not found, so both are the nearest sourced ones.
 *
 * Deliberately not named for a real season. The GT3 (2010s) spec spans 2011 to
 * 2016 machinery, so a 2013 field would not have held an AMG GT3 - naming a
 * year would make the series claim something the grid contradicts. For the
 * same reason the calendar is its own rather than Nogaro, Zolder, Slovakia,
 * Navarra and Baku, of which only Zandvoort is in Assetto Corsa.
 *
 * It is also what "a spec is satisfied by whatever you own" looks like on a
 * real install: five of its cars are base content, and owning Ready to Race,
 * the Red Pack or Porsche Pack 3 simply widens the field.
 *
 * Source: https://en.wikipedia.org/wiki/2011_FIA_GT1_World_Championship
 */
export const GT3_SPRINT_SERIES: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt3-sprint-series',
  name: 'GT3 Sprint Series',
  description: 'Hour-long sprint races for 2010s GT3 machinery, the Blancpain Sprint way: a qualifying '
    + 'race sets the grid for the main race. The field is drawn from whichever of the class you own, '
    + 'so DLC widens the grid rather than unlocking the series.',
  teams: [
    team('kestrel', 'Kestrel Autosport', 'Great Britain', 'GBR', TeamBudget.WORKS),
    team('rheinwerk', 'Rheinwerk Motorsport', 'Germany', 'GER', TeamBudget.WORKS),
    team('scuderia-oltre', 'Scuderia Oltre', 'Italy', 'ITA', TeamBudget.INDEPENDENT),
    team('gravelines', 'Gravelines Competition', 'France', 'FRA', TeamBudget.INDEPENDENT),
    team('zuiderzee', 'Zuiderzee Racing', 'Netherlands', 'NED', TeamBudget.PRIVATEER),
    team('black-fen', 'Black Fen Racing', 'Great Britain', 'GBR', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt3',
      name: 'GT3',
      // Six two-car teams. Which car each of them fields is drawn from whatever
      // of the spec is installed, so a seat names a driver and a team and stops
      // there - a GT3 series is not one make, and pinning a car would make half
      // the entry list unraceable on a base-content library.
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('kes-1', 'kestrel', 'Duncan Aldridge', 'Great Britain', 'GBR'),
        seat('kes-2', 'kestrel', 'Marius Thorne', 'Great Britain', 'GBR'),
        seat('rhe-1', 'rheinwerk', 'Jonas Kirchner', 'Germany', 'GER'),
        seat('rhe-2', 'rheinwerk', 'Lena Osterhoff', 'Germany', 'GER'),
        seat('olt-1', 'scuderia-oltre', 'Giulio Mancuso', 'Italy', 'ITA'),
        seat('olt-2', 'scuderia-oltre', 'Bernardo Lisi', 'Italy', 'ITA'),
        seat('gra-1', 'gravelines', 'Thibault Mercier', 'France', 'FRA'),
        seat('gra-2', 'gravelines', 'Camille Desrosiers', 'France', 'FRA'),
        seat('zui-1', 'zuiderzee', 'Wouter van Dijk', 'Netherlands', 'NED'),
        seat('zui-2', 'zuiderzee', 'Femke Ravensberg', 'Netherlands', 'NED'),
        seat('bfr-1', 'black-fen', 'Owen Lattimer', 'Great Britain', 'GBR'),
        seat('bfr-2', 'black-fen', 'Ilya Sokolenko', 'Ukraine', 'UKR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_2010S, minModels: 3 },
    },
  ],
  weekendFormats: [
    {
      id: 'standard',
      name: 'Sprint weekend',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        {
          id: 'qualifying-race',
          type: 'race',
          name: 'Qualifying race',
          distance: 160,
          day: 0,
          inherit: { from: 'qualifying' },
          pointsSystem: 'qualifying-race',
        },
        {
          type: 'race',
          name: 'Main race',
          distance: 160,
          day: 1,
          inherit: { from: 'qualifying-race' },
        },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    {
      id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'ks_zandvoort' },
      climate: Climate.TEMPERATE,
    },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Main race', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
    { id: 'qualifying-race', name: 'Qualifying race', positions: [8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aiLevel: 93, aiLevelMin: 85, aiAggression: 35 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, slipstream: 1 },
    penalties: true,
    jumpStartPenalty: 15,
  },
  entryFee: 4500,
  prizes: {
    positions: [18000, 12000, 9000, 7000, 5500, 4200, 3200, 2400, 1600, 900],
    standings: [120000, 75000, 50000, 32000, 20000],
  },
};
