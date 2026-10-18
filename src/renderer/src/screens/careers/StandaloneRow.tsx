import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CareerSummary } from '../../../../shared/types';
import { ContentImage, NationFlag, trackPictureSources } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { EDITION_ACCENT } from '@/lib/accents';
import {
  isChampion, progressLine, standaloneName, standingLine,
} from '@/lib/standalone-wording';
import { cn } from '@/lib/utils.ts';
import { LadderChip } from '@/screens/championships';

interface StandaloneRowProps {
  /**
   * The standalone championship.
   */
  career: CareerSummary;
  /**
   * Whether it is the one picked.
   */
  picked?: boolean;
  /**
   * Called when it is picked, or absent for a row shown rather than picked
   * from - a backup's, in the restore dialog.
   */
  onPick?: () => void;
}

/**
 * One standalone championship in the list: its track, its championship and
 * year, who races it, how far through it is and where they stand.
 */
export const StandaloneRow = ({ career, picked = false, onPick }: StandaloneRowProps) => {
  const { t } = useTranslation();
  const { formatAgo, formatNumber, formatYear } = useFormat();
  const championship = career.championships[0];
  const { standing } = career;
  const standingText = standing && standingLine(standing, t, formatNumber);

  const body = (
    <>
      <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {career.track ? (
          <ContentImage sources={trackPictureSources(career.track)} alt="" className="object-cover" fallback={null} />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {standaloneName(career, t, formatYear)}
          </span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatAgo(career.playedAt)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <NationFlag code={career.driver.nation ?? undefined} />
          <span className="truncate">
            {t('standalone.driverLine', {
              driver: career.driver.name, progress: standing ? progressLine(standing, t) : '',
            })}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-1">
          {championship ? <LadderChip ladder={championship.ladder} /> : null}
          {standing && isChampion(standing) ? (
            <Badge className={cn('gap-1', EDITION_ACCENT.title)}>
              <TrophyIcon className="size-3" />
              {t('standalone.champion')}
            </Badge>
          ) : null}
          {standingText && !(standing && isChampion(standing)) ? (
            <span className="truncate text-xs text-muted-foreground">{standingText}</span>
          ) : null}
        </span>
      </span>
    </>
  );

  if (!onPick) return <div className="flex w-full items-center gap-3 px-3 py-2.5">{body}</div>;

  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={onPick}
      className={cn(
        'flex w-full items-center gap-3 border-b px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-accent',
        picked && 'bg-primary/8 shadow-[inset_3px_0_0_var(--color-primary)] hover:bg-primary/10',
      )}
    >
      {body}
    </button>
  );
};
