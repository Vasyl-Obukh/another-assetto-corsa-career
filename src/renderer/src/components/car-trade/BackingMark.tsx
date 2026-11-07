import { useTranslation } from 'react-i18next';

import { SparkleMark } from './SparkleMark.tsx';
import { useFormat } from '@/i18n';

interface BackingMarkProps {
  /**
   * The sponsor who can pay.
   */
  sponsor: string;
  /**
   * What it can pay.
   */
  amount: number;
  /**
   * Anything the caller adds.
   */
  className?: string;
}

// The sparkle beside a price saying who can pay part of it and how much.
export const BackingMark = ({ sponsor, amount, className }: BackingMarkProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();

  return <SparkleMark text={t('trade.backing.mark', { sponsor, amount: formatMoney(amount) })} className={className} />;
};
