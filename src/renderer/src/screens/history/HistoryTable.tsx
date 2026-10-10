import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { EditionState, ResultCell } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { disciplineDot } from '@/lib/accents';
import { editionName } from '@/lib/edition-names';
import { path } from '@/lib/routes';
import type { EditionSummary } from '@/lib/season-review';
import { cn } from '@/lib/utils.ts';
import { LadderChip } from '@/screens/championships';

interface HistoryTableProps {
  /**
   * The season's editions, in calendar order.
   */
  editions: readonly EditionSummary[];
  /**
   * The year their season is.
   */
  year: number;
}

/**
 * One season's editions as a table: each championship with its rung, how it
 * stands and where the player ended, a row opening its review.
 */
export const HistoryTable = ({ editions, year }: HistoryTableProps) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border bg-card px-1.5 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="w-2 py-2" aria-hidden />
            <th className="px-2 py-2 font-medium">{t('history.col.championship')}</th>
            <th className="px-2 py-2 font-medium">{t('history.col.edition')}</th>
            <th className="px-2 py-2" aria-hidden />
            <th className="px-2 py-2 font-medium">{t('history.col.rounds')}</th>
            <th className="px-2 py-2 font-medium">{t('history.col.champion')}</th>
            <th className="px-2 py-2 text-right font-medium">{t('history.col.you')}</th>
            <th className="px-2 py-2 text-right font-medium">{t('history.col.points')}</th>
            <th className="w-6" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {editions.map((one) => {
            const to = path.championshipReview({ series: one.series, season: one.season, edition: one.edition });

            return (
              // The row is one link: the name's covers it whole, so a click anywhere
              // opens the review and the keyboard still meets a single stop.
              <tr
                key={`${one.series}-${one.edition}-${one.entry}`}
                className="group relative border-b transition-colors last:border-b-0 focus-within:bg-accent/50 hover:bg-accent/50"
              >
                <td className="py-2 pr-0 pl-1" aria-hidden>
                  <span className={cn('block h-7 w-1 rounded-full', disciplineDot(one.ladder))} />
                </td>
                <td className="px-2 py-2 font-semibold">
                  <Link
                    to={to}
                    className="group-hover:text-primary after:absolute after:inset-0 focus-visible:outline-none"
                  >
                    {one.name}
                  </Link>
                </td>
                <td className="px-2 py-2">
                  {/* Neutral on purpose: an edition's name is an identifier, not one of a set. */}
                  <Badge variant="secondary">
                    {editionName({ year, edition: one.edition, editions: one.editions }, t)}
                  </Badge>
                </td>
                <td className="px-2 py-2">
                  {one.ladder ? <LadderChip ladder={one.ladder} /> : null}
                </td>
                <td className="px-2 py-2 text-muted-foreground tabular-nums">
                  {t('history.rounds', { run: one.run, count: one.rounds })}
                </td>
                <td className="max-w-48 px-2 py-2">
                  <span className="flex items-center gap-1.5">
                    <EditionState summary={one} />
                    {/* Muted on purpose: withdrawing is a fact about the row, and the
                        rose a missed round wears is for the rounds themselves. */}
                    {one.withdrawn ? <span className="text-xs text-muted-foreground">{t('history.withdrawn')}</span> : null}
                  </span>
                </td>
                <td className="px-2 py-2 text-right">
                  <span className="inline-flex items-center gap-1.5">
                    {one.over ? null : <span className="text-xs text-muted-foreground">{t('history.leading')}</span>}
                    {one.position === null
                      ? <span className="text-muted-foreground">{t('home.noPosition')}</span>
                      : <ResultCell position={one.position} scored={one.points > 0} prefixed />}
                  </span>
                </td>
                <td className="px-2 py-2 text-right font-semibold tabular-nums">{one.points}</td>
                <td className="py-2 pr-2" aria-hidden>
                  <ChevronRightIcon className="size-4 text-muted-foreground group-hover:text-primary" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
