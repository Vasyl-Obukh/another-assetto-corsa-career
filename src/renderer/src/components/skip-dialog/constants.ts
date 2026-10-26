import type { SkipReason } from '../../../../shared/types';

/**
 * The chip each kind of loss wears. A round lost is the calendar's missed rose,
 * since that is what it becomes, and a clash is the calendar's amber, since that
 * is what it already is there. A round the install cannot race is amber too:
 * like a clash, it is out of reach rather than given up. An invitation left to
 * lapse wears the pale amber an invitation awaiting a reply wears everywhere.
 */
export const SKIP_ACCENT = {
  skipped: 'border-transparent bg-event-missed text-event-missed-foreground',
  partway: 'border-transparent bg-event-missed text-event-missed-foreground',
  behind: 'border-transparent bg-event-missed text-event-missed-foreground',
  clash: 'border-transparent bg-warning text-warning-foreground',
  unraceable: 'border-transparent bg-warning text-warning-foreground',
  unanswered: 'border-transparent bg-mail-awaiting text-mail-awaiting-foreground',
} as const satisfies Record<SkipReason, string>;
