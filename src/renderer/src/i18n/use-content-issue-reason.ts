import { useTranslation } from 'react-i18next';

import { formatContentIssueReason } from './utils.ts';
import type { ContentIssueReason } from '../../../shared/types';

/**
 * Reads a renderer for content issue reasons, bound to the language currently
 * in force.
 * @returns A function turning a reason code into translated wording
 */
export const useContentIssueReason = (): (reason: ContentIssueReason) => string => {
  const { t } = useTranslation();

  return (reason) => formatContentIssueReason(t, reason);
};
