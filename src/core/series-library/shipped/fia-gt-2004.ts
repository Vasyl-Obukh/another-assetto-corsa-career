import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship, EventFormat } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * An FIA GT event of 2004: practice and an hour of qualifying on Saturday,
 * and a 500 km race on Sunday.
 */
const EVENT: EventFormat = {
  id: 'five-hundred',
  name: '500 km',
  sessions: [
    { type: 'practice', name: 'Free practice', minutes: 60, day: 0 },
    { type: 'qualify', name: 'Qualifying', minutes: 60, day: 0 },
    { id: 'race', type: 'race', classGrid: 'mixed', name: '500 km', distance: 500, day: 1 },
  ],
};

/**
 * FIA GT Championship, 2004 - the Ferrari 550 and 575, the Saleen S7 and the
 * Lamborghini Murcielago in GT, and the Porsche 911 GT3 and Ferrari 360 in
 * N-GT.
 *
 * RSS's GT cars are that era's GT1s, and the base game's Maserati MC12 GT1
 * joins them, as the real one did at the season's last round; RSS's GT-N cars
 * are the N-GT class. Five of eleven rounds: Monza, Valencia, Magny-Cours and
 * Imola at 500 km, and the Spa 24 Hours. Hockenheim, Brno, Donington,
 * Oschersleben, Dubai and Zhuhai are not in Assetto Corsa; Valencia and Magny-
 * Cours run later versions of their circuits over the same distance.
 *
 * Points are 10-8-6-5-4-3-2-1 in each class. The Spa 24 Hours paid points at
 * six and twelve hours as well as at the finish, which a points system cannot
 * say yet. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2004_FIA_GT_Championship
 */
export const FIA_GT_2004: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'fia-gt-2004',
  name: 'FIA GT Championship 2004',
  description: {
    en: 'The FIA GT Championship of 2004, on RSS\'s GT and GT-N cars and the MC12: 500 km races at'
      + ' Monza, Valencia, Magny-Cours and Imola, and the Spa 24 Hours.',
    uk: 'FIA GT Championship 2004 року на машинах GT і GT-N від RSS та MC12: гонки на 500 км '
      + 'у Монці, Валенсії, Маньї-Курі та Імолі, а також 24 години Спа.',
  },
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
      id: 'gt',
      name: 'GT',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 2 },
      seats: [
        seat('gt-sar-1', 'sarthe', 'Jean-Marc Tessier', 'FRA'),
        seat('gt-sar-2', 'sarthe', 'Olivier Bourdonnais', 'FRA'),
        seat('gt-bre-1', 'brescia', 'Fabio Lanzavecchia', 'ITA'),
        seat('gt-bre-2', 'brescia', 'Marco Ottonelli', 'ITA'),
        seat('gt-vla-1', 'vlaanderen', 'Wim Declercq', 'BEL'),
        seat('gt-vla-2', 'vlaanderen', 'Pieter Vanoverbeke', 'BEL'),
        seat('gt-rhe-1', 'rheintal', 'Uwe Kellersmann', 'DEU'),
        seat('gt-rhe-2', 'rheintal', 'Bernd Haselhorst', 'DEU'),
        seat('gt-tha-1', 'thames-valley', 'Simon Brackley', 'GBR'),
        seat('gt-tha-2', 'thames-valley', 'Gareth Penhaligon', 'GBR'),
        seat('gt-lus-1', 'lusitania', 'Nuno Carvalhal', 'PRT'),
        seat('gt-lus-2', 'lusitania', 'Rui Bettencourt', 'PRT'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT1_2000S },
    },
    {
      id: 'n-gt',
      name: 'N-GT',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('ngt-ora-1', 'oranje', 'Bas Heemskerk', 'NLD'),
        seat('ngt-ora-2', 'oranje', 'Ruud Kalsbeek', 'NLD'),
        seat('ngt-ste-1', 'steiermark', 'Harald Pöltl', 'AUT'),
        seat('ngt-ste-2', 'steiermark', 'Gernot Strassegger', 'AUT'),
        seat('ngt-sar-1', 'sarthe', 'Yves Lacoudre', 'FRA'),
        seat('ngt-sar-2', 'sarthe', 'Thibault Ronsard', 'FRA'),
        seat('ngt-bre-1', 'brescia', 'Alessio Brambati', 'ITA'),
        seat('ngt-bre-2', 'brescia', 'Giorgio Venturelli', 'ITA'),
        seat('ngt-rhe-1', 'rheintal', 'Dirk Kornmeier', 'DEU'),
        seat('ngt-rhe-2', 'rheintal', 'Holger Stapelfeld', 'DEU'),
        seat('ngt-tha-1', 'thames-valley', 'Nigel Throckmorton', 'GBR'),
        seat('ngt-tha-2', 'thames-valley', 'Stuart Mallinder', 'GBR'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.N_GT },
      grid: { strength: -3 },
      entryFee: 7200,
      prizes: {
        positions: [27000, 18900, 13500, 10250, 7850, 5950, 4300, 3250, 2150, 1350],
        standings: [216000, 135000, 86500, 56500, 35000],
      },
    },
  ],
  eventFormats: [
    EVENT,
    {
      id: 'spa-24',
      name: 'Twenty-four hours',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 120, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 60, day: 1 },
        { id: 'race', type: 'race', classGrid: 'mixed', name: '24 Hours', laps: 558, day: 2 },
      ],
    },
  ],
  defaultEventFormat: 'five-hundred',
  rounds: [
    { id: 'monza', name: 'Monza 500 km', track: { id: 'monza' } },
    { id: 'valencia', name: 'Valencia 500 km', track: { id: 'fn_valencia', layout: 'gp' } },
    {
      id: 'magny-cours',
      name: 'Magny-Cours 500 km',
      track: { id: 'magnycours22' },
      climate: Climate.TEMPERATE,
    },
    {
      id: 'spa',
      name: 'Spa 24 Hours',
      track: { id: 'spa' },
      eventFormat: 'spa-24',
      climate: Climate.OCEANIC,
    },
    { id: 'imola', name: 'Imola 500 km', track: { id: 'imola' } },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [10, 8, 6, 5, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 1, aggression: 5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 12000,
  prizes: {
    positions: [45000, 31500, 22500, 17100, 13050, 9900, 7200, 5400, 3600, 2250],
    standings: [360000, 225000, 144000, 94500, 58500],
  },
};
