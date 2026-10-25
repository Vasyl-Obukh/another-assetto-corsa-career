import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { LadderCell } from './LadderCell.tsx';
import { LadderGrid } from './LadderGrid.tsx';
import { LadderRowHead } from './LadderRowHead.tsx';
import type { CareerLadder, Rung } from './types.ts';
import { disciplineKey, rungsAt } from './utils.ts';
import { DISCIPLINES } from '../../../../shared/constants';
import type { SeriesListing } from '../../../../shared/types';
import { DISCIPLINE_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface LadderBoardProps {
  /**
   * The championships to place, filtered and sorted.
   */
  listings: readonly SeriesListing[];
  /**
   * How many rungs the board runs to. Taken from the whole list rather than
   * the filtered one, so narrowing it never changes the board's shape.
   */
  depth: number;
  /**
   * Which rungs to stand, where a filter answers per class rather than per
   * championship - every rung of a championship shown when absent.
   */
  keepRung?: (rung: Rung) => boolean;
  /**
   * Where the career stands on the ladder, when there is a career: what each
   * discipline's row heads with, and which rungs are not open to it yet.
   */
  ladder?: CareerLadder;
}

// The career ladder itself: a column per tier, climbing left to right from the
// lowest rung to the top one, a row per discipline, and each championship on
// every rung one of its classes enters at.
export const LadderBoard = ({
  listings, depth, keepRung = () => true, ladder,
}: LadderBoardProps) => {
  const { t } = useTranslation();
  const tiers = Array.from({ length: depth }, (_, index) => depth - index);

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <LadderGrid tiers={tiers}>
        {DISCIPLINES.map((discipline) => {
          const count = listings.filter((listing) => listing.series.entries.some(
            (entry) => entry.ladder.discipline === discipline && keepRung({ listing, entry }),
          )).length;

          return (
            <Fragment key={discipline}>
              <div
                className={cn(
                  'flex flex-col gap-0.5 border-t px-3.5 py-3 font-semibold',
                  DISCIPLINE_ACCENT[discipline],
                )}
              >
                {t(disciplineKey(discipline))}
                <span className="text-xs font-normal opacity-75">
                  {t('championships.ladder.championships', { count })}
                </span>
                {ladder ? <LadderRowHead career={ladder.career} discipline={discipline} /> : null}
              </div>
              {tiers.map((tier) => (
                <LadderCell
                  key={tier}
                  rungs={rungsAt(listings, discipline, tier).filter(keepRung)}
                  locked={ladder ? tier < ladder.open[discipline] : false}
                  folded={ladder?.openOnly ?? false}
                  discipline={discipline}
                  tier={tier}
                />
              ))}
            </Fragment>
          );
        })}
      </LadderGrid>
    </div>
  );
};
