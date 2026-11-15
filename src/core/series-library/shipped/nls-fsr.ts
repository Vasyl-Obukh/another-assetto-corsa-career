import { NURBURGRING_LANGSTRECKEN_SERIE } from './nurburgring-langstrecken-serie.ts';
import { seat } from './utils.ts';
import { CarSpec, Discipline } from '../../../shared/types/index.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * Nurburgring Langstrecken-Serie - on First Studio Race's cars.
 *
 * The same season as NURBURGRING_LANGSTRECKEN_SERIE, its calendar and
 * formats, with FSR's cars wherever FSR builds the class. A copy rather than
 * more cars in the original, because FSR's cars never share a class with
 * another maker's and the original keeps racing without them. SP9 is the GT3
 * (FSR) spec; SP10, the GT4 class the original does not run, the GT4 (FSR)
 * spec; Cup 2 FSR's 992 GT3 Cup; TCR, another class the original leaves out,
 * the TCR (FSR) spec; the BMW M2 Cup FSR's M2 CS Racing, in place of the
 * original's M235i Racing. SP-X stays the base game's P4/5 Competizione and
 * Kunos' SCG 003. Cup 3 and SP3T have no FSR car and are left out.
 *
 * Six four-hour races on the endurance-cup layout, one of six hours, and the
 * Nurburgring 24 Hours on its own full layout - all Dream Pack 1's
 * Nordschleife. The layout's twenty-four boxes cap the grid. The points are
 * the common 25-18-15 scale, by class; the NLS table was not found. The field
 * is invented, the original's teams.
 *
 * Source: https://en.wikipedia.org/wiki/2024_N%C3%BCrburgring_Langstrecken-Serie
 */
export const NLS_FSR: Championship = {
  ...NURBURGRING_LANGSTRECKEN_SERIE,
  id: 'nls-fsr',
  name: 'Nurburgring Langstrecken-Serie (FSR)',
  description: {
    en: 'The Nordschleife\'s endurance series on First Studio Race\'s cars: six classes from GT3 to '
      + 'the BMW M2 Cup on one grid, six four-hour races, a six-hour round and the Nurburgring 24 Hours.',
    uk: 'Серія гонок на витривалість на Нордшляйфе на машинах First Studio Race: шість класів від GT3 до '
      + 'BMW M2 Cup на одній стартовій решітці, шість чотиригодинних гонок, шестигодинний етап і 24 години '
      + 'Нюрбургринга.',
  },
  entries: [
    {
      id: 'sp9',
      name: 'SP9',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('sp9-eif-1', 'eifel-gt', 'Sven Mertesacker', 'DEU'),
        seat('sp9-eif-2', 'eifel-gt', 'Jan Kowalewski', 'DEU'),
        seat('sp9-hoh-1', 'hohe-acht', 'Patrick Welzbacher', 'DEU'),
        seat('sp9-hoh-2', 'hohe-acht', 'Robin Assmann', 'DEU'),
        seat('sp9-bru-1', 'brunnchen', 'Tobias Leiendecker', 'DEU'),
        seat('sp9-vla-1', 'flemish-ring', 'Kobe Verstraeten', 'BEL'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT3_FSR },
    },
    {
      id: 'sp-x',
      name: 'SP-X',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 3 },
      seats: [
        seat('spx-eif-1', 'eifel-gt', 'Benno Rathmann', 'DEU'),
        seat('spx-hoh-1', 'hohe-acht', 'Christoph Linnartz', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['p4-5_2011', 'ks_glickenhaus_scg003'] },
    },
    {
      id: 'sp10',
      name: 'SP10',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('sp10-bru-1', 'brunnchen', 'Heiko Gehlen', 'DEU'),
        seat('sp10-bru-2', 'brunnchen', 'Ralf Bleckmann', 'DEU'),
        seat('sp10-grn-1', 'ring-nl', 'Wessel Ruijters', 'NLD'),
        seat('sp10-grn-2', 'ring-nl', 'Bart Hendriksen', 'NLD'),
        seat('sp10-ade-1', 'adenau', 'Anika Schroers', 'DEU'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.GT4_FSR },
      entryFee: 3000,
      prizes: {
        positions: [12000, 8400, 6000, 4550, 3500, 2650, 1900, 1450, 950, 600],
        standings: [96000, 60000, 38500, 25000, 15500],
      },
    },
    {
      id: 'cup-2',
      name: 'Cup 2',
      ladder: { discipline: Discipline.SPORTSCAR, tier: 4 },
      seats: [
        seat('cup2-pfl-1', 'pflanzgarten', 'Marcel Lüthje', 'DEU'),
        seat('cup2-pfl-2', 'pflanzgarten', 'Kevin Dreesen', 'DEU'),
        seat('cup2-kar-1', 'karussell', 'Dennis Olbrich', 'DEU'),
        seat('cup2-kar-2', 'karussell', 'Philipp Koenen', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_porsche_992_gt3_cup'] },
      entryFee: 3000,
      prizes: {
        positions: [12000, 8400, 6000, 4550, 3500, 2650, 1900, 1450, 950, 600],
        standings: [96000, 60000, 38500, 25000, 15500],
      },
    },
    {
      id: 'tcr',
      name: 'TCR',
      ladder: { discipline: Discipline.TOURING, tier: 4 },
      seats: [
        seat('tcr-pfl-1', 'pflanzgarten', 'Stijn Molenaar', 'NLD'),
        seat('tcr-vla-1', 'flemish-ring', 'Jens De Wulf', 'BEL'),
        seat('tcr-ade-1', 'adenau', 'Jens Bleidorn', 'DEU'),
      ],
      eligibility: { kind: 'spec', spec: CarSpec.TCR_FSR },
      entryFee: 3000,
      prizes: {
        positions: [12000, 8400, 6000, 4550, 3500, 2650, 1900, 1450, 950, 600],
        standings: [96000, 60000, 38500, 25000, 15500],
      },
    },
    {
      id: 'bmw-m2-cup',
      name: 'BMW M2 Cup',
      ladder: { discipline: Discipline.TOURING, tier: 5 },
      seats: [
        seat('bmw-kar-1', 'karussell', 'Lennart Dahmen', 'DEU'),
        seat('bmw-kar-2', 'karussell', 'Yannik Stöckl', 'DEU'),
        seat('bmw-ade-1', 'adenau', 'Rolf Heinen', 'DEU'),
        seat('bmw-ade-2', 'adenau', 'Tim Schwadorf', 'DEU'),
      ],
      eligibility: { kind: 'cars', cars: ['fsr_bmw_m2_cs_racing'] },
      entryFee: 1800,
      prizes: {
        positions: [7200, 5050, 3600, 2750, 2100, 1600, 1150, 850, 600, 350],
        standings: [57500, 36000, 23000, 15000, 9500],
      },
    },
  ],
};
