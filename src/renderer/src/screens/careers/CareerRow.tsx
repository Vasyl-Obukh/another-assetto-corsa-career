import { useTranslation } from 'react-i18next';

import type { CareerSummary } from '../../../../shared/types';
import { ContentImage, NationFlag, trackPictureSources } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { disciplineKey } from '@/screens/championships';

interface CareerRowProps {
  /**
   * The career.
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
 * One career in the list: its track, its driver, where its clock stands and
 * what it is in - enough to tell it from the others, since it has no name.
 */
export const CareerRow = ({ career, picked = false, onPick }: CareerRowProps) => {
  const { t } = useTranslation();
  const { formatAgo, formatDay, formatYear } = useFormat();
  const only = career.championships.length === 1 ? career.championships[0] : null;
  const disciplines = [...new Set(career.championships.map((one) => one.ladder.discipline))];

  let entered = t('careers.championships', { count: career.championships.length });
  if (only) entered = only.name;
  else if (career.championships.length === 0) entered = t('careers.noChampionships');

  const body = (
    <>
      <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {career.track ? (
          <ContentImage sources={trackPictureSources(career.track)} alt="" className="object-cover" fallback={null} />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <NationFlag code={career.driver.nation ?? undefined} />
          <span className="truncate text-sm font-semibold">{career.driver.name}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatAgo(career.playedAt)}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {t('careers.dateLine', { year: formatYear(career.year), day: formatDay(career.date) })}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          {disciplines.map((discipline) => (
            <Badge key={discipline} className={DISCIPLINE_ACCENT[discipline]}>{t(disciplineKey(discipline))}</Badge>
          ))}
          <span className="truncate text-xs text-muted-foreground">{entered}</span>
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
