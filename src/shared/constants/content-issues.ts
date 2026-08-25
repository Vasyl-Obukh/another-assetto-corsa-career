// The English rendering of every way a piece of installed content can be broken.
//
// This is the source the CLI prints and the fallback the UI uses when a
// catalogue has no entry for a reason. src/renderer/src/i18n merges it in as the
// English `issueReasons` namespace, so the strings are never duplicated in
// en.json.

import type { ContentIssueReason } from '../types/index.ts';

/**
 * Every content issue reason mapped to its English wording.
 *
 * Phrased as a fragment rather than a sentence, because both surfaces name the
 * entry first: `car ks_audi_r8: no readable metadata`.
 */
export const CONTENT_ISSUE_REASONS: Record<ContentIssueReason, string> = {
  uiMissing: 'no readable metadata',
  uiUnparsable: 'metadata could not be parsed',
  uiSalvaged: 'metadata is broken; only the name was recovered',
  noLayouts: 'no readable layout',
  noSkins: 'no liveries installed, so it cannot be put on a grid',
};
