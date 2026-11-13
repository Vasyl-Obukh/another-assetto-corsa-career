import { CarSpec, Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';
import { seat, team } from '../../series-library/index.ts';

/**
 * German Grand Prix 1967, as a historic event of its own.
 */
export const GERMAN_GP_1967: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'german-gp-1967',
  name: 'German Grand Prix 1967',
  description: {
    en: 'Fourteen miles of the Nürburgring in cars with no downforce at all, fifteen times over.',
    uk: 'Чотирнадцять миль Нюрбургрингу на машинах зовсім без притискної сили - і так п\'ятнадцять разів.',
  },
  teams: [
    team('brabham', 'Brabham Racing Organisation', 'GBR', TeamBudget.WORKS),
    team('lotus', 'Team Lotus', 'GBR', TeamBudget.WORKS),
    team('ferrari', 'Scuderia Ferrari', 'ITA', TeamBudget.WORKS),
    team('brm', 'Owen Racing Organisation', 'GBR', TeamBudget.WORKS),
    team('cooper', 'Cooper Car Company', 'GBR', TeamBudget.WORKS),
    team('honda', 'Honda Racing', 'JPN', TeamBudget.WORKS),
    team('eagle', 'Anglo American Racers', 'USA', TeamBudget.INDEPENDENT),
    team('mclaren', 'Bruce McLaren Motor Racing', 'GBR', TeamBudget.INDEPENDENT),
    team('walker', 'Rob Walker Racing Team', 'GBR', TeamBudget.PRIVATEER),
    team('parnell', 'Reg Parnell Racing', 'GBR', TeamBudget.PRIVATEER),
    team('bonnier', 'Joakim Bonnier Racing Team', 'SWE', TeamBudget.PRIVATEER),
    team('ligier', 'Guy Ligier', 'FRA', TeamBudget.PRIVATEER),
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
        seat('brabham-hulme', 'brabham', 'Denny Hulme', 'NZL'),
        seat('brabham-brabham', 'brabham', 'Jack Brabham', 'AUS'),
        seat('lotus-clark', 'lotus', 'Jim Clark', 'GBR'),
        seat('honda-surtees', 'honda', 'John Surtees', 'GBR'),
        seat('ferrari-amon', 'ferrari', 'Chris Amon', 'NZL'),
        seat('cooper-rodriguez', 'cooper', 'Pedro Rodríguez', 'MEX'),
        seat('lotus-hill', 'lotus', 'Graham Hill', 'GBR'),
        seat('eagle-gurney', 'eagle', 'Dan Gurney', 'USA'),
        seat('brm-stewart', 'brm', 'Jackie Stewart', 'GBR'),
        seat('brm-spence', 'brm', 'Mike Spence', 'GBR'),
        seat('mclaren-mclaren', 'mclaren', 'Bruce McLaren', 'NZL'),
        seat('cooper-rindt', 'cooper', 'Jochen Rindt', 'AUT'),
        seat('walker-siffert', 'walker', 'Jo Siffert', 'CHE'),
        seat('ferrari-scarfiotti', 'ferrari', 'Ludovico Scarfiotti', 'ITA'),
        seat('ferrari-parkes', 'ferrari', 'Mike Parkes', 'GBR'),
        seat('bonnier-bonnier', 'bonnier', 'Jo Bonnier', 'SWE'),
        seat('parnell-irwin', 'parnell', 'Chris Irwin', 'GBR'),
        seat('ligier-ligier', 'ligier', 'Guy Ligier', 'FRA'),
      ],
      eligibility: {
        kind: 'spec',
        spec: CarSpec.FORMULA_1_1967,
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
          name: 'Friday practice',
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
          distance: 387,
          day: 2,
        },
      ],
    },
  ],
  defaultEventFormat: 'grand-prix',
  rounds: [
    {
      id: 'event',
      name: 'German Grand Prix 1967',
      track: {
        id: 'ks_nordschleife',
        layout: 'nordschleife',
      },
      sessionLengths: [
        {
          session: 'grand-prix',
          laps: 15,
        },
      ],
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
    aggression: -5,
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
  entryFee: 4500,
  prizes: {
    positions: [45000, 29000, 19000, 13500, 10000, 7000],
  },
};
