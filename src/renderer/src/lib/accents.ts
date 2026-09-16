// The colour a chip wears when what it says is one of a closed set. Class
// strings rather than tokens, so a caller writes `className={...}` over a
// Badge and tailwind-merge drops the variant's own background for it - and
// anything the map does not cover falls through to that variant untouched.
//
// Shared rather than kept beside one screen, for the reason the measurements
// in `layout.ts` are: each of these is read on more than one screen already,
// and a podium that is gold on the points card and grey on a results table
// would be saying something it does not mean. A set only one screen shows stays
// beside that screen - a team's budget is in the editor's own constants.

import type {
  ClassificationOrigin, Climate, Discipline, SessionType,
} from '../../../shared/types';

/**
 * The colour each kind of session is chipped in.
 *
 * A record over the type rather than a lookup by string, so adding a session
 * type fails to compile until it has been given a colour - the same trap the
 * nav icons and the discipline labels set.
 */
export const SESSION_ACCENT = {
  practice: 'border-transparent bg-session-practice text-session-practice-foreground',
  qualify: 'border-transparent bg-session-qualify text-session-qualify-foreground',
  race: 'border-transparent bg-session-race text-session-race-foreground',
  hotlap: 'border-transparent bg-session-other text-session-other-foreground',
  timeAttack: 'border-transparent bg-session-other text-session-other-foreground',
  drift: 'border-transparent bg-session-other text-session-other-foreground',
  drag: 'border-transparent bg-session-other text-session-other-foreground',
} as const satisfies Record<SessionType, string>;

/**
 * The colour each podium place is chipped in, first place first.
 *
 * Deliberately only three long and deliberately indexed rather than looked up:
 * a position past the podium reads `undefined` and keeps whatever variant the
 * caller asked for, which is exactly what fourth place should look like - so
 * give the rest of the list an unfilled variant, or silver is indistinguishable
 * from the plain chip beside it.
 */
export const PODIUM_ACCENT: readonly string[] = [
  'border-transparent bg-podium-gold text-podium-gold-foreground',
  'border-transparent bg-podium-silver text-podium-silver-foreground',
  'border-transparent bg-podium-bronze text-podium-bronze-foreground',
];

/**
 * The colour each discipline is chipped in.
 *
 * A record over the enum rather than a lookup by string, so adding a discipline
 * fails to compile until it has been given a colour - the same trap the
 * discipline labels and the nav icons set.
 *
 * All four carry a hue, `road` included: it is a rung of the ladder with its
 * own driver level and its own championships, not the bucket the other three
 * leave over. Only a set with no name of its own stays grey.
 */
export const DISCIPLINE_ACCENT = {
  'single-seater': 'border-transparent bg-discipline-single-seater text-discipline-single-seater-foreground',
  sportscar: 'border-transparent bg-discipline-sportscar text-discipline-sportscar-foreground',
  touring: 'border-transparent bg-discipline-touring text-discipline-touring-foreground',
  road: 'border-transparent bg-discipline-road text-discipline-road-foreground',
} as const satisfies Record<Discipline, string>;

/**
 * The colour a thing the user had a hand in is chipped in, by whose it is.
 *
 * A hue of its own per origin, so "you changed the app's own" and "this was
 * never ours" are told apart where both appear. Read by a championship's origin
 * and by a car's classification, which answer the same question about different
 * things - so a spec the user restated is the same Modified colour as a
 * championship they adjusted. Shipped carries nothing and keeps whatever
 * variant the caller asked for.
 *
 * Keyed on the origin rather than on the word shown: `adjusted` reads as
 * "Modified" and `user` as "Custom", which are translations rather than renames.
 */
export const ORIGIN_ACCENT = {
  adjusted: 'border-transparent bg-origin-modified text-origin-modified-foreground',
  user: 'border-transparent bg-origin-custom text-origin-custom-foreground',
  shipped: '',
} as const satisfies Record<ClassificationOrigin, string>;

/**
 * The material each climate is chipped in, driest first.
 *
 * Sand, olive, moss and slate: an order from desert to sea rather than four
 * categories, for the reason the tier metals are - see the note beside the
 * tokens. Read by the calendar, the Enter round dialog and the editor.
 */
export const CLIMATE_ACCENT = {
  arid: 'border-transparent bg-climate-arid text-climate-arid-foreground',
  mediterranean: 'border-transparent bg-climate-mediterranean text-climate-mediterranean-foreground',
  temperate: 'border-transparent bg-climate-temperate text-climate-temperate-foreground',
  oceanic: 'border-transparent bg-climate-oceanic text-climate-oceanic-foreground',
} as const satisfies Record<Climate, string>;

/**
 * The metal each rung of a discipline is chipped in, the top rung first.
 *
 * Platinum, gold, silver, bronze, then steel for every rung below the fourth -
 * so the ramp ends rather than fading into the card, and a championship five
 * tiers down still says so. Read through `tierAccent`, which does the clamping,
 * because a tier is 1-based and has no fixed maximum.
 */
export const TIER_ACCENT: readonly string[] = [
  'border-transparent bg-tier-platinum text-tier-platinum-foreground',
  'border-transparent bg-tier-gold text-tier-gold-foreground',
  'border-transparent bg-tier-silver text-tier-silver-foreground',
  'border-transparent bg-tier-bronze text-tier-bronze-foreground',
  'border-transparent bg-tier-steel text-tier-steel-foreground',
];
