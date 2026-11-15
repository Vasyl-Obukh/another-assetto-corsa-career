import { FORMULA_ABARTH } from './formula-abarth.ts';
import { filler } from './utils.ts';

/**
 * Formula Abarth +, and ++ above it - filler for the two rungs the base game
 * leaves empty between Formula Abarth and BOSS GP Open.
 *
 * No real series stands on these rungs with a car the base game ships, so the
 * rung below is repeated with longer races and more money,
 * rather than a career having to jump three tiers at once. One setting hides
 * every filler championship.
 */
export const FORMULA_ABARTH_PLUS = filler(
  FORMULA_ABARTH,
  1,
  {
    en: 'Filler: Formula Abarth again, a rung up, with longer races and bigger prizes. It stands in '
      + 'for a tier no base-game series fills.',
    uk: 'Проміжний чемпіонат: знову Formula Abarth, рівнем вище, з довшими гонками й більшими призовими. '
      + 'Замінює рівень, який не заповнює жодна серія базової гри.',
  },
);

/**
 * Formula Abarth ++ - see FORMULA_ABARTH_PLUS.
 */
export const FORMULA_ABARTH_PLUS_PLUS = filler(
  FORMULA_ABARTH,
  2,
  {
    en: 'Filler: Formula Abarth two rungs up, with longer races and bigger prizes again. '
      + 'It stands in for a tier no base-game series fills.',
    uk: 'Проміжний чемпіонат: Formula Abarth на два рівні вище, з ще довшими гонками й ще більшими '
      + 'призовими. Замінює рівень, який не заповнює жодна серія базової гри.',
  },
);
