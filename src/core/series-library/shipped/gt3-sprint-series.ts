import { seat, team } from './utils.ts';
import { CarSpec, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * A GT3 sprint championship, configured by a spec rather than by a car list.
 *
 * Deliberately not named for a real season. The GT3 (2010s) spec spans 2011 to
 * 2016 machinery, so a 2013 Blancpain field would not have held an AMG GT3 -
 * naming a year would make the series claim something the grid contradicts.
 *
 * It is also what "a spec is satisfied by whatever you own" looks like on a
 * real install: five of its cars are base content, and owning Ready to Race,
 * the Tripl3 Pack or Porsche Pack 3 simply widens the field.
 */
export const GT3_SPRINT_SERIES: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'gt3-sprint-series',
  name: 'GT3 Sprint Series',
  notes: 'One-hour sprint races for 2010s GT3 machinery. The field is drawn from whichever of the '
    + 'class you own, so DLC widens the grid rather than unlocking the series.',
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
      name: 'Race weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', minutes: 60, day: 1 },
      ],
    },
    {
      id: 'sprint',
      name: 'Sprint weekend',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 20, day: 0 },
        { id: 'q1', type: 'qualify', name: 'Qualifying 1', minutes: 12, day: 0 },
        {
          type: 'race',
          name: 'Race 1',
          minutes: 30,
          day: 0,
          inherit: { from: 'q1' },
          pointsSystem: 'sprint',
        },
        { id: 'q2', type: 'qualify', name: 'Qualifying 2', minutes: 12, day: 1 },
        { type: 'race', name: 'Race 2', minutes: 30, day: 1, inherit: { from: 'q2' } },
      ],
    },
  ],
  defaultWeekendFormat: 'standard',
  rounds: [
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    { id: 'silverstone', name: 'Silverstone', track: { id: 'ks_silverstone', layout: 'gp' } },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' } },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_a' },
      weekendFormat: 'sprint',
    },
    {
      id: 'zandvoort',
      name: 'Zandvoort',
      track: { id: 'ks_zandvoort' },
      weekendFormat: 'sprint',
    },
    { id: 'imola', name: 'Imola', track: { id: 'imola' } },
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1], pole: 1 },
    { id: 'sprint', name: 'Sprint points', positions: [15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  drops: 1,
  grid: { aiLevel: 93, aiLevelMin: 85, aiAggression: 35 },
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
