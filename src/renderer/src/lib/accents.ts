// The colour a chip wears when what it says is one of a closed set. Class
// strings rather than tokens, so a caller writes `className={...}` over a
// Badge and tailwind-merge drops the variant's own background for it - and
// anything the map does not cover falls through to that variant untouched.
//
// Shared rather than kept beside one screen, for the reason the measurements
// in `layout.ts` are: both of these are read in two places already, and a
// podium that is gold on the points card and grey on a results table would be
// saying something it does not mean.

import type { SessionType } from '../../../shared/types';

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
