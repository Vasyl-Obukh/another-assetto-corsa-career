import { RefreshCwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ContentIssues } from './content-issues/index.ts';
import type { ContentIssue, ContentSummary } from '../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';

interface ContentCardProps {
  /**
   * Whether the AC install has been located, without which nothing can be scanned.
   */
  ready: boolean;
  /**
   * The last scan's counts, or null when nothing has been scanned yet.
   */
  summary: ContentSummary | null;
  /**
   * What the last scan found broken, or null until it has been asked for.
   */
  issues: ContentIssue[] | null;
  /**
   * Whether a scan is in flight.
   */
  scanning: boolean;
  /**
   * Runs a fresh scan.
   */
  onScan(): void;
  /**
   * Fetches the broken content behind the count.
   */
  onOpenIssues(): void;
}

export const ContentCard = ({
  ready,
  summary,
  issues,
  scanning,
  onScan,
  onOpenIssues,
}: ContentCardProps) => {
  const { t } = useTranslation();
  const { formatDateTime, formatDuration } = useFormat();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('content.title')}</CardTitle>
        <CardDescription>{t('content.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {ready ? (
          <>
            {summary ? (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{t('content.cars', { count: summary.cars })}</Badge>
                <Badge variant="secondary">{t('content.tracks', { count: summary.tracks })}</Badge>
                <Badge variant="secondary">{t('content.weathers', { count: summary.weather })}</Badge>
                <Badge variant="secondary">
                  {t('content.controllers', { count: summary.controllers })}
                </Badge>
                {summary.issues > 0 ? (
                  <ContentIssues
                    count={summary.issues}
                    issues={issues}
                    onOpen={onOpenIssues}
                  />
                ) : null}
              </div>
            ) : null}

            {summary && (summary.hidden.cars > 0 || summary.hidden.tracks > 0) ? (
              <p className="text-xs text-muted-foreground">
                {t('content.hidden', {
                  cars: t('content.hiddenCars', { count: summary.hidden.cars }),
                  tracks: t('content.hiddenTracks', { count: summary.hidden.tracks }),
                })}
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              <Button size="sm" disabled={scanning} onClick={onScan}>
                <RefreshCwIcon className={scanning ? 'animate-spin' : undefined} />
                {summary ? t('content.rescan') : t('content.scan')}
              </Button>
              <span className="text-xs text-muted-foreground">
                {summary
                  ? t('content.scannedAt', {
                    when: formatDateTime(summary.scannedAt),
                    duration: formatDuration(summary.durationMs),
                  })
                  : t('content.never')}
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t('content.blocked')}</p>
        )}
      </CardContent>
    </Card>
  );
};
