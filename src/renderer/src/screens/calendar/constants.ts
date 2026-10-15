import type {
  CalendarCriteria, CalendarEventKind, CalendarStatus, CalendarView, MonthTick,
} from './types.ts';

/**
 * The status filters the toolbar offers, in the order they are shown.
 */
export const CALENDAR_STATUSES: readonly CalendarStatus[] = [
  'all', 'available', 'entered', 'locked',
];

/**
 * What the calendar shows before the player narrows it.
 *
 * Everything, because a career with nothing entered would otherwise open on an
 * empty page and have no way to find something to enter.
 */
export const DEFAULT_CRITERIA: CalendarCriteria = { status: 'all', disciplines: [], kinds: [] };

/**
 * The kinds of event the toolbar can narrow the calendar to, in the order they
 * are shown.
 */
export const CALENDAR_EVENT_KINDS: readonly CalendarEventKind[] = ['championship', 'historic'];

/**
 * The layouts the view switch offers, in the order they are shown.
 */
export const CALENDAR_VIEWS: readonly CalendarView[] = ['days', 'month'];

/**
 * The stored preference the calendar keeps its layout under - apart from the
 * filters, since it is not one.
 */
export const CALENDAR_VIEW_MEMORY = 'career-calendar-view';

/**
 * The height of one line in a month grid's day - an event, or the "+ N more"
 * that folds the rest - in pixels: Tailwind's leading-5 and the gap under it.
 */
export const MONTH_LINE_HEIGHT = 22;

/**
 * What a month grid's day spends before its first event, in pixels: its
 * padding and the line its date sits on.
 */
export const MONTH_CELL_CHROME = 36;

/**
 * How much of the scroller the month view leaves to the page below it, in
 * pixels: the column's gap above the view and its padding beneath.
 */
export const MONTH_VIEW_INSET = 48;

/**
 * The shortest the month view is drawn, in pixels, so a squat window scrolls a
 * usable grid rather than squeezing every day down to its date.
 */
export const MONTH_VIEW_MIN_HEIGHT = 480;

/**
 * How wide the window has to be for a day's events to sit beside the month
 * grid rather than open in a sheet - Tailwind's 2xl, where the grid and a
 * column of cards both still have room.
 */
export const DAY_PANEL_QUERY = '(min-width: 80rem)';

/**
 * The stored preference the calendar keeps its filters under.
 */
export const CALENDAR_MEMORY = 'career-calendar';

/**
 * How far below the pinned header today is put when the view goes to it, in
 * pixels - enough to read as a line under the header rather than touching it.
 */
export const TODAY_MARGIN = 8;

/**
 * The colour of a month strip's tick, by how its race day reads. Primary for
 * one of yours as the cards' ring has it, amber for a clash as its chip has it,
 * and a faint grey for a day you are not racing - there for the season's
 * rhythm, not to be read.
 */
export const MONTH_TICK = {
  yours: 'bg-primary',
  clash: 'bg-warning',
  other: 'bg-muted-foreground/25',
} as const satisfies Record<MonthTick, string>;

/**
 * Any month starting on a Monday. The month view's skeleton reads only its
 * weekday names, which are the same for every month.
 */
export const WEEKDAY_REFERENCE = '2024-01-01';

/**
 * How many months the season strip's skeleton holds - a season is a year.
 */
export const STRIP_SKELETON = 12;

/**
 * The race days of the timeline's skeleton, as how many cards each holds and
 * whether a month heading comes before it.
 */
export const AGENDA_SKELETON = [
  { id: 'a', cards: 3, opensMonth: false },
  { id: 'b', cards: 2, opensMonth: true },
  { id: 'c', cards: 1, opensMonth: false },
  { id: 'd', cards: 2, opensMonth: false },
] as const;

/**
 * How many weeks the month view's skeleton draws - as many as any month spans.
 */
export const MONTH_SKELETON_WEEKS = 6;

/**
 * How many event lines each weekday column of the month skeleton holds, Monday
 * first - every day carries the lower tiers' races, and Saturday and Sunday the
 * top two tiers' as well.
 */
export const MONTH_SKELETON_LINES = [1, 1, 1, 1, 1, 2, 2] as const;

/**
 * How many event cards the day list beside the month skeleton holds.
 */
export const DAY_SKELETON_CARDS = 3;
