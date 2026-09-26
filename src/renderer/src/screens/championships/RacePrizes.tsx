import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PRIZE_ROWS_SHOWN } from './constants.ts';
import { PlaceBadge } from './PlaceBadge.tsx';
import { PurseHeading } from './PurseHeading.tsx';
import type { Purse } from './types.ts';
import type { Championship } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface RacePrizesProps {
  /**
   * The championship whose points and race prize money are laid out.
   */
  series: Championship;
  /**
   * Its purses that pay per race, classes paid the same sharing one.
   */
  purses: readonly Purse[];
  /**
   * Whether the grid is paid more than one way, which heads each column with
   * the classes it pays rather than one word.
   */
  split: boolean;
  /**
   * Anything the caller adds to the card, such as the columns it spans.
   */
  className?: string;
}

// What a place in one race is worth: a column per points system, then a column
// per purse. Ten places show, the rest one click away.
export const RacePrizes = ({
  series, purses, split, className,
}: RacePrizesProps) => {
  const { t } = useTranslation();
  const { formatMoney, formatNumber } = useFormat();
  const [all, setAll] = useState(false);
  const systems = series.pointsSystems;
  const places = Math.max(
    0,
    ...systems.map((points) => points.positions.length),
    ...purses.map((purse) => purse.prizes?.positions?.length ?? 0),
  );
  const shown = all ? places : Math.min(places, PRIZE_ROWS_SHOWN);

  const notes = systems.flatMap((points) => [
    points.qualifying?.length
      ? t('championships.detail.qualifyingPays', { points: points.qualifying.map(formatNumber).join(', ') })
      : null,
    points.fastestLap
      ? t('championships.detail.fastestLapPays', { points: formatNumber(points.fastestLap) })
      : null,
  ].filter((note) => note !== null).map((note) => (
    systems.length > 1 ? t('championships.detail.systemNote', { name: points.name, note }) : note
  )));

  return (
    <Card className={cn('gap-3 py-4', className)}>
      <CardHeader className="flex items-center justify-between px-4">
        <CardTitle>{t('championships.detail.pays')}</CardTitle>
        {places > PRIZE_ROWS_SHOWN ? (
          <Button variant="link" size="sm" className="h-auto px-0" onClick={() => setAll(!all)}>
            {all
              ? t('championships.detail.showFewer')
              : t('championships.detail.showAll', { count: places })}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="text-right text-xs text-muted-foreground">
                <th className="w-14 pb-2 text-left font-normal" aria-hidden />
                {systems.map((points) => (
                  <th key={points.id} className="pb-2 pl-3 font-normal">
                    {systems.length > 1 ? points.name : t('championships.detail.points')}
                  </th>
                ))}
                {purses.map((purse) => (
                  <th key={purse.classes.join()} className="pb-2 pl-3 font-normal">
                    {split
                      ? <PurseHeading classes={purse.classes} entries={series.entries} />
                      : t('championships.money.roundPrizes')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: shown }, (_, index) => (
                <tr key={index} className="border-t text-right">
                  <td className="py-1.5 text-left"><PlaceBadge place={index + 1} /></td>
                  {systems.map((points) => (
                    <td key={points.id} className="py-1.5 pl-3">
                      {points.positions[index] === undefined ? null : formatNumber(points.positions[index])}
                    </td>
                  ))}
                  {purses.map((purse) => {
                    const amount = purse.prizes?.positions?.[index];

                    return (
                      <td key={purse.classes.join()} className="py-1.5 pl-3 text-muted-foreground">
                        {amount === undefined ? null : formatMoney(amount)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {notes.length > 0 ? <p className="text-xs text-muted-foreground">{notes.join(' ')}</p> : null}
      </CardContent>
    </Card>
  );
};
