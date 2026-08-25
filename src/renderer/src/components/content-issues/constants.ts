import type { ContentIssueReason } from '../../../../shared/types';

/**
 * How tall the issue list may grow before it scrolls inside the popover.
 */
export const ISSUE_LIST_HEIGHT = 'max-h-72';

/**
 * Every reason, in the order the list groups them.
 *
 * Worst first: an entry nothing could be read from is a bigger problem than one
 * that only lost its metadata, which in turn beats a car that merely has no
 * liveries.
 */
export const ISSUE_REASON_ORDER: readonly ContentIssueReason[] = [
  'uiMissing',
  'uiUnparsable',
  'noLayouts',
  'uiSalvaged',
  'noSkins',
];
