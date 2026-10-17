import { useTranslation } from 'react-i18next';

import type { UnreadableCareer } from '../../../../shared/types';
import { NationFlag } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { CAUTION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface UnreadableRowProps {
  /**
   * The career.
   */
  career: UnreadableCareer;
  /**
   * Whether it is the one picked.
   */
  picked: boolean;
  /**
   * Called when it is picked.
   */
  onPick: () => void;
}

/**
 * A career that cannot be read, in the list beside the rest: who races it where
 * that still reads, and an amber chip saying it cannot be opened.
 */
export const UnreadableRow = ({ career, picked, onPick }: UnreadableRowProps) => {
  const { t } = useTranslation();
  const { formatAgo } = useFormat();

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
      <span className="h-10 w-16 shrink-0 rounded-md bg-muted" />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          {career.driver ? <NationFlag code={career.driver.nation ?? undefined} /> : null}
          <span className="truncate text-sm font-semibold">{career.driver?.name ?? t('careers.unreadable.name')}</span>
          {career.playedAt ? (
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{formatAgo(career.playedAt)}</span>
          ) : null}
        </span>
        <span>
          <Badge className={CAUTION_ACCENT}>{t('careers.unreadable.chip')}</Badge>
        </span>
      </span>
    </button>
  );
};
