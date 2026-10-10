import type { RoundMark } from './types.ts';

/**
 * The colour each segment of a championship's progress bar is filled in. The
 * same success green and missed rose the calendar's status chips wear, primary
 * for the round up next, and plain muted for everything still to come.
 */
export const ROUND_MARK = {
  raced: 'bg-success',
  missed: 'bg-event-missed-foreground/60',
  next: 'bg-primary',
  later: 'bg-muted',
} as const satisfies Record<RoundMark, string>;

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
