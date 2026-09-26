import { useTranslation } from 'react-i18next';

import { ROUND_MARK } from './constants.ts';
import type { RoundMark } from './types.ts';
import { cn } from '@/lib/utils.ts';

// What each colour of a championship's progress bar means, at the foot of the list.
export const MarkLegend = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t px-2 pt-2.5 text-xs text-muted-foreground">
      {(Object.keys(ROUND_MARK) as RoundMark[]).map((mark) => (
        <span key={mark} className="flex items-center gap-1.5">
          <span className={cn('size-2 rounded-full', ROUND_MARK[mark], mark === 'later' && 'ring-1 ring-border')} />
          {t(`home.mark.${mark}`)}
        </span>
      ))}
    </footer>
  );
};
