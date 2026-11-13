import { useTranslation } from 'react-i18next';

import { describeLine } from './utils.ts';
import type { Career } from '../../../../shared/types';
import { LedgerBadge, MoneyAmount, SaleBadge } from '@/components';
import { useFormat } from '@/i18n';
import type { LedgerRow } from '@/lib/finances';
import { cn } from '@/lib/utils.ts';

interface LedgerTableProps {
  /**
   * The rows to list, newest first.
   */
  rows: readonly LedgerRow[];
  /**
   * The career, which names the editions its lines came from.
   */
  career: Career;
}

/**
 * A career's ledger, a line per change of its money: when, what kind, what it
 * was for - a car bought on sale saying what the sale took off - how much and
 * what the career held after. Its headings stay put
 * while its rows scroll beneath them.
 */
export const LedgerTable = ({ rows, career }: LedgerTableProps) => {
  const { t } = useTranslation();
  const format = useFormat();
  const { formatDayShort, formatMoney } = format;

  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <thead className="sticky top-0 z-10 bg-card text-xs text-muted-foreground">
        <tr>
          <th className="w-28 border-b px-4 py-2 text-left font-medium">{t('finances.table.date')}</th>
          <th className="w-44 border-b px-2 py-2 text-left font-medium">{t('finances.table.kind')}</th>
          <th className="border-b px-2 py-2 text-left font-medium">{t('finances.table.what')}</th>
          <th className="w-32 border-b px-2 py-2 text-right font-medium">{t('finances.table.amount')}</th>
          <th className="w-32 border-b px-4 py-2 text-right font-medium">{t('finances.table.balance')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ line, balance }) => {
          const { title, detail } = describeLine(line, career, t, format);

          return (
            <tr key={line.key} className={cn(line.kind === 'speed' && 'bg-muted/50')}>
              <td className="border-b px-4 py-2 whitespace-nowrap tabular-nums">{formatDayShort(line.date)}</td>
              <td className="border-b px-2 py-2"><LedgerBadge kind={line.kind} /></td>
              <td className="border-b px-2 py-2">
                <div className="flex items-center gap-2 font-medium">
                  {title}
                  {line.kind === 'purchase' && line.car?.off !== undefined ? (
                    <SaleBadge
                      deal={{ model: line.car.model, off: line.car.off, headline: line.car.headline === true }}
                    />
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">{detail}</div>
              </td>
              <td className="border-b px-2 py-2 text-right"><MoneyAmount amount={line.amount} /></td>
              <td className="border-b px-4 py-2 text-right text-muted-foreground tabular-nums">
                {formatMoney(balance)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
