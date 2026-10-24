import type { VariantProps } from 'class-variance-authority';
import type { ParseKeys } from 'i18next';

import type {
  AvailabilityState, ContentList, DetailTab, StandingsLayout,
} from './types.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { Discipline, SessionType, TeamBudget } from '../../../../shared/types';
import type { SortItem } from '@/components';
import type { badgeVariants } from '@/components/ui/badge.tsx';
import type { ChampionshipSortKey } from '@/hooks';

/**
 * The badge each availability state wears.
 *
 * A traffic light rather than a pair: "Misconfigured" is neither a library
 * problem nor nothing wrong, and amber is what says so without a sentence.
 * Checked against the badge's own variants, so a colour that is not offered
 * fails here rather than silently rendering as the default one.
 */
export const AVAILABILITY_VARIANT = {
  available: 'success',
  misconfigured: 'warning',
  unavailable: 'destructive',
} as const satisfies Record<
AvailabilityState,
NonNullable<VariantProps<typeof badgeVariants>['variant']>
>;

/**
 * A championship card's title, stretched over the whole card.
 *
 * Stretched rather than wrapping the card, so the card reads as one link or
 * button without nesting its own controls inside it - which is why those
 * controls each lift themselves to `z-10`.
 */
export const CARD_TITLE = 'min-w-0 flex-1 truncate text-left font-medium after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none';

/**
 * Every key a championship list can be sorted by, in the order the menu
 * offers them. The name first, because it is what a list opens on.
 */
export const CHAMPIONSHIP_SORTS: readonly SortItem<ChampionshipSortKey>[] = [
  { key: 'name', label: 'championships.sort.name' },
  { key: 'ladder', label: 'championships.sort.ladder' },
] as const satisfies readonly { key: ChampionshipSortKey; label: ParseKeys }[];

/**
 * Which list each championship list is remembered as, so the two keep their
 * own filters: the settings tab narrows on more than the Championships page.
 */
export const CHAMPIONSHIP_MEMORY = {
  championships: 'championships',
  library: 'championship-library',
} as const;

/**
 * How many championships a rung of the ladder shows before the rest fold away
 * behind a count. Formula 1 alone has more than twenty seasons at tier 1.
 */
export const RUNGS_SHOWN = 3;

/**
 * The name of each rung's metal, the top rung first - the same ramp TIER_ACCENT
 * colours, and read through `tierMetalKey`, which does the same clamping.
 */
export const TIER_METAL_KEYS: readonly ParseKeys[] = [
  'championships.metal.platinum',
  'championships.metal.gold',
  'championships.metal.silver',
  'championships.metal.bronze',
  'championships.metal.steel',
];

/**
 * A session type as one or two letters, for an event drawn as a strip of
 * blocks. A record over the type, so a new one fails to compile until it has
 * an abbreviation.
 */
export const SESSION_SHORT_KEYS = {
  practice: 'championships.sessionShort.practice',
  qualify: 'championships.sessionShort.qualify',
  race: 'championships.sessionShort.race',
  hotlap: 'championships.sessionShort.hotlap',
  timeAttack: 'championships.sessionShort.timeAttack',
  drift: 'championships.sessionShort.drift',
  drag: 'championships.sessionShort.drag',
} as const satisfies Record<SessionType, ParseKeys>;

/**
 * The left edge a rung's card wears, in its discipline's colour - the column
 * already says the discipline, so the edge is the only fill it needs.
 */
export const RUNG_EDGE = {
  'single-seater': 'border-l-discipline-single-seater-foreground',
  sportscar: 'border-l-discipline-sportscar-foreground',
  touring: 'border-l-discipline-touring-foreground',
  road: 'border-l-discipline-road-foreground',
} as const satisfies Record<Discipline, string>;

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
 * How many of a class's cars its row pictures before the row is opened: one
 * line of them, which is what keeps a nine-class grid readable.
 */
export const CLASS_CARS_SHOWN = 3;

/**
 * How many of a class's teams its row lists before the row is opened, one to
 * a line.
 */
export const CLASS_TEAMS_SHOWN = 4;

/**
 * How many places the prize table lists before the rest fold away. Ten, which
 * is where most prize money stops; a points table running to thirtieth is still
 * one click from whole.
 */
export const PRIZE_ROWS_SHOWN = 10;

/**
 * The stripe heading a championship's summary, in its discipline's colour: the
 * chip's own foreground, which is the saturated half of the family.
 */
export const DISCIPLINE_STRIPE = {
  'single-seater': 'bg-discipline-single-seater-foreground',
  sportscar: 'bg-discipline-sportscar-foreground',
  touring: 'bg-discipline-touring-foreground',
  road: 'bg-discipline-road-foreground',
} as const satisfies Record<Discipline, string>;

/**
 * The source tree's lists, in the order the tree shows them.
 */
export const CONTENT_LISTS: readonly ContentList[] = ['sources', 'packs', 'makers', 'distributors'];

/**
 * The championship browser's dimension keys, as the filter column reads them.
 */
export const RAIL_KEY = {
  disciplines: 'disciplines',
  tiers: 'tiers',
  content: 'content',
  origins: 'origins',
  switched: 'switched',
  availability: 'availability',
  affordable: 'affordable',
} as const;

/**
 * The order each closed list in the filter column is shown in. Tiers are
 * numbers and sort as such, so they are not here.
 */
export const LIST_ORDER: Readonly<Record<string, readonly string[]>> = {
  [RAIL_KEY.disciplines]: DISCIPLINES,
  [RAIL_KEY.origins]: ['shipped', 'adjusted', 'user'],
  [RAIL_KEY.availability]: ['available', 'misconfigured', 'unavailable'],
};

/**
 * Every tier there is, the bottom rung first - what the ladder's skeleton and
 * the tier filter show while the library is read.
 */
export const ALL_TIERS: readonly number[] = TIER_METAL_KEYS.map((key, at) => TIER_METAL_KEYS.length - at);

/**
 * How many championship cards each rung of the ladder's skeleton holds,
 * discipline by discipline and the bottom rung first.
 */
export const LADDER_SKELETON: readonly (readonly number[])[] = [
  [3, 1, 2, 3, 2],
  [1, 2, 2, 2, 2],
];

/**
 * How many session blocks an event's strip holds in a skeleton - practice,
 * qualifying and a race or two.
 */
export const FORMAT_SKELETON_BLOCKS = 4;

/**
 * How many season cards the settings library's skeleton holds - two rows of a
 * wide window's three.
 */
export const SEASON_SKELETON = 6;

/**
 * The grid season cards are laid out in, on the settings library and in New
 * championship, shared with their skeleton so nothing moves when they land.
 */
export const SEASON_GRID = 'grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] gap-4';

/**
 * How many rounds a skeleton's season holds, for its round ticks and table.
 */
export const ROUND_SKELETON = 5;

/**
 * How many seats and how many cars the class row of a championship's skeleton
 * holds.
 */
export const CLASS_SKELETON = { seats: 4, cars: 2 } as const;

/**
 * Where the standings section's layout is remembered.
 */
export const STANDINGS_PREFERENCE = 'championships.standings';

/**
 * How the standings open the first time: the season grid, on points.
 */
export const DEFAULT_STANDINGS: StandingsLayout = { who: 'drivers', shape: 'grid', view: 'points' };

/**
 * The parts of a championship's page, in the order its tabs list them.
 */
export const DETAIL_TABS: readonly DetailTab[] = ['rounds', 'standings', 'classes', 'rules'];

/**
 * A tab underlined when open, which the championship's page, the editor's tabs
 * and a round's dialog all wear, so they read as one family: everything but its
 * padding, which each sets for itself.
 */
export const UNDERLINE_TAB = 'h-auto flex-none rounded-none border-0 border-b-2 border-transparent '
  + '-mb-px text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent '
  + 'data-[state=active]:text-foreground data-[state=active]:shadow-none dark:text-muted-foreground '
  + 'dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent';

/**
 * How many rows the sidebar's standings hold while the page loads.
 */
export const STANDINGS_SKELETON = 5;

/**
 * A library table's column heading, shared by the championships' and the
 * historic events' tables.
 */
export const TABLE_HEADING = 'px-2.5 py-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase';

/**
 * An outline button laid over a photograph: translucent on-scrim glass in
 * either theme, since the scrim under it is dark in both. The dark variants
 * restate it, or the outline variant's own dark fill would win.
 */
export const GLASS_BUTTON = 'border-on-scrim/25 bg-on-scrim/10 text-on-scrim backdrop-blur-sm hover:bg-on-scrim/20 '
  + 'hover:text-on-scrim dark:border-on-scrim/25 dark:bg-on-scrim/10 dark:hover:bg-on-scrim/20';
