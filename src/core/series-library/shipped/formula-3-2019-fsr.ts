import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * FIA Formula 3, 2019 - the first season of the championship that merged GP3
 * and European Formula 3, on the Formula 2 support bill.
 *
 * The series raced the Dallara F3 2019; First Studio Race's Formula 3, which
 * shares its 380 bhp and 690 kg, stands in. All eight rounds, Mugello - raced
 * in 2020 - in place of Sochi, which is not in Assetto Corsa. Barcelona runs
 * its layout of the day, with the chicane. Two races a round: the first on
 * Saturday from qualifying, the second on Sunday from the first with its top
 * eight reversed. The real grid was thirty cars, three to a team; the Kunos
 * layouts' twenty-four boxes hold eight teams.
 *
 * The real races run forty and thirty minutes and a lap, which Assetto Corsa
 * cannot time offline, so they are 117 and 88 km, the distances those cover at
 * Formula 3 pace. Points are 25-18-15-12-10-8-6-4-2-1 in the first race, with
 * 4 for pole, and 15-12-10-8-6-4-2-1 in the second, with 2 for the fastest lap
 * in each. The real fastest-lap points went only to a driver in the top ten,
 * which cannot be stated. The field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/2019_FIA_Formula_3_Championship
 */
export const FORMULA_3_2019_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'formula-3-2019-fsr',
  name: 'FIA Formula 3 2019 (FSR)',
  description: {
    en: 'The first FIA Formula 3 season on First Studio Race\'s Formula 3: eight rounds of a race from '
      + 'qualifying and a second with the top eight reversed.',
    uk: 'Перший сезон FIA Formula 3 на Formula 3 від First Studio Race: вісім етапів із гонкою з '
      + 'кваліфікації та другою, де першу вісімку переставлено у зворотному порядку.',
  },
  teams: [
    team('valdarno', 'Valdarno Racing', 'ITA', TeamBudget.WORKS),
    team('ostende', 'Ostende Motorsport', 'BEL', TeamBudget.INDEPENDENT),
    team('camargue', 'Camargue Racing', 'FRA', TeamBudget.INDEPENDENT),
    team('fjordline', 'Fjordline Racing', 'NOR', TeamBudget.INDEPENDENT),
    team('lippe', 'Lippe Motorsport', 'DEU', TeamBudget.PRIVATEER),
    team('brabant', 'Brabant Racing', 'NLD', TeamBudget.PRIVATEER),
    team('aragon', 'Aragón Junior Team', 'ESP', TeamBudget.PRIVATEER),
    team('danube', 'Danube Racing', 'AUT', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'formula-3',
      name: 'Formula 3',
      ladder: { discipline: Discipline.SINGLE_SEATER, tier: 3 },
      seats: [
        seat('val-1', 'valdarno', 'Tommaso Benincasa', 'ITA'),
        seat('val-2', 'valdarno', 'Gabriel Moretz', 'BRA'),
        seat('val-3', 'valdarno', 'Edoardo Lanfranconi', 'ITA'),
        seat('ost-1', 'ostende', 'Maxime Vandenbroucke', 'BEL'),
        seat('ost-2', 'ostende', 'Rune Verhaegen', 'BEL'),
        seat('ost-3', 'ostende', 'Kaspar Tamm', 'EST'),
        seat('cam-1', 'camargue', 'Théo Ravanel', 'FRA'),
        seat('cam-2', 'camargue', 'Bastien Lauzier', 'FRA'),
        seat('cam-3', 'camargue', 'Joaquín Arrieta', 'ARG'),
        seat('fjo-1', 'fjordline', 'Sindre Haugland', 'NOR'),
        seat('fjo-2', 'fjordline', 'Eetu Rautanen', 'FIN'),
        seat('fjo-3', 'fjordline', 'Mads Kjærgaard', 'DNK'),
        seat('lip-1', 'lippe', 'Finn Oberschelp', 'DEU'),
        seat('lip-2', 'lippe', 'Lennart Brockhage', 'DEU'),
        seat('lip-3', 'lippe', 'Noah Gisler', 'CHE'),
        seat('bra-1', 'brabant', 'Jesse van Erkel', 'NLD'),
        seat('bra-2', 'brabant', 'Thijs Bosveld', 'NLD'),
        seat('bra-3', 'brabant', 'Oliver Haddington', 'GBR'),
        seat('ara-1', 'aragon', 'Iker Zabaleta', 'ESP'),
        seat('ara-2', 'aragon', 'Pau Bellmunt', 'ESP'),
        seat('ara-3', 'aragon', 'Mateo Larraguibel', 'MEX'),
        seat('dan-1', 'danube', 'Lukas Pichlmayr', 'AUT'),
        seat('dan-2', 'danube', 'Jakub Petrželka', 'CZE'),
        seat('dan-3', 'danube', 'Bartosz Kalinowski', 'POL'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_tatuus_f3_t318_2018'] },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Two races',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 45, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        {
          id: 'race-1',
          type: 'race',
          name: 'Race 1',
          distance: 117,
          day: 1,
          inherit: { from: 'qualifying' },
          pointsSystem: 'race-1',
        },
        {
          id: 'race-2',
          type: 'race',
          name: 'Race 2',
          distance: 88,
          day: 2,
          inherit: { from: 'race-1', reverse: 8 },
          pointsSystem: 'race-2',
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'barcelona', name: 'Barcelona', track: recommendedTrack('barcelona/gp-2007') },
    { id: 'paul-ricard', name: 'Paul Ricard', track: recommendedTrack('paul-ricard/gp') },
    {
      id: 'spielberg',
      name: 'Spielberg',
      track: recommendedTrack('red-bull-ring/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'silverstone',
      name: 'Silverstone',
      track: recommendedTrack('silverstone/gp'),
      climate: Climate.OCEANIC,
    },
    {
      id: 'budapest',
      name: 'Budapest',
      track: recommendedTrack('hungaroring/gp'),
      climate: Climate.TEMPERATE,
    },
    { id: 'spa', name: 'Spa-Francorchamps', track: recommendedTrack('spa/gp'), climate: Climate.OCEANIC },
    { id: 'monza', name: 'Monza', track: recommendedTrack('monza/gp') },
    { id: 'mugello', name: 'Mugello', track: recommendedTrack('mugello/gp') },
  ],
  pointsSystems: [
    {
      id: 'race-1',
      name: 'Race 1',
      positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
      fastestLap: 2,
      qualifying: [4],
    },
    { id: 'race-2', name: 'Race 2', positions: [15, 12, 10, 8, 6, 4, 2, 1], fastestLap: 2 },
  ],
  defaultPointsSystem: 'race-1',
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 5000,
  prizes: {
    positions: [25000, 17500, 12500, 9500, 7250, 5500, 4000, 3000, 2000, 1250],
    standings: [200000, 125000, 80000, 52500, 32500],
  },
};
