import {
  CarIcon, CloudIcon, RouteIcon, SparklesIcon, TriangleAlertIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { STAT_TILE } from './constants.ts';
import { StatTile } from './StatTile.tsx';
import type { ContentIssue, ContentSummary } from '../../../../shared/types';
import { ContentIssues } from '@/components/content-issues/index.ts';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface ContentStatsProps {
  /**
   * The last scan's counts.
   */
  summary: ContentSummary;
  /**
   * What the last scan found broken, or null until it has been asked for.
   */
  issues: ContentIssue[] | null;
  /**
   * Fetches the broken content behind the count.
   */
  onOpenIssues(): void;
}

/**
 * What a scan found, a tile per kind of content, with what is broken last and
 * opening the list of it.
 */
export const ContentStats = ({ summary, issues, onOpenIssues }: ContentStatsProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const broken = summary.issues > 0;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      <StatTile
        icon={CarIcon}
        label={t('content.statCars')}
        value={formatNumber(summary.cars)}
        sub={t('content.inLibrary', { shown: formatNumber(summary.cars - summary.hidden.cars) })}
      />
      <StatTile
        icon={RouteIcon}
        label={t('content.statTracks')}
        value={formatNumber(summary.tracks)}
        sub={t('content.inLibrary', { shown: formatNumber(summary.tracks - summary.hidden.tracks) })}
      />
      <StatTile icon={CloudIcon} label={t('content.statWeathers')} value={formatNumber(summary.weather)} />
      <StatTile icon={SparklesIcon} label={t('content.statControllers')} value={formatNumber(summary.controllers)} />

      {broken ? (
        <ContentIssues issues={issues} onOpen={onOpenIssues}>
          <button
            type="button"
            className={cn(
              STAT_TILE,
              'border-destructive/45 bg-destructive/6 transition-colors hover:border-destructive',
            )}
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TriangleAlertIcon className="size-3.5" />
              {t('content.statBroken')}
            </span>
            <span className="text-2xl leading-tight font-semibold text-destructive tabular-nums">
              {formatNumber(summary.issues)}
            </span>
            <span className="text-xs font-medium text-primary">{t('content.seeBroken')}</span>
          </button>
        </ContentIssues>
      ) : (
        <StatTile icon={TriangleAlertIcon} label={t('content.statBroken')} value={formatNumber(0)} />
      )}
    </div>
  );
};
