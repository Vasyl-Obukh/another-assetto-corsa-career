import {
  ArrowRightIcon, LayersIcon, PackageIcon, RefreshCwIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ContentStats } from './ContentStats.tsx';
import type { ContentIssue, ContentSummary } from '../../../../shared/types';
import { SettingsSection } from '@/components/SettingsSection.tsx';
import { Button } from '@/components/ui/button.tsx';
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
  /**
   * Where the user adds what the catalogue leaves out.
   */
  addContentHref: string;
}

export const ContentCard = ({
  ready,
  summary,
  issues,
  scanning,
  onScan,
  onOpenIssues,
  addContentHref,
}: ContentCardProps) => {
  const { t } = useTranslation();
  const { formatDateTime, formatDuration } = useFormat();
  const anonymous = summary !== null && (summary.hidden.cars > 0 || summary.hidden.tracks > 0);

  return (
    <SettingsSection
      icon={LayersIcon}
      tone="base"
      title={t('content.title')}
      hint={t('content.description')}
      footer={ready ? (
        <>
          <Button size="sm" disabled={scanning} onClick={onScan}>
            <RefreshCwIcon className={scanning ? 'animate-spin' : undefined} />
            {summary ? t('content.rescan') : t('content.scan')}
          </Button>
          <span>
            {summary
              ? t('content.scannedAt', {
                when: formatDateTime(summary.scannedAt),
                duration: formatDuration(summary.durationMs),
              })
              : t('content.never')}
          </span>
        </>
      ) : undefined}
    >
      {!ready ? <p className="text-sm text-muted-foreground">{t('content.blocked')}</p> : null}
      {ready && summary ? <ContentStats summary={summary} issues={issues} onOpenIssues={onOpenIssues} /> : null}
      {ready && !summary ? <p className="text-sm text-muted-foreground">{t('content.never')}</p> : null}

      {summary && anonymous ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-muted px-3.5 py-2.5 text-sm">
          <PackageIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            {t('content.hidden', {
              cars: t('content.hiddenCars', { count: summary.hidden.cars }),
              tracks: t('content.hiddenTracks', { count: summary.hidden.tracks }),
            })}
          </span>
          <Link to={addContentHref} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            {t('content.hiddenManage')}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      ) : null}
    </SettingsSection>
  );
};
