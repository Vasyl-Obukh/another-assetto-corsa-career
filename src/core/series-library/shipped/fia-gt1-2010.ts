import { seat, team } from './utils.ts';
import { Climate, Discipline, Hemisphere, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA GT1 World Championship, 2010 - GT1 cars' one world championship, six
 * makes at two cars a team.
 *
 * Four of its six makes are in the catalogue and the class names them: the
 * base game's Maserati MC12, Yezhrod's Nissan GT-R of 2010, and RSS's Adonis
 * D9 and Lanzo V12 for the Aston Martin DBR9 and the Lamborghini Murcielago.
 * The Corvette C6.R and the Ford GT are not. The weekend is the qualifying
 * race and the championship race, each an hour, the second from the first's
 * result, after a three-part qualifying. Six of ten rounds, in the order and
 * on the calendar as understood rather than checked: Abu Dhabi, Silverstone,
 * Spa, the Nurburgring, Portimao and Interlagos. Brno, Paul Ricard, Navarra
 * and San Luis are not in Assetto Corsa.
 *
 * Points are 25-18-15-12-10-8-6-4-2-1 in the championship race and 8-6-4-3-2-1
 * in the qualifying race. The field is invented, and is the FIA GT 2004
 * paddock.
 *
 * Source: https://en.wikipedia.org/wiki/2010_FIA_GT1_World_Championship
 */
export const FIA_GT1_2010: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'fia-gt1-2010',
  name: 'FIA GT1 World Championship 2010',
  description: 'GT1 cars\' only world championship on the MC12, Yezhrod\'s GT-R and RSS\'s GTs: a '
    + 'qualifying race and a championship race at six of its rounds.',
  teams: [
    team('sarthe', 'Écurie Sarthoise', 'FRA', TeamBudget.INDEPENDENT),
    team('brescia', 'Scuderia Bresciana', 'ITA', TeamBudget.INDEPENDENT),
    team('vlaanderen', 'Team Vlaanderen', 'BEL', TeamBudget.INDEPENDENT),
    team('rheintal', 'Rheintal Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('thames-valley', 'Thames Valley Racing', 'GBR', TeamBudget.PRIVATEER),
    team('lusitania', 'Lusitânia Racing', 'PRT', TeamBudget.PRIVATEER),
    team('oranje', 'Oranje GT', 'NLD', TeamBudget.PRIVATEER),
    team('steiermark', 'Steiermark Racing', 'AUT', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'gt1',
      name: 'GT1',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('sar-1', 'sarthe', 'Jean-Marc Tessier', 'FRA'),
        seat('sar-2', 'sarthe', 'Olivier Bourdonnais', 'FRA'),
        seat('sar-3', 'sarthe', 'Yves Lacoudre', 'FRA'),
        seat('bre-1', 'brescia', 'Fabio Lanzavecchia', 'ITA'),
        seat('bre-2', 'brescia', 'Marco Ottonelli', 'ITA'),
        seat('bre-3', 'brescia', 'Alessio Brambati', 'ITA'),
        seat('vla-1', 'vlaanderen', 'Wim Declercq', 'BEL'),
        seat('vla-2', 'vlaanderen', 'Pieter Vanoverbeke', 'BEL'),
        seat('rhe-1', 'rheintal', 'Uwe Kellersmann', 'DEU'),
        seat('rhe-2', 'rheintal', 'Bernd Haselhorst', 'DEU'),
        seat('rhe-3', 'rheintal', 'Dirk Kornmeier', 'DEU'),
        seat('tha-1', 'thames-valley', 'Simon Brackley', 'GBR'),
        seat('tha-2', 'thames-valley', 'Gareth Penhaligon', 'GBR'),
        seat('tha-3', 'thames-valley', 'Nigel Throckmorton', 'GBR'),
        seat('lus-1', 'lusitania', 'Nuno Carvalhal', 'PRT'),
        seat('lus-2', 'lusitania', 'Rui Bettencourt', 'PRT'),
        seat('ora-1', 'oranje', 'Bas Heemskerk', 'NLD'),
        seat('ora-2', 'oranje', 'Ruud Kalsbeek', 'NLD'),
        seat('ste-1', 'steiermark', 'Harald Pöltl', 'AUT'),
        seat('ste-2', 'steiermark', 'Gernot Strassegger', 'AUT'),
      ],
      eligibility: {
        kind: 'cars',
        cars: [
          'ks_maserati_mc12_gt1',
          'Yzd_Nissan_GTR_R35_GT1',
          'rss_gt_adonis_d9_v12',
          'rss_gt_lanzo_v12',
        ],
      },
    },
  ],
  weekendFormats: [
    {
      id: 'gt1-weekend',
      name: 'Qualifying race and championship race',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
        { id: 'q1', type: 'qualify', name: 'Q1', minutes: 20, day: 0 },
        { id: 'q2', type: 'qualify', name: 'Q2', minutes: 15, day: 0, inherit: { from: 'q1', top: 16 } },
        { id: 'q3', type: 'qualify', name: 'Q3', minutes: 10, day: 0, inherit: { from: 'q2', top: 8 } },
        {
          id: 'qualifying-race',
          type: 'race',
          name: 'Qualifying race',
          distance: 165,
          day: 1,
          inherit: { from: 'q3' },
          pointsSystem: 'qualifying-race',
        },
        {
          type: 'race',
          name: 'Championship race',
          distance: 165,
          day: 2,
          inherit: { from: 'qualifying-race' },
        },
      ],
    },
  ],
  defaultWeekendFormat: 'gt1-weekend',
  rounds: [
    {
      id: 'abu-dhabi',
      name: 'Abu Dhabi',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: { id: 'ks_silverstone', layout: 'gp' },
      climate: Climate.OCEANIC,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: { id: 'ks_nurburgring', layout: 'layout_gp_b' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'portimao',
      name: 'Portimao',
      track: { id: 'algarve_portimao_2023', layout: 'lfm_nodrs' },
      climate: Climate.MEDITERRANEAN,
    },
    {
      id: 'interlagos',
      name: 'Interlagos',
      track: { id: 'vhe_interlagos', layout: 'gp' },
      climate: Climate.TEMPERATE,
      hemisphere: Hemisphere.SOUTH,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Championship race', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
    { id: 'qualifying-race', name: 'Qualifying race', positions: [8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 2, aggression: 10 },
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
