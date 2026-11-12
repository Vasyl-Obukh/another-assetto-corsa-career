import { Rows3Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { cn } from '@/lib/utils.ts';

interface ApartMarkProps {
  /**
   * Anything the caller adds to the icon.
   */
  className?: string;
}

// Marks a qualifying whose classes each run on their own, its words on hover,
// wherever a list of sessions names one.
export const ApartMark = ({ className }: ApartMarkProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span role="img" aria-label={t('event.apart')} className={cn('inline-grid place-items-center', className)}>
          <Rows3Icon className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{t('event.apart')}</TooltipContent>
    </Tooltip>
  );
};
