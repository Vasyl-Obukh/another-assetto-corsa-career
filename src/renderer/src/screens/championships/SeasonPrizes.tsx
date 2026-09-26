import { useTranslation } from 'react-i18next';

import { PlaceBadge } from './PlaceBadge.tsx';
import { PurseHeading } from './PurseHeading.tsx';
import type { Purse } from './types.ts';
import type { ClassEntry } from '../../../../shared/types';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface SeasonPrizesProps {
  /**
   * The purses that pay out on the final standings.
   */
  purses: readonly Purse[];
  /**
   * Every class of the championship, for the purse headings.
   */
  entries: readonly ClassEntry[];
  /**
   * Whether the grid is paid more than one way.
   */
  split: boolean;
  /**
   * Anything the caller adds to the card, such as the columns it spans.
   */
  className?: string;
}

// What the final standings pay, in the race table's shape without the points.
export const SeasonPrizes = ({
  purses, entries, split, className,
}: SeasonPrizesProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const places = Math.max(0, ...purses.map((purse) => purse.prizes?.standings?.length ?? 0));

  return (
    <Card className={cn('gap-3 py-4', className)}>
      <CardHeader className="px-4">
        <CardTitle>{t('championships.detail.seasonPays')}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-4">
        <table className="w-full border-collapse text-sm tabular-nums">
          <thead>
            <tr className="text-right text-xs text-muted-foreground">
              <th className="w-14 pb-2 text-left font-normal" aria-hidden />
              {purses.map((purse) => (
                <th key={purse.classes.join()} className="pb-2 pl-3 font-normal">
                  {split
                    ? <PurseHeading classes={purse.classes} entries={entries} />
                    : t('championships.money.seasonPrizes')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: places }, (_, index) => (
              <tr key={index} className="border-t text-right">
                <td className="py-1.5 text-left"><PlaceBadge place={index + 1} /></td>
                {purses.map((purse) => {
                  const amount = purse.prizes?.standings?.[index];

                  return (
                    <td key={purse.classes.join()} className="py-1.5 pl-3">
                      {amount === undefined ? null : formatMoney(amount)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
