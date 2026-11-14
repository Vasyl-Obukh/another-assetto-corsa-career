import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * British Grand Prix 1954, as a historic event of its own.
 */
export const BRITISH_GP_1954: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'british-gp-1954',
  name: 'British Grand Prix 1954',
  description: {
    en: 'Silverstone in the year of the Mercedes W196, whose streamlined bodywork made the oil drums marking the corners hard to place.',
    uk: 'Сільверстоун у рік Mercedes W196, через обтічний кузов якого пілотам важко було бачити бочки, що '
      + 'позначали повороти.',
  },
  teams: [
    team('mercedes', 'Daimler-Benz AG', 'DEU', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('maserati', 'Officine Alfieri Maserati', 'ITA', TeamBudget.WORKS),
    team('gordini', 'Equipe Gordini', 'FRA', TeamBudget.INDEPENDENT),
    team('moss', 'A.E. Moss', 'GBR', TeamBudget.PRIVATEER),
    team('bira', 'Prince Bira', 'THA', TeamBudget.PRIVATEER),
    team('ecurie-schell', 'Harry Schell', 'USA', TeamBudget.PRIVATEER),
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
        seat('mer-fangio', 'mercedes', 'Juan Manuel Fangio', 'ARG'),
        seat('fer-gonzalez', 'ferrari', 'José Froilán González', 'ARG'),
        seat('fer-hawthorn', 'ferrari', 'Mike Hawthorn', 'GBR'),
        seat('fer-trintignant', 'ferrari', 'Maurice Trintignant', 'FRA'),
        seat('mer-kling', 'mercedes', 'Karl Kling', 'DEU'),
        seat('mer-herrmann', 'mercedes', 'Hans Herrmann', 'DEU'),
        seat('mos-moss', 'moss', 'Stirling Moss', 'GBR'),
        seat('fer-farina', 'ferrari', 'Giuseppe Farina', 'ITA'),
        seat('mas-marimon', 'maserati', 'Onofre Marimón', 'ARG'),
        seat('mas-mieres', 'maserati', 'Roberto Mieres', 'ARG'),
        seat('mas-villoresi', 'maserati', 'Luigi Villoresi', 'ITA'),
        seat('mas-mantovani', 'maserati', 'Sergio Mantovani', 'ITA'),
        seat('fer-maglioli', 'ferrari', 'Umberto Maglioli', 'ITA'),
        seat('mas-musso', 'maserati', 'Luigi Musso', 'ITA'),
        seat('gor-behra', 'gordini', 'Jean Behra', 'FRA'),
        seat('bir-bira', 'bira', 'Prince Bira', 'THA'),
        seat('sch-schell', 'ecurie-schell', 'Harry Schell', 'USA'),
        seat('gor-pilette', 'gordini', 'André Pilette', 'BEL'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1954,
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
          name: 'Practice',
          minutes: 120,
          day: 0,
        },
        {
          type: 'qualify',
          name: 'Timed practice',
          minutes: 120,
          day: 1,
        },
        {
          id: 'grand-prix',
          type: 'race',
          name: 'Grand Prix',
          distance: 503,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'British Grand Prix 1954',
      track: {
        id: 'ks_silverstone1967',
      },
      sessionLengths: [
        {
          session: 'grand-prix',
          laps: 90,
        },
      ],
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
    strength: 4,
    aggression: -5,
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
  entryFee: 3500,
  prizes: {
    positions: [35000, 22000, 15000, 10000, 7000],
  },
};
