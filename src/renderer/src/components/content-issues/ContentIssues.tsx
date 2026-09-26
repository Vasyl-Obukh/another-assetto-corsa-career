import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { ISSUE_LIST_HEIGHT } from './constants.ts';
import { groupByReason } from './utils.ts';
import type { ContentIssue } from '../../../../shared/types';
import { Shimmer } from '@/components/Shimmer.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useContentIssueReason } from '@/i18n';

interface ContentIssuesProps {
  /**
   * What opens the list - a single element that takes a ref, since the
   * popover hangs off it.
   */
  children: ReactElement;
  /**
   * The entries themselves, or null until they have been fetched.
   */
  issues: ContentIssue[] | null;
  /**
   * Asks for a fresh list, called every time the popover opens.
   */
  onOpen(): void;
}

export const ContentIssues = ({ children, issues, onOpen }: ContentIssuesProps) => {
  const { t } = useTranslation();
  const describeReason = useContentIssueReason();

  return (
    <Popover onOpenChange={(open) => { if (open) onOpen(); }}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent align="start" className="w-96 p-3">
        <p className="mb-2 text-sm font-medium">{t('content.brokenTitle')}</p>

        {issues === null ? (
          <div className="flex flex-col gap-2">
            <Shimmer className="h-4 w-2/3" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-1/2" />
          </div>
        ) : (
          <div className={`flex flex-col gap-3 overflow-y-auto ${ISSUE_LIST_HEIGHT}`}>
            {groupByReason(issues).map((group) => (
              <div key={group.reason}>
                <p className="text-xs font-medium text-destructive">
                  {describeReason(group.reason)}
                </p>

                <ul className="mt-1 flex flex-col gap-1">
                  {group.entries.map((issue) => (
                    <li key={`${issue.kind}:${issue.id}`} className="text-sm">
                      <span className="text-muted-foreground">{t(`content.kind.${issue.kind}`)}</span>
                      {' '}
                      <span className="font-mono text-xs">{issue.id}</span>
                      {issue.detail === null ? null : (
                        <span className="block text-xs break-all text-muted-foreground">
                          {t('content.brokenDetail', { detail: issue.detail })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
