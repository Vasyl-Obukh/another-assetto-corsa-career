import { useTranslation } from 'react-i18next';

import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface RatingChangeProps {
  /**
   * What a rating moved by, negative for a loss.
   */
  change: number;
  /**
   * Anything the caller adds, such as its size.
   */
  className?: string;
}

/**
 * A change of rating, signed and in the traffic light: green for a gain, red
 * for a loss, and a dash for none.
 */
export const RatingChange = ({ change, className }: RatingChangeProps) => {
  const { t } = useTranslation();
  const { formatSigned } = useFormat();

  if (change === 0) return <span className={cn('text-muted-foreground', className)}>{t('common.dash')}</span>;

  return (
    <span className={cn('font-semibold whitespace-nowrap tabular-nums', change > 0 ? 'text-success' : 'text-destructive', className)}>
      {formatSigned(change)}
    </span>
  );
};
