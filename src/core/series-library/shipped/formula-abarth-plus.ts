import { FORMULA_ABARTH } from './formula-abarth.ts';
import { filler } from './utils.ts';

/**
 * Formula Abarth +, and ++ above it - filler for the two rungs the base game
 * leaves empty between Formula Abarth and BOSS GP Open.
 *
 * No real series stands on these rungs with a car the base game ships, so the
 * rung below is repeated with longer races, a stronger field and more money,
 * rather than a career having to jump three tiers at once. One setting hides
 * every filler championship.
 */
export const FORMULA_ABARTH_PLUS = filler(
  FORMULA_ABARTH,
  1,
  'Filler: Formula Abarth again, a rung up, with longer races and a stronger field. It stands in '
    + 'for a tier no base-game series fills.',
);

/**
 * Formula Abarth ++ - see FORMULA_ABARTH_PLUS.
 */
export const FORMULA_ABARTH_PLUS_PLUS = filler(
  FORMULA_ABARTH,
  2,
  'Filler: Formula Abarth two rungs up, with longer races again and the strongest field it runs. '
    + 'It stands in for a tier no base-game series fills.',
);
