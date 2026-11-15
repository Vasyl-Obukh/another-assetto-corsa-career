import { GINETTA_GT4_SUPERCUP } from './ginetta-gt4-supercup.ts';
import { reclassed } from './utils.ts';
import type { Championship } from '../../../shared/types/index.ts';

/**
 * Ginetta GT4 Supercup - Ginetta's one-make series on the BTCC support bill,
 * on First Studio Race's G55 GT4.
 *
 * The same series as GINETTA_GT4_SUPERCUP, its calendar, format and field, on
 * FSR's G55 GT4 instead of Guerilla's. A copy rather than another car in the
 * original, because FSR's cars never share a class with another maker's and
 * the original keeps racing without them. Three races a meeting. The calendar
 * is the circuits of the BTCC events it supports - Brands Hatch in both
 * layouts, Thruxton, Oulton Park, Croft, Knockhill, Silverstone, Donington
 * Park and Snetterton - rather than one season's, which was not checked. The
 * first race lines up on qualifying and the second on the first's result; the
 * third reverses the second's top six, a stand-in for the series' own rule,
 * which was not checked, as were its 20-minute races and its points - the
 * 25-18-15 scale stands in. The field is invented, the original's.
 *
 * Source: https://en.wikipedia.org/wiki/Ginetta_GT4_Supercup
 */
export const GINETTA_GT4_SUPERCUP_FSR: Championship = {
  ...GINETTA_GT4_SUPERCUP,
  id: 'ginetta-gt4-supercup-fsr',
  name: 'Ginetta GT4 Supercup (FSR)',
  description: {
    en: 'Ginetta\'s one-make series on the BTCC support bill, on First Studio Race\'s G55 GT4: three '
      + 'races a meeting at British circuits.',
    uk: 'Монокубок Ginetta в програмі підтримки BTCC на G55 GT4 від First Studio Race: три гонки за етап '
      + 'на британських трасах.',
  },
  entries: reclassed(GINETTA_GT4_SUPERCUP, { kind: 'cars', cars: ['ginetta_g55_gt4'] }),
};
