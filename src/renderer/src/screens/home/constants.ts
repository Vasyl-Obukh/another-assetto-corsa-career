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
 * The colour each of Home's two doors wears in its icon's well: Results a
 * race's green, History a title's gold - each the colour of what it holds, so
 * the two read apart before their names do.
 */
export const DOOR_ACCENT = {
  results: 'bg-session-race text-session-race-foreground',
  history: 'bg-podium-gold text-podium-gold-foreground',
} as const;
