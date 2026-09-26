import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { ALL_TIERS, LADDER_SKELETON } from './constants.ts';
import { FormatStripSkeleton } from './FormatStripSkeleton.tsx';
import { LadderGrid } from './LadderGrid.tsx';
import { disciplineKey } from './utils.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import { Loading, Shimmer } from '@/components';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { slots } from '@/lib/slots.ts';
import { cn } from '@/lib/utils.ts';

/**
 * The ladder while the library is read: its real tier header and discipline
 * bands, in their colours, with championship cards still to come on the first
 * two rows.
 */
export const LadderSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Loading className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <LadderGrid tiers={ALL_TIERS}>
        {LADDER_SKELETON.map((rungs, row) => {
          const discipline = DISCIPLINES[row];

          return (
            <Fragment key={discipline}>
              <div className={cn('flex flex-col gap-1.5 border-t px-3.5 py-3 font-semibold', DISCIPLINE_ACCENT[discipline])}>
                {t(disciplineKey(discipline))}
                <Shimmer className="h-2.5 w-20 opacity-60" />
              </div>
              {rungs.map((cards, column) => (
                <div key={ALL_TIERS[column]} className="flex min-h-24 flex-col gap-2 border-t border-l p-2.5">
                  {slots(cards).map((at) => (
                    <div key={at} className="flex flex-col gap-2.5 rounded-lg border border-l-[3px] bg-background p-3">
                      <Shimmer className="my-0.5 h-3.5 w-4/5" />
                      <Shimmer className="h-5.5 w-12" />
                      <div className="flex items-center justify-between gap-2">
                        <Shimmer className="h-3 w-14" />
                        <FormatStripSkeleton />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </Fragment>
          );
        })}
      </LadderGrid>
    </Loading>
  );
};
