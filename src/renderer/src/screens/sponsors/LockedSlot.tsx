import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { tierAccent, tierMetalKey } from '@/screens/championships';

interface LockedSlotProps {
  /**
   * The rung that opens it, 1 being the top.
   */
  rung: number;
  /**
   * The rating that reaches that rung.
   */
  rating: number;
}

/**
 * A partner slot still to open, in the grid beside the slots held, and the
 * rung that opens it.
 */
export const LockedSlot = ({ rung, rating }: LockedSlotProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <div className="hatched flex min-h-48 flex-col items-center justify-center gap-1.5 rounded-xl border p-6 text-center text-sm text-muted-foreground">
      <LockIcon className="size-5" />
      <span className="font-semibold">{t('sponsors.locked.slot')}</span>
      <Badge className={tierAccent(rung)}>{t(tierMetalKey(rung))}</Badge>
      <span>{t('sponsors.locked.opens', { rating: formatNumber(rating) })}</span>
    </div>
  );
};
