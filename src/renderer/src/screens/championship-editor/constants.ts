// What the editor's own controls are bounded by, and the sentinel a select needs
// where "not set" means "whatever the championship says".

import type { ParseKeys } from 'i18next';

import type { LengthUnit } from './types.ts';
import { MAX_WEEKEND_DAYS } from '../../../../shared/constants';
import { Climate, Discipline, SeasonLength, TeamBudget } from '../../../../shared/types';

/**
 * The value a select carries when the answer is the championship's default.
 *
 * Radix cannot hold an empty string, so an unset select needs a value of its
 * own. Distinct from the race screen's NOT_SET, which means *nothing at all*:
 * a round naming no weekend format runs the default one, which is not the same
 * as a seat naming no team.
 *
 * Safe as a value because the editor mints every sub-id itself and none may
 * ever be typed, so no round or points system can be called this.
 */
export const DEFAULT_REF = '/default';

/**
 * How long an entry fee, a prize or a drop count may be.
 *
 * Only ever a floor. What a championship is worth is the author's business,
 * which is why validateSeries refuses a negative figure and nothing else.
 */
export const MIN_MONEY = 0;

/**
 * The lowest tier there is. Tier 1 is the top of a ladder.
 */
export const MIN_TIER = 1;

/**
 * Which rung a class entry is put on when it is first added.
 *
 * Deliberately not MIN_TIER: tier 1 is the top of a discipline, and a new class
 * entry claiming the top flight by default is a number nobody chose. Mid-ladder
 * is wrong too, but it is wrong in a way that reads as a placeholder.
 */
export const DEFAULT_TIER = 5;

/**
 * How many laps or minutes anything may be given.
 */
export const MIN_LENGTH = 0;

/**
 * The shortest a session may be asked to run for.
 *
 * Zero is MIN_LENGTH's answer because a championship saying nothing about a
 * length is a real thing to say, but a session that *is* given one and given
 * zero runs for no time at all.
 */
export const MIN_SESSION_LENGTH = 1;

/**
 * What a session switched to another unit starts at. Laps and minutes are the
 * race screen's own defaults, restated because its module reaches react-router
 * and this one is tested; a distance starts at a sprint's 100 km.
 */
export const DEFAULT_LENGTH: Readonly<Record<LengthUnit, number>> = {
  laps: 5,
  minutes: 15,
  distance: 100,
};

/**
 * The first day of a weekend, counting from zero.
 */
export const MIN_DAY = 0;

/**
 * The last day a session may be put on.
 *
 * One less than MAX_WEEKEND_DAYS, which counts days rather than offsets - and
 * the same ceiling validateFormat reports against, so the field refuses what
 * the document would be told off for.
 */
export const MAX_DAY = MAX_WEEKEND_DAYS - 1;

/**
 * The fewest cars a session may carry over from the qualifying it follows.
 *
 * A segment advancing nobody has no field, which validateFormat refuses as
 * `series.inherit.topInvalid`.
 */
export const MIN_INHERIT_TOP = 1;

/**
 * The fewest points a position may be worth. Zero is a position that scores
 * nothing, which a real table below the top ten says all the time.
 */
export const MIN_POINTS = 0;

/**
 * What a new points system pays, the winner first.
 *
 * Formula 1's own table since 2010, because a points system has to start as
 * something recognisable: an author who wants another one is editing a table
 * rather than building one from nothing, and ten scoring positions is the
 * shape most championships are some variation of.
 */
export const DEFAULT_POINTS: readonly number[] = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

/**
 * The lowest ballast or intake restriction a balance-of-performance row may
 * carry. Zero is a row that says nothing, which is still a row.
 */
export const MIN_BOP = 0;

/**
 * How few distinct models a spec may be asked to have installed.
 *
 * One is a grid of clones and the whole reason DEFAULT_MIN_MODELS exists, but
 * it is a coherent thing to ask for - a series raced against a single model is
 * a one-make series written the lazy way - so it is the floor rather than an
 * error.
 */
export const MIN_MODELS = 1;

/**
 * How long a nation code is. Three letters, as Assetto Corsa wants them.
 */
export const NATION_CODE_LENGTH = 3;

/**
 * The disciplines a class entry may be put in, in ladder order.
 *
 * Off the enum rather than written out, so a new discipline is offered without
 * a second list to remember - disciplineKey is what fails to compile when one
 * has no name yet.
 */
export const DISCIPLINES: readonly Discipline[] = Object.values(Discipline);

/**
 * How well funded a team may be, from the best off down.
 */
export const TEAM_BUDGETS: readonly TeamBudget[] = Object.values(TeamBudget);

/**
 * The climates a championship or a round may expect, driest first.
 */
export const CLIMATES: readonly Climate[] = Object.values(Climate);

/**
 * How much of a career's year a championship may fill, longest first.
 */
export const SEASON_LENGTHS: readonly SeasonLength[] = Object.values(SeasonLength);

/**
 * The climate generated weather starts from when it is switched on.
 *
 * The middle of the four, and what most of the shipped calendar races in.
 */
export const DEFAULT_CLIMATE = Climate.MEDITERRANEAN;

/**
 * The label for each budget.
 *
 * A record over the enum rather than a lookup by string, so adding a budget
 * fails to compile until it has been named.
 */
export const TEAM_BUDGET_LABEL = {
  works: 'editor.teams.budget.works',
  independent: 'editor.teams.budget.independent',
  privateer: 'editor.teams.budget.privateer',
} as const satisfies Record<TeamBudget, ParseKeys>;

/**
 * How a list of rows is laid out.
 *
 * The whole width of its card. It was capped short of it once, to keep a name
 * and the columns at the far end of its row within reading distance, and that
 * left a quarter of every card empty and the forms opened from those rows too
 * narrow for three fields to a line.
 *
 * The row order it implies is load-bearing. Only the name flexes, so a column's
 * position is fixed by the widths of everything to its right - which is why
 * every row puts its badges *before* its fixed columns. Badges after them would
 * shift the team or the circuit left on whichever rows happen to carry one, and
 * a column that only lines up on some rows is worse than no column.
 */
export const ROW_LIST = 'flex flex-col';

/**
 * The grip's column in a row, reserved whether or not a grip is in it.
 *
 * The grip goes while a row of the list is being edited, and a column that came
 * and went would drag every row's contents sideways with it.
 */
export const ROW_GRIP = 'size-9 shrink-0';

/**
 * The position number's column in a row.
 */
export const ROW_NUMBER = 'w-6 shrink-0 text-right text-xs text-muted-foreground';

/**
 * How many fields a row's form puts on one line on a wide window.
 *
 * Written out per count rather than built from the number, because Tailwind
 * only generates a class it can find spelled whole in the source. Three by
 * default, so a qualifying session's six fields are two lines; four for a form
 * of four short fields, which then opens as one.
 */
export const ROW_FORM_COLUMNS = {
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
} as const;

/**
 * The gap between a row's columns.
 *
 * Named because a form has to reproduce the grip and number columns to line its
 * first field up with the name beside them, and doing that means knowing what
 * separates them.
 */
export const ROW_GAP = 'gap-3';

/**
 * Which list a row being edited belongs to.
 *
 * Rows are addressed by scope and id together, because the edit state is one
 * value for the whole editor - see useRowEdit. Seats and balance-of-performance
 * rows belong to a class entry rather than to the championship, so their scopes
 * are built per entry by `seatScope` and `bopScope`.
 */
export const ROW_SCOPE = {
  TEAMS: 'teams',
  ENTRIES: 'entries',
  ROUNDS: 'rounds',
  FORMATS: 'formats',
  POINTS: 'points',
} as const;

/**
 * The colour each budget is chipped in.
 *
 * Kept here rather than in `accents.ts` because the editor is the only screen
 * that shows a team's funding - the rule that file states is that a colour map
 * moves there once a second screen reads it.
 *
 * A hue each, with chroma stepping down from works to privateer. It was one
 * hue at three depths once, and the three were indistinguishable at chip size.
 */
export const TEAM_BUDGET_ACCENT = {
  works: 'border-transparent bg-budget-works text-budget-works-foreground',
  independent: 'border-transparent bg-budget-independent text-budget-independent-foreground',
  privateer: 'border-transparent bg-budget-privateer text-budget-privateer-foreground',
} as const satisfies Record<TeamBudget, string>;

/**
 * Every unit a race may be measured in, in the order the select offers them.
 *
 * Minutes are not among them: Assetto Corsa runs a timed race on a server
 * alone, so an offline race is laps, or a distance that becomes laps at each
 * round's track.
 */
export const LENGTH_UNITS: readonly LengthUnit[] = ['laps', 'distance'];

/**
 * What each unit is called, as a field label and as a select option.
 */
export const LENGTH_LABEL = {
  laps: 'editor.sessions.laps',
  minutes: 'editor.sessions.minutes',
  distance: 'editor.sessions.distance',
} as const satisfies Record<LengthUnit, ParseKeys>;
