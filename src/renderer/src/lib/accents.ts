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
  ClassificationOrigin,
  Climate,
  Discipline,
  EventStatus,
  LadderPosition,
  LedgerKind,
  SaveKind,
  SessionType,
  TeamBudget,
} from '../../../shared/types';

/**
 * A mode of the app a tile or a slot belongs to.
 */
export type AppMode = 'career' | 'championship' | 'quick';

/**
 * The colour each mode is chipped in, on the start screen and the Careers list.
 */
export const MODE_ACCENT = {
  career: 'border-transparent bg-mode-career text-mode-career-foreground',
  championship: 'border-transparent bg-mode-championship text-mode-championship-foreground',
  quick: 'border-transparent bg-mode-quick text-mode-quick-foreground',
} as const satisfies Record<AppMode, string>;

/**
 * The stripe along the top of a start screen tile, in its mode's solid shade.
 */
export const MODE_STRIPE = {
  career: 'border-t-mode-career-solid',
  championship: 'border-t-mode-championship-solid',
  quick: 'border-t-mode-quick-solid',
} as const satisfies Record<AppMode, string>;

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
 * The colour of a stripe or dot standing for a class's discipline: its own, or
 * muted for a class the championship no longer has.
 * @param ladder The class's discipline and rung, or null
 * @returns Its background class
 */
export const disciplineDot = (ladder: LadderPosition | null | undefined): string => (
  ladder ? DISCIPLINE_DOT[ladder.discipline] : 'bg-muted'
);

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
 * The leather a historic event is chipped in, wherever it stands beside a
 * championship's rounds: the calendar, Home, its own page, a result, a lost
 * round's row and the year review. A round of a championship carries no chip
 * of its own - its number already says what it is - so this is one colour
 * rather than a map. globals.css says why leather.
 */
export const HISTORIC_ACCENT = 'border-transparent bg-historic text-historic-foreground';

/**
 * The colour each kind of ledger line is chipped in - Finances, Home's door
 * into it and a round's own money. Each is the colour of what paid it: a race
 * in the race green, a final standing in the podium gold, a historic event in
 * its leather, the opening balance in the career's own blue. A change of speed
 * moves no money and is the catch-all grey on purpose. globals.css says why
 * the fee's.
 */
export const LEDGER_ACCENT = {
  opening: 'border-transparent bg-mode-career text-mode-career-foreground',
  fee: 'border-transparent bg-ledger-fee text-ledger-fee-foreground',
  race: 'border-transparent bg-session-race text-session-race-foreground',
  standings: 'border-transparent bg-podium-gold text-podium-gold-foreground',
  historic: 'border-transparent bg-historic text-historic-foreground',
  speed: 'border-transparent bg-session-other text-session-other-foreground',
} as const satisfies Record<LedgerKind, string>;

/**
 * The deep tone of each kind of ledger line, for the bars that weigh them
 * against each other.
 */
export const LEDGER_BAR = {
  opening: 'bg-mode-career-foreground',
  fee: 'bg-ledger-fee-foreground',
  race: 'bg-session-race-foreground',
  standings: 'bg-podium-gold-foreground',
  historic: 'bg-historic-foreground',
  speed: 'bg-session-other-foreground',
} as const satisfies Record<LedgerKind, string>;

/**
 * A historic event as a dot - the leather's own deep tone - for where the
 * calendar marks it beside the discipline dots, as its filter's legend and on
 * the edge of a card.
 */
export const HISTORIC_DOT = 'bg-historic-foreground';

/**
 * The colour each segment of a championship's progress bar is filled in. The
 * same success green and missed rose the calendar's status chips wear, primary
 * for the round up next, and plain muted for everything still to come.
 *
 * Read by Home's championship rows and its legend, and by a championship's
 * edition switcher.
 */
export const ROUND_MARK = {
  raced: 'bg-success',
  missed: 'bg-event-missed-foreground/60',
  next: 'bg-primary',
  later: 'bg-muted',
} as const;

/**
 * The colour each state of a championship edition is chipped in, wherever a
 * season is looked back on: one that is over in a points finish's soft green,
 * one under way - or entered and still to come - in primary, and a title in
 * the podium's gold. The same three families the result cells already wear, so
 * nothing new had to be placed on the wheel.
 *
 * Read by History, the season and championship reviews, Home and a
 * championship's edition switcher.
 */
export const EDITION_ACCENT = {
  over: 'border-transparent bg-result-points text-result-points-foreground',
  running: 'border-transparent bg-primary/12 text-primary',
  title: 'border-transparent bg-podium-gold text-podium-gold-foreground',
} as const;

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
 * Green, for something the player asked for that is done and worth a second
 * look - a backup written, a career restored. The traffic light's other end
 * from `CAUTION_ACCENT`.
 *
 * Read by the toasts the Careers page raises.
 */
export const DONE_ACCENT = 'border-transparent bg-success text-success-foreground';

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
 * What kind of save a row is, on its icon well and its chip. Read by the
 * Careers page's saves, the Load dialog and the toast a load raises.
 */
export const SAVE_KIND_ACCENT = {
  named: 'border-transparent bg-save-named text-save-named-foreground',
  quick: 'border-transparent bg-save-quick text-save-quick-foreground',
  auto: 'border-transparent bg-save-auto text-save-auto-foreground',
} as const satisfies Record<SaveKind, string>;

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
  // New career's own two: what a career starts with to spend, in the budget
  // family's independent red, and the rung it starts on, in the top rung's
  // platinum. Neither page they appear on shows a team's budget, and the
  // platinum well sits beside its own tier chips rather than against them.
  money: 'bg-budget-independent text-budget-independent-foreground',
  ladder: 'bg-tier-platinum text-tier-platinum-foreground',
  // The quick save's red, which nothing else on the General tab sits near.
  saves: 'bg-save-quick text-save-quick-foreground',
} as const;

/**
 * What a settings section is about, which picks its colour.
 */
export type SectionTone = keyof typeof SECTION_ACCENT;
