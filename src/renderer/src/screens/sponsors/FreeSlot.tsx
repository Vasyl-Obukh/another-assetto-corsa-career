import { SparklesIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SponsorSlot } from '../../../../shared/types';
import { cn } from '@/lib/utils.ts';

interface FreeSlotProps {
  /**
   * Which slot is free.
   */
  slot: SponsorSlot;
}

/**
 * A slot the career holds with no sponsor in it.
 */
export const FreeSlot = ({ slot }: FreeSlotProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex min-h-48 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-t-4 p-6 text-center text-sm text-muted-foreground',
        slot === 'main' ? 'border-t-sponsor-solid' : 'border-t-partner-solid',
      )}
    >
      <SparklesIcon className={cn('size-5', slot === 'main' ? 'text-sponsor-foreground' : 'text-partner-foreground')} />
      <span className="font-semibold text-foreground">{t(`sponsors.free.${slot}`)}</span>
      <span>{t('sponsors.free.hint')}</span>
    </div>
  );
};
