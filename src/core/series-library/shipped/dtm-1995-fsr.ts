import { seat, team } from './utils.ts';
import {
  CarSpec, Climate, Discipline, TeamBudget,
} from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';
import { recommendedTrack } from '../../../shared/utils/recommended-tracks/index.ts';
import { SERIES_FORMAT_VERSION } from '../../series/index.ts';

/**
 * DTM, 1995 - the last German season of Class 1, on First Studio Race's cars.
 *
 * The DTM 1995 (FSR) spec is the Mercedes C-Class and the Alfa Romeo 155 V6
 * TI, the two makes that won races that year; the Opel Calibra V6 4x4 that
 * raced with them has no FSR car, so the field is two makes. Only the German
 * DTM rounds score - the ITC rounds of the same season kept their own standings
 * - and of those, AVUS, Diepholz and the Alemannenring are not in Assetto
 * Corsa, which leaves Hockenheim twice, the Norisring and the Nurburgring, in
 * the real order. Hockenheim and the Nurburgring are raced on today's layouts,
 * not the long Hockenheim and the pre-2002 Nurburgring of the time.
 *
 * Two heats a meeting, each paying 20-15-12-10-8-6-4-3-2-1. Both heats line up
 * on qualifying and run DTM 1993's 65 km, neither of which was checked. The
 * field is invented.
 *
 * Source: https://en.wikipedia.org/wiki/1995_Deutsche_Tourenwagen_Meisterschaft
 */
export const DTM_1995_FSR: Championship = {
  version: SERIES_FORMAT_VERSION,
  id: 'dtm-1995-fsr',
  name: 'DTM 1995 (FSR)',
  description: {
    en: 'The last German Class 1 season on First Studio Race\'s Mercedes C-Class and Alfa Romeo 155 '
      + 'V6 TI, two heats a meeting at Hockenheim, the Norisring and the Nurburgring.',
    uk: 'Останній німецький сезон Class 1 на Mercedes C-Class і Alfa Romeo 155 V6 TI від First Studio '
      + 'Race, два заїзди на етапі в Гоккенгаймі, на Норісринзі та Нюрбургринзі.',
  },
  teams: [
    team('silberpfeil', 'Silberpfeil Tourenwagen', 'DEU', TeamBudget.WORKS),
    team('stuttgart', 'Team Neckartal', 'DEU', TeamBudget.WORKS),
    team('portello', 'Squadra Portello', 'ITA', TeamBudget.WORKS),
    team('arese', 'Arese Corse', 'ITA', TeamBudget.WORKS),
    team('eifel', 'Eifel Motorsport', 'DEU', TeamBudget.INDEPENDENT),
    team('lombardia', 'Scuderia Lombardia', 'ITA', TeamBudget.INDEPENDENT),
    team('alpen', 'Alpen Racing', 'AUT', TeamBudget.PRIVATEER),
    team('pfalz', 'Pfalz Tourenwagen', 'DEU', TeamBudget.PRIVATEER),
  ],
  entries: [
    {
      id: 'class-1',
      name: 'Class 1',
      ladder: { discipline: Discipline.TOURING, tier: 2 },
      seats: [
        seat('sil-1', 'silberpfeil', 'Volker Hambrecht', 'DEU'),
        seat('sil-2', 'silberpfeil', 'Bernhard Liesegang', 'DEU'),
        seat('stu-1', 'stuttgart', 'Klaus Esslinger', 'DEU'),
        seat('stu-2', 'stuttgart', 'Søren Ravnholt', 'DNK'),
        seat('por-1', 'portello', 'Fabrizio Montanari', 'ITA'),
        seat('por-2', 'portello', 'Stefano Zanardelli', 'ITA'),
        seat('are-1', 'arese', 'Gianni Bertolazzi', 'ITA'),
        seat('are-2', 'arese', 'Michael Brandauer', 'DEU'),
        seat('eif-1', 'eifel', 'Uwe Kesselbach', 'DEU'),
        seat('eif-2', 'eifel', 'Thomas Mayen', 'DEU'),
        seat('lom-1', 'lombardia', 'Paolo Cantoni', 'ITA'),
        seat('lom-2', 'lombardia', 'Riccardo Varesi', 'ITA'),
        seat('alp-1', 'alpen', 'Franz Hochreiter', 'AUT'),
        seat('alp-2', 'alpen', 'Markus Lienzer', 'AUT'),
        seat('pfa-1', 'pfalz', 'Dirk Landauer', 'DEU'),
        seat('pfa-2', 'pfalz', 'Jörg Edenkoben', 'DEU'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.DTM_1995_FSR },
    },
  ],
  eventFormats: [
    {
      id: 'standard',
      name: 'Race meeting',
      sessions: [
        { type: 'practice', name: 'Free practice', minutes: 30, day: 0 },
        { id: 'qualifying', type: 'qualify', name: 'Qualifying', minutes: 30, day: 0 },
        {
          type: 'race', name: 'Heat 1', distance: 65, day: 1, inherit: { from: 'qualifying' },
        },
        {
          type: 'race', name: 'Heat 2', distance: 65, day: 1, inherit: { from: 'qualifying' },
        },
      ],
    },
  ],
  defaultEventFormat: 'standard',
  rounds: [
    {
      id: 'hockenheim',
      name: 'Hockenheim',
      track: recommendedTrack('hockenheim/gp'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'norisring',
      name: 'Norisring',
      track: recommendedTrack('norisring/full'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'nurburgring',
      name: 'Nurburgring',
      track: recommendedTrack('nurburgring/gp-gt'),
      climate: Climate.TEMPERATE,
    },
    {
      id: 'hockenheim-final',
      name: 'Hockenheim',
      track: recommendedTrack('hockenheim/gp'),
      climate: Climate.TEMPERATE,
    },
  ],
  pointsSystems: [
    { id: 'race', name: 'Heat points', positions: [20, 15, 12, 10, 8, 6, 4, 3, 2, 1] },
  ],
  defaultPointsSystem: 'race',
  grid: { aggression: 20 },
  generatedWeather: { climate: Climate.TEMPERATE },
  regulations: {
    assists: { tyreWear: 1, fuelRate: 1, tyreBlankets: false },
    penalties: true,
    jumpStartPenalty: 10,
  },
  entryFee: 6000,
  prizes: {
    positions: [20000, 14000, 10000, 7500, 5500, 4000, 3000, 2200, 1500, 800],
    standings: [140000, 85000, 55000, 36000, 22000],
  },
};
