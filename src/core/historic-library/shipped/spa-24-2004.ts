import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Spa 24 Hours 2004, as a historic event of its own.
 */
export const SPA_24_2004: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'spa-24-2004',
  name: 'Spa 24 Hours 2004',
  description: 'Twenty-four hours of GT and N-GT at Spa, through the night and the rain.',
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
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 2,
      },
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
      eligibility: {
        kind: 'spec',
        spec: CarSpec.GT1_2000S,
        minModels: 2,
      },
    },
    {
      id: 'n-gt',
      name: 'N-GT',
      ladder: {
        discipline: Discipline.SPORTSCAR,
        tier: 3,
      },
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
      eligibility: {
        kind: 'spec',
        spec: CarSpec.N_GT,
        minModels: 2,
      },
      grid: {
        strength: -3,
      },
      prizes: {
        positions: [27000, 18900, 13500, 10250, 7850, 5950, 4300, 3250, 2150, 1350],
      },
    },
  ],
  eventFormats: [
    {
      id: 'spa-24',
      name: 'Twenty-four hours',
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
          minutes: 60,
          day: 1,
        },
        {
          id: 'race',
          type: 'race',
          name: '24 Hours',
          laps: 558,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'spa-24',
  rounds: [
    {
      id: 'event',
      name: 'Spa 24 Hours 2004',
      track: {
        id: 'spa',
      },
      climate: Climate.OCEANIC,
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
    strength: 1,
    aggression: 5,
  },
  generatedWeather: {
    climate: Climate.MEDITERRANEAN,
  },
  regulations: {
    assists: {
      damage: 100,
      tyreWear: 1,
      fuelRate: 1,
      tyreBlankets: false,
    },
    penalties: true,
    jumpStartPenalty: 10,
  },
  prizes: {
    positions: [45000, 31500, 22500, 17100, 13050, 9900, 7200, 5400, 3600, 2250],
  },
};
