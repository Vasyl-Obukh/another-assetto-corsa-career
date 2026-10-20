import { WalletIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useFormat } from '@/i18n';
import { path } from '@/lib/routes';

interface BalanceLinkProps {
  /**
   * The money the career holds.
   */
  money: number;
}

/**
 * The career's money at the right of the header, on every page of it, and the
 * way into its finances from anywhere.
 */
export const BalanceLink = ({ money }: BalanceLinkProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return (
    <Link
      to={path.finances()}
      title={t('finances.open')}
      className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border bg-card px-2.5 text-sm font-semibold tabular-nums transition-colors hover:border-primary/45"
    >
      <WalletIcon className="size-4 text-success" />
      {formatMoney(money)}
    </Link>
  );
};
