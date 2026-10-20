import { useTranslation } from 'react-i18next';

import { DOOR_ACCENT, DOOR_LINES } from './constants.ts';
import { Door } from './Door.tsx';
import type { Career } from '../../../../shared/types';
import { MoneyAmount } from '@/components';
import { useFormat } from '@/i18n';
import { ledgerRows, moneyFigures } from '@/lib/finances';
import { path } from '@/lib/routes';
import { describeLine } from '@/screens/finances';

interface FinancesDoorProps {
  /**
   * The career.
   */
  career: Career;
}

/**
 * Home's way into Finances, previewing what the career holds, what this season
 * has come to, and the ledger's newest lines.
 */
export const FinancesDoor = ({ career }: FinancesDoorProps) => {
  const { t } = useTranslation();
  const { formatMoney, formatNumber } = useFormat();
  const season = career.seasons.at(-1)?.index ?? 0;
  const figures = moneyFigures(ledgerRows(career.ledger), season);
  // What moved money, so a change of speed does not crowd a prize out.
  const latest = career.ledger.filter((line) => line.amount !== 0).slice(-DOOR_LINES).reverse();

  return (
    <Door
      to={path.finances()}
      accent={DOOR_ACCENT.finances}
      icon="finances"
      title={t('home.doors.finances.title')}
      hint={t('home.doors.finances.hint')}
      kicker={t('home.doors.finances.latest')}
    >
      <p className="flex items-baseline gap-2">
        <span className="text-xl font-semibold tabular-nums">{formatMoney(career.money)}</span>
        <span className="text-xs text-muted-foreground">
          <MoneyAmount amount={figures.earned + figures.spent} className="text-xs" />
          {' '}
          {t('home.doors.finances.season')}
        </span>
      </p>
      {latest.map((line) => (
        <p key={line.key} className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
          <span className="truncate text-muted-foreground">{describeLine(line, career, t, formatNumber).title}</span>
          <MoneyAmount amount={line.amount} className="text-sm" />
        </p>
      ))}
    </Door>
  );
};
