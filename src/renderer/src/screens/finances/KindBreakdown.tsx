import { useTranslation } from 'react-i18next';

import type { LedgerLine } from '../../../../shared/types';
import { MoneyAmount } from '@/components';
import { LEDGER_BAR } from '@/lib/accents';
import { kindTotals } from '@/lib/finances';
import { cn } from '@/lib/utils.ts';

interface KindBreakdownProps {
  /**
   * The lines it weighs.
   */
  lines: readonly LedgerLine[];
}

/**
 * Where the money came from and went, a bar per kind of line weighed against
 * the largest.
 */
export const KindBreakdown = ({ lines }: KindBreakdownProps) => {
  const { t } = useTranslation();
  const totals = kindTotals(lines);
  const most = Math.max(1, ...totals.map((one) => Math.abs(one.amount)));

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold">{t('finances.breakdown')}</h2>
      {totals.length === 0 ? <p className="text-sm text-muted-foreground">{t('finances.nothing')}</p> : null}
      {totals.map((one) => (
        <div key={one.kind} className="grid grid-cols-[8rem_minmax(0,1fr)_6rem] items-center gap-3 text-sm">
          <span className="truncate">{t(`finances.kind.${one.kind}`)}</span>
          <span className="h-2 overflow-hidden rounded-full bg-muted">
            <span
              className={cn('block h-full rounded-full', LEDGER_BAR[one.kind])}
              style={{ width: `${Math.round((Math.abs(one.amount) / most) * 100)}%` }}
            />
          </span>
          <MoneyAmount amount={one.amount} className="text-right" />
        </div>
      ))}
    </section>
  );
};
