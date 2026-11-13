import { seat, team } from './utils.ts';
import { Climate, Discipline, TeamBudget } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * XX Programme Invitational - invented, for the track-only specials that race
 * nobody.
 *
 * The Ferrari 599XX Evo and the Tripl3 Pack's FXX K are cars of Ferrari's XX
 * Programme, and Ready to Race's McLaren P1 GTR is McLaren's answer to it:
 * track-day machines their makers built for owners' private sessions, which
 * are not races. This races them against each other, balanced on the install's
 * figures, at circuits the programmes visit. Invented, and the description
 * says so. The FXX K ships no weight figure, so it is held back by a
 * restrictor alone.
 */
export const XX_PROGRAMME: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'xx-programme',
  name: 'XX Programme Invitational',
  description: {
    en: 'Invented: the track-only specials of Ferrari\'s XX Programme and McLaren\'s P1 GTR, raced '
      + 'against each other, by invitation.',
    uk: 'Вигаданий: суто трекові спецверсії з програми XX від Ferrari і McLaren P1 GTR одна проти одної, '
      + 'лише за запрошенням.',
  },
  teams: [
    team('xx-maranello', 'Corse Clienti Privati', 'ITA', TeamBudget.WORKS),
    team('xx-woking', 'Surrey Track Collection', 'GBR', TeamBudget.WORKS),
    team('xx-dubai', 'Emirates Track Club', 'ARE', TeamBudget.INDEPENDENT),
    team('xx-geneva', 'Collection Genevoise', 'CHE', TeamBudget.INDEPENDENT),
  ],
  entries: [
    {
      id: 'xx',
      name: 'XX',
      ladder: { discipline: Discipline.ROAD, tier: 1 },
      seats: [
        seat('mar-1', 'xx-maranello', 'Federico Castiglioni', 'ITA'),
        seat('mar-2', 'xx-maranello', 'Alessandra Moretti-Venn', 'ITA'),
        seat('mar-3', 'xx-maranello', 'Lorenzo Zampieri', 'ITA'),
        seat('sur-1', 'xx-woking', 'Rupert Kingsbury', 'GBR'),
        seat('sur-2', 'xx-woking', 'Nathaniel Ormerod', 'GBR'),
        seat('sur-3', 'xx-woking', 'Imogen Tresilian', 'GBR'),
        seat('emi-1', 'xx-dubai', 'Khalid Al Nuaimi', 'ARE'),
        seat('emi-2', 'xx-dubai', 'Saeed Al Marri', 'ARE'),
        seat('gen-1', 'xx-geneva', 'Laurent Favre-Bulle', 'CHE'),
        seat('gen-2', 'xx-geneva', 'Céline Dufaux', 'CHE'),
      ],
      eligibility: { kind: 'cars', cars: ['ferrari_599xxevo', 'ks_ferrari_fxx_k', 'ks_mclaren_p1_gtr'] },
      // Both newer cars are brought back to the 599XX Evo.
      bop: [
        { car: 'ks_mclaren_p1_gtr', restrictor: 18 },
        { car: 'ks_ferrari_fxx_k', restrictor: 25 },
      ],
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Invitational',
      sessions: [
        { type: 'practice', name: 'Practice', minutes: 30, day: 0 },
        { type: 'qualify', name: 'Qualifying', minutes: 20, day: 0 },
        { type: 'race', name: 'Race', distance: 90, day: 1 },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    { id: 'mugello', name: 'Mugello', track: { id: 'mugello' } },
    { id: 'monza', name: 'Monza', track: { id: 'monza' } },
    { id: 'spa', name: 'Spa-Francorchamps', track: { id: 'spa' }, climate: Climate.OCEANIC },
    { id: 'barcelona', name: 'Barcelona', track: { id: 'ks_barcelona', layout: 'layout_gp' } },
    {
      id: 'yas-marina',
      name: 'Yas Marina',
      track: { id: 'yas_marina_2021', layout: 'gp' },
      climate: Climate.ARID,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Race points', positions: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { strength: 5 },
  generatedWeather: { climate: Climate.MEDITERRANEAN },
  regulations: {
    assists: { damage: 100, tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 25000,
  prizes: {
    positions: [90000, 63000, 45000, 34200, 26100, 19800, 14400, 10800, 7200, 4500],
    standings: [720000, 450000, 288000, 189000, 117000],
  },
};
