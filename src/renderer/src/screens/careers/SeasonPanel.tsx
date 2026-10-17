import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SEASON_ROWS } from './constants.ts';
import type { CareerSummaryEntry } from '../../../../shared/types';
import { Loading, Shimmer } from '@/components';
import { slots } from '@/lib/slots.ts';
import { LadderChip } from '@/screens/championships';

interface SeasonPanelProps {
  /**
   * The championships the career picked is in this season, or null while the
   * careers are read.
   */
  championships: readonly CareerSummaryEntry[] | null;
}

/**
 * What the career picked is racing this season, each with its discipline and
 * rung.
 */
export const SeasonPanel = ({ championships }: SeasonPanelProps) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <TrophyIcon className="size-4 text-muted-foreground" />
        {t('careers.thisSeason')}
      </h3>

      {championships === null ? (
        <Loading className="flex flex-col gap-2.5">
          {slots(SEASON_ROWS).map((at) => (
            <div key={at} className="flex items-center gap-2.5">
              <Shimmer className="h-5 w-32 rounded-md" />
              <Shimmer className="h-3.5 w-40" />
            </div>
          ))}
        </Loading>
      ) : null}

      {championships?.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('careers.thisSeasonEmpty')}</p>
      ) : null}

      {championships && championships.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {championships.map((one) => (
            <li key={one.series} className="flex items-center gap-2.5 text-sm">
              <LadderChip ladder={one.ladder} />
              <span className="truncate">{one.name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};
