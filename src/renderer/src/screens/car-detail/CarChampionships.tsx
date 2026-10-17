import { ChevronRightIcon, TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { CarChampionship } from './types.ts';
import { useSlot } from '@/app';
import { DetailPanel } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { LadderChip } from '@/screens/championships';

interface CarChampionshipsProps {
  /**
   * Every championship racing the car, or null while the library loads.
   */
  championships: readonly CarChampionship[] | null;
}

/**
 * Which championships a car races in, each a link to its page, edged in the
 * discipline it enters at and chipped with where on the ladder and in which
 * class.
 */
export const CarChampionships = ({ championships }: CarChampionshipsProps) => {
  const { t } = useTranslation();
  const { mode } = useSlot();
  // Outside a career only the library's own page is routed.
  const championshipPath = (id: string): string => (
    mode === 'career' ? path.championship({ id }) : path.settingsChampionship({ id })
  );
  const { formatNumber } = useFormat();

  return (
    <DetailPanel
      title={t('cars.detail.racedIn')}
      icon={<TrophyIcon />}
      aside={championships === null ? null : (
        <span className="font-normal text-muted-foreground tabular-nums">{formatNumber(championships.length)}</span>
      )}
      className="flex flex-col pt-1"
    >
      {championships !== null && championships.length === 0 ? (
        <p className="pt-1.5 text-sm text-muted-foreground">{t('cars.detail.racedNone')}</p>
      ) : null}

      {championships?.map((championship) => (
        <Link
          key={championship.id}
          to={championshipPath(championship.id)}
          className="group grid grid-cols-[4px_minmax(0,1fr)_auto] items-center gap-x-3 border-t py-2.5 first:border-t-0"
        >
          {/* The edge wears the discipline's foreground hue, so it reads as a
              solid stripe rather than the pale chip fill. */}
          <i
            aria-hidden
            className={cn('self-stretch rounded-full bg-current', DISCIPLINE_ACCENT[championship.entries[0].ladder.discipline])}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-semibold group-hover:text-primary">{championship.name}</span>
            <div className="flex flex-wrap gap-1">
              {championship.entries.map((entry) => (
                <span key={entry.id} className="inline-flex items-center gap-1">
                  <LadderChip ladder={entry.ladder} />
                  {/* A class name is free text, so it stays neutral. */}
                  <Badge variant="secondary">{entry.name}</Badge>
                </span>
              ))}
            </div>
          </div>
          <ChevronRightIcon className="size-4 text-muted-foreground group-hover:text-primary" />
        </Link>
      ))}
    </DetailPanel>
  );
};
