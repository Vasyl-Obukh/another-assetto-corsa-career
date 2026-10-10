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
  ClassificationOrigin, Climate, Discipline, EventStatus, SessionType, TeamBudget,
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
 * The colour a finish wears when it scored but missed the podium. Everything
 * below the points stays plain, so a results grid reads as metals, then green,
 * then nothing.
 */
export const POINTS_ACCENT = 'border-transparent bg-result-points text-result-points-foreground';

/**
 * The colour a finish wears: its podium metal, or green for any other that
 * scored.
 * @param position Where it finished, counting from one
 * @param scored Whether it scored
 * @returns Its classes, or undefined for a finish that stays plain
 */
export const resultAccent = (position: number, scored: boolean): string | undefined => (
  PODIUM_ACCENT[position - 1] ?? (scored ? POINTS_ACCENT : undefined)
);

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
 * The dot a discipline wears in a filter list, in its chip's own foreground -
 * the pale fill is too faint at dot size.
 */
export const DISCIPLINE_DOT = {
  'single-seater': 'bg-discipline-single-seater-foreground',
  sportscar: 'bg-discipline-sportscar-foreground',
  touring: 'bg-discipline-touring-foreground',
  road: 'bg-discipline-road-foreground',
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

/**
 * The colour each state of a career calendar's event is chipped in.
 *
 * Only two of the three carry one. A raced round is `success`, which already
 * means done, and a missed one has a token of its own - see the note beside it
 * in globals.css for why a non-start is neither destructive nor grey. A round
 * still to come is deliberately empty: most of the calendar is scheduled, so a
 * colour on it would be decoration rather than information, and the caller's
 * own variant shows through.
 *
 * Read by the calendar's agenda and by a championship's round rows, which show
 * the same three states once a career has dated them.
 */
export const EVENT_ACCENT = {
  scheduled: '',
  raced: 'border-transparent bg-success text-success-foreground',
  missed: 'border-transparent bg-event-missed text-event-missed-foreground',
} as const satisfies Record<EventStatus, string>;

/**
 * Amber, for something that stops the player without anything being broken: a
 * event that clashes with another they entered, or a class above their level
 * when they try to enter it. A traffic light rather than a category, so the two
 * share it.
 *
 * Read by the calendar's event cards and the round page's enter panel.
 */
export const CAUTION_ACCENT = 'border-transparent bg-warning text-warning-foreground';

/**
 * The colour each budget is chipped in.
 *
 * A hue each, with chroma stepping down from works to privateer. It was one
 * hue at three depths once, and the three were indistinguishable at chip size.
 * Read by the editor's team rows and a championship's entry list.
 */
export const TEAM_BUDGET_ACCENT = {
  works: 'border-transparent bg-budget-works text-budget-works-foreground',
  independent: 'border-transparent bg-budget-independent text-budget-independent-foreground',
  privateer: 'border-transparent bg-budget-privateer text-budget-privateer-foreground',
} as const satisfies Record<TeamBudget, string>;

/**
 * The colour each class of a race wears, by its place among the race's
 * classes: a chip's tint, and the solid colour its stripe and dot are drawn in.
 *
 * Read by a race event's classes and every multi-class result list, which is
 * what makes a GT4 the same colour on the setup and on the classification.
 * Cycles past the fourth with `classAccent`.
 */
export const RACE_CLASS_ACCENT: readonly { chip: string; mark: string }[] = [
  { chip: 'border-transparent bg-race-class-1 text-race-class-1-foreground', mark: 'bg-race-class-1-foreground' },
  { chip: 'border-transparent bg-race-class-2 text-race-class-2-foreground', mark: 'bg-race-class-2-foreground' },
  { chip: 'border-transparent bg-race-class-3 text-race-class-3-foreground', mark: 'bg-race-class-3-foreground' },
  { chip: 'border-transparent bg-race-class-4 text-race-class-4-foreground', mark: 'bg-race-class-4-foreground' },
];

/**
 * The colour of a race's class.
 * @param slot Where the class sits among the race's classes, counting from zero
 * @returns Its chip and mark classes
 */
export const classAccent = (slot: number): { chip: string; mark: string } => (
  RACE_CLASS_ACCENT[((slot % RACE_CLASS_ACCENT.length) + RACE_CLASS_ACCENT.length) % RACE_CLASS_ACCENT.length]
);

/**
 * The colour a settings section's icon well takes, which is what lets a long
 * settings page be scanned by section rather than read.
 *
 * Each says which part of the app a section is about, so it is a closed set like
 * any other here, and the three content sources keep the hues their badges
 * already wear. The rest borrow families that never share a screen with them:
 * no settings tab shows a team's budget or a tier, which is what frees the
 * works magenta and the gold for the AI and for Content Manager, and none shows
 * a session, which frees the race green for the career's calendar - base
 * content's green sits beside it on the wheel, but only on the sources tab.
 */
export const SECTION_ACCENT = {
  you: 'bg-primary/12 text-primary',
  opponents: 'bg-budget-works text-budget-works-foreground',
  weather: 'bg-weather-wet text-weather-wet-foreground',
  look: 'bg-tier-steel text-tier-steel-foreground',
  tools: 'bg-tier-gold text-tier-gold-foreground',
  calendar: 'bg-session-race text-session-race-foreground',
  base: 'bg-provenance-base text-provenance-base-foreground',
  dlc: 'bg-provenance-dlc text-provenance-dlc-foreground',
  mod: 'bg-provenance-mod text-provenance-mod-foreground',
} as const;

/**
 * What a settings section is about, which picks its colour.
 */
export type SectionTone = keyof typeof SECTION_ACCENT;
