import { useTranslation } from 'react-i18next';

import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface MoneyAmountProps {
  /**
   * The amount, negative for money out.
   */
  amount: number;
  /**
   * Anything the caller adds, such as its size.
   */
  className?: string;
}

/**
 * An amount of money moved, signed and in the traffic light: green for money
 * in, red for money out, and a dash for none.
 */
export const MoneyAmount = ({ amount, className }: MoneyAmountProps) => {
  const { t } = useTranslation();
  const { formatMoney, formatSigned } = useFormat();

  if (amount === 0) return <span className={cn('text-muted-foreground', className)}>{t('common.dash')}</span>;

  // The sign comes from formatSigned so it is placed as the language places it,
  // and the amount from formatMoney so it carries the currency.
  const sign = formatSigned(Math.sign(amount)).replace(/\d/g, '');

  return (
    <span className={cn('font-semibold whitespace-nowrap tabular-nums', amount > 0 ? 'text-success' : 'text-destructive', className)}>
      {sign}
      {formatMoney(Math.abs(amount))}
    </span>
  );
};
