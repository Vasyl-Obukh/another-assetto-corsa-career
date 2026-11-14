import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * Hungarian Grand Prix 1986, as a historic event of its own.
 */
export const HUNGARIAN_GP_1986: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'hungarian-gp-1986',
  name: 'Hungarian Grand Prix 1986',
  description: {
    en: 'Formula 1\'s first race behind the Iron Curtain, and Piquet\'s pass round the outside of Senna.',
    uk: 'Перша гонка Формули-1 за залізною завісою і обгін Піке по зовнішній траєкторії навколо Сенни.',
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
      ladder: {
        discipline: Discipline.SINGLE_SEATER,
        tier: 1,
      },
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
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1986,
      },
    },
  ],
  eventFormats: [
    {
      id: 'grand-prix',
      name: 'Grand Prix',
      sessions: [
        {
          type: 'practice',
          name: 'Free practice',
          minutes: 90,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Qualifying',
          minutes: 60,
          day: 1,
        },
        {
          id: 'grand-prix',
          type: 'race',
          name: 'Grand Prix',
          distance: 305,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'Hungarian Grand Prix 1986',
      track: {
        id: 'rt_hungaroring',
      },
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
    strength: 4,
    aggression: 5,
  },
  generatedWeather: {
    climate: Climate.MEDITERRANEAN,
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
  entryFee: 7000,
  prizes: {
    positions: [70000, 45000, 30000, 21000, 15000, 11000],
  },
};
