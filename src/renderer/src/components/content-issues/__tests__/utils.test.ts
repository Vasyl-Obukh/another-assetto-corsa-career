import { describe, expect, it } from '@jest/globals';

import type { ContentIssue, ContentIssueReason } from '../../../../../shared/types';
import { groupByReason } from '../utils.ts';

/**
 * Builds an issue, defaulting everything the grouping does not read.
 * @param id The folder the issue is about
 * @param reason Why it is broken
 * @returns A complete ContentIssue
 */
const issue = (id: string, reason: ContentIssueReason): ContentIssue => ({
  kind: 'car', id, reason, detail: null,
});

describe('renderer/components/content-issues/utils', () => {
  describe('groupByReason', () => {
    it('is empty when nothing is broken', () => {
      expect(groupByReason([])).toEqual([]);
    });

    it('gathers the entries that share a reason', () => {
      const grouped = groupByReason([
        issue('car_a', 'noSkins'),
        issue('car_b', 'noSkins'),
      ]);

      expect(grouped).toHaveLength(1);
      expect(grouped[0].reason).toBe('noSkins');
      expect(grouped[0].entries.map((entry) => entry.id)).toEqual(['car_a', 'car_b']);
    });

    it('keeps the entries of one reason in the order the scan found them', () => {
      const grouped = groupByReason([
        issue('car_c', 'uiMissing'),
        issue('car_a', 'uiMissing'),
        issue('car_b', 'uiMissing'),
      ]);

      expect(grouped[0].entries.map((entry) => entry.id)).toEqual(['car_c', 'car_a', 'car_b']);
    });

    // An entry nothing could be read from is a bigger problem than one that only
    // lost its metadata, which beats a car that merely has no liveries.
    it('orders the groups worst first, not by when they were found', () => {
      const grouped = groupByReason([
        issue('car_a', 'noSkins'),
        issue('car_b', 'uiSalvaged'),
        issue('car_c', 'uiMissing'),
        issue('car_d', 'uiUnparsable'),
      ]);

      expect(grouped.map((group) => group.reason))
        .toEqual(['uiMissing', 'uiUnparsable', 'uiSalvaged', 'noSkins']);
    });

    it('drops a reason nothing matched rather than showing it empty', () => {
      const grouped = groupByReason([issue('car_a', 'noSkins')]);

      expect(grouped.map((group) => group.reason)).toEqual(['noSkins']);
    });

    // The type is what the scan produces, so a reason added to it before the
    // display order caught up must still reach the user.
    it('keeps a reason the order does not name, rather than losing it silently', () => {
      const unlisted = 'somethingNewEntirely' as ContentIssueReason;
      const grouped = groupByReason([issue('car_a', unlisted), issue('car_b', 'uiMissing')]);

      expect(grouped.map((group) => group.reason)).toEqual(['uiMissing', unlisted]);
      expect(grouped[1].entries.map((entry) => entry.id)).toEqual(['car_a']);
    });
  });
});
