import { ArrowDownIcon } from 'lucide-react';

import { InfoTip } from '@/components';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface FastestFirstProps {
  /**
   * Anything the caller adds, such as hiding it while the list runs across.
   */
  className?: string;
}

/**
 * The heading over a list of classes, saying its order is their pace: the
 * fastest first, slower down the list.
 */
export const FastestFirst = ({ className }: FastestFirstProps) => {
  const { t } = useKindTranslation();

  return (
    <div className={cn('flex items-center gap-1.5 px-0.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase', className)}>
      {t('editor.entries.fastestFirst')}
      <InfoTip text={t('editor.entries.fastestFirstTip')} />
      <span className="ml-auto flex items-center gap-0.5 font-medium tracking-normal normal-case">
        <ArrowDownIcon className="size-3" aria-hidden />
        {t('editor.entries.slower')}
      </span>
    </div>
  );
};
