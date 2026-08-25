import { ISSUE_REASON_ORDER } from './constants.ts';
import type { ContentIssue, ContentIssueReason } from '../../../../shared/types';

/**
 * Gathers broken content under the reason it is broken for.
 *
 * A reason nothing matched is dropped rather than shown empty, and a reason the
 * order does not name still appears - the type is what the scan produces, and a
 * new member must not fall out of the list silently.
 * @param issues Everything the last scan found broken
 * @returns One group per reason present, worst first
 */
export const groupByReason = (
  issues: readonly ContentIssue[],
): { reason: ContentIssueReason; entries: ContentIssue[] }[] => {
  const groups = new Map<ContentIssueReason, ContentIssue[]>();

  issues.forEach((issue) => {
    const entries = groups.get(issue.reason);
    if (entries) entries.push(issue);
    else groups.set(issue.reason, [issue]);
  });

  const known = ISSUE_REASON_ORDER.filter((reason) => groups.has(reason));
  const rest = [...groups.keys()].filter((reason) => !ISSUE_REASON_ORDER.includes(reason));

  return [...known, ...rest].map((reason) => ({ reason, entries: groups.get(reason) ?? [] }));
};
