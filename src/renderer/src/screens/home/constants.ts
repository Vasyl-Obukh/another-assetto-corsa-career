/**
 * The badge width of each session row in the event's skeleton - three, the
 * shortest event a championship runs.
 */
export const SESSION_SKELETON = ['w-24', 'w-20', 'w-14'] as const;

/**
 * The championship rows of Home's skeleton: how wide each name runs, and how
 * many rounds its bar holds.
 */
export const ROW_SKELETON = [
  { name: 'w-44', rounds: 5 },
  { name: 'w-40', rounds: 6 },
  { name: 'w-24', rounds: 8 },
] as const;

/**
 * How long after an edition's last round Home keeps saying it is over, in
 * days: a fortnight, long enough to be seen however the clock is moved on.
 */
export const RECENT_FINISH_DAYS = 14;

/**
 * The colour each of Home's doors wears in its icon's well: Results a race's
 * green, History a title's gold, Finances the career's own blue, which its
 * opening balance wears on the ledger, and Rating the bronze of the ladder's
 * metals, which its rungs wear - each the colour of what it holds, so they
 * read apart before their names do.
 */
export const DOOR_ACCENT = {
  results: 'bg-session-race text-session-race-foreground',
  history: 'bg-podium-gold text-podium-gold-foreground',
  finances: 'bg-mode-career text-mode-career-foreground',
  rating: 'bg-tier-bronze text-tier-bronze-foreground',
  contracts: 'bg-contract text-contract-foreground',
} as const;

/**
 * How many of the ledger's newest lines Finances' door previews.
 */
export const DOOR_LINES = 3;

/**
 * How many historic events Home's strip shows at once.
 */
export const HISTORIC_SHOWN = 6;

/**
 * How many of those may be behind the clock, so the strip shows what just
 * happened as well as what is coming.
 */
export const HISTORIC_BEHIND = 2;

/**
 * How tall Home's lists of championships grow before they scroll: four rows of
 * the new season's list, borders included - each row measures 3.92rem.
 */
export const NEW_SEASON_LIST = 'max-h-[15.8rem]';

/**
 * The same for the championships entered this season: four rows of 4.46rem and
 * the three gaps between them.
 */
export const ENTERED_LIST = 'max-h-[18.6rem]';
