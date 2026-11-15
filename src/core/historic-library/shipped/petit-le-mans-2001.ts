import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Petit Le Mans 2001, as a historic event of its own.
 */
export const PETIT_LE_MANS_2001: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'petit-le-mans-2001',
  name: 'Petit Le Mans 2001',
  description: {
    en: 'Ten hours at Road Atlanta, the Audi R8s against the Corvettes and Porsches of the GT classes.',
    uk: 'Десять годин у Роуд-Атланті: Audi R8 проти Corvette та Porsche з класів GT.',
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
    team('everglades', 'Everglades Racing', 'USA', TeamBudget.WORKS),
    team('bayshore', 'Bayshore Prototypes', 'USA', TeamBudget.INDEPENDENT),
    team('sierra-madre', 'Sierra Madre Racing', 'USA', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'lmp900',
      name: 'LMP900',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 1,
      },
      seats: [
        seat('lmp-eve-1', 'everglades', 'Clay Merriwether', 'USA'),
        seat('lmp-eve-2', 'everglades', 'Grant Pellew', 'USA'),
        seat('lmp-bay-1', 'bayshore', 'Scott Dunleavy', 'USA'),
        seat('lmp-bay-2', 'bayshore', 'Reid Wexler', 'USA'),
        seat('lmp-sie-1', 'sierra-madre', 'Nate Burkhalter', 'USA'),
        seat('lmp-sie-b-1', 'sierra-madre', 'Victor Arana', 'MEX'),
      ],
      eligibility: {
        kind: 'cars',
        cars: ['rss_lmp_ferruccio_33_v12'],
      },
    },
    {
      id: 'gts',
      name: 'GTS',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 2,
      },
      seats: [
        seat('gts-sar-1', 'sarthe', 'Jean-Marc Tessier', 'FRA'),
        seat('gts-sar-2', 'sarthe', 'Olivier Bourdonnais', 'FRA'),
        seat('gts-bre-1', 'brescia', 'Fabio Lanzavecchia', 'ITA'),
        seat('gts-bre-2', 'brescia', 'Marco Ottonelli', 'ITA'),
        seat('gts-vla-1', 'vlaanderen', 'Wim Declercq', 'BEL'),
        seat('gts-vla-2', 'vlaanderen', 'Pieter Vanoverbeke', 'BEL'),
        seat('gts-rhe-1', 'rheintal', 'Uwe Kellersmann', 'DEU'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.GT1_2000S,
      },
      entryFee: 3000,
      prizes: {
        positions: [30000, 21000, 15000, 11400, 8700, 6600, 4800, 3600, 2400, 1500],
      },
    },
    {
      id: 'gt',
      name: 'GT',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 3,
      },
      seats: [
        seat('gt-tha-1', 'thames-valley', 'Simon Brackley', 'GBR'),
        seat('gt-tha-2', 'thames-valley', 'Gareth Penhaligon', 'GBR'),
        seat('gt-lus-1', 'lusitania', 'Nuno Carvalhal', 'PRT'),
        seat('gt-lus-2', 'lusitania', 'Rui Bettencourt', 'PRT'),
        seat('gt-ora-1', 'oranje', 'Bas Heemskerk', 'NLD'),
        seat('gt-ora-2', 'oranje', 'Ruud Kalsbeek', 'NLD'),
        seat('gt-ste-1', 'steiermark', 'Harald Pöltl', 'AUT'),
        seat('gt-ste-2', 'steiermark', 'Gernot Strassegger', 'AUT'),
        seat('gt-rhe-1', 'rheintal', 'Dirk Kornmeier', 'DEU'),
        seat('gt-rhe-2', 'rheintal', 'Holger Stapelfeld', 'DEU'),
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
      entryFee: 1800,
      prizes: {
        positions: [18000, 12600, 9000, 6850, 5200, 3950, 2900, 2150, 1450, 900],
      },
    },
  ],
  eventFormats: [
    {
      id: 'ten-hours',
      name: 'Ten hours',
      sessions: [
        {
          type: 'practice',
          name: 'Free practice',
          minutes: 120,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Qualifying',
          minutes: 30,
          day: 1,
        },
        {
          id: 'race',
          type: 'race',
          name: 'Petit Le Mans',
          laps: 394,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'ten-hours',
  rounds: [
    {
      id: 'event',
      name: 'Petit Le Mans 2001',
      track: recommendedTrack('road-atlanta/gp'),
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    {
      id: 'none',
      name: 'No points',
      positions: [],
    },
  ],
  defaultPointsSystem: 'none',
  grid: {
    aggression: 5,
  },
  generatedWeather: {
    climate: Climate.TEMPERATE,
  },
  regulations: {
    assists: {
      tyreWear: 1,
      fuelRate: 1,
      tyreBlankets: false,
    },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5000,
  prizes: {
    positions: [50000, 35000, 25000, 19000, 14500, 11000, 8000, 6000, 4000, 2500],
  },
};
