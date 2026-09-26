import type { SkipReason } from '../../../../shared/types';

/**
 * The chip each kind of loss wears. A round lost is the calendar's missed rose,
 * since that is what it becomes, and a clash is the calendar's amber, since that
 * is what it already is there.
 */
export const SKIP_ACCENT = {
  skipped: 'border-transparent bg-event-missed text-event-missed-foreground',
  partway: 'border-transparent bg-event-missed text-event-missed-foreground',
  behind: 'border-transparent bg-event-missed text-event-missed-foreground',
  clash: 'border-transparent bg-warning text-warning-foreground',
} as const satisfies Record<SkipReason, string>;
