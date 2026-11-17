import { SaveIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SAVE_STATUS_ID, STATUS_TICK_MS } from './constants.ts';
import { saveStatusLine } from './utils.ts';
import type { SaveSummary } from '../../../../shared/types';
import { Shimmer } from '@/components/Shimmer.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { NAV_FIT_LABEL, navFitItem } from '@/hooks';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface SaveStatusProps {
  /**
   * The open career's saves, newest first, or null while they are read.
   */
  saves: readonly SaveSummary[] | null;
  /**
   * Whether the time gives way to the icon alone, for a header out of room
   * once the nav is all icons.
   */
  compact?: boolean;
}

/**
 * When the career last saved, on the header's right: how long ago, kept current
 * as the minutes pass, and what the save was on hover. Short, since it shares
 * the header with the nav.
 */
export const SaveStatus = ({ saves, compact = false }: SaveStatusProps) => {
  const { t } = useTranslation();
  const { formatAgo } = useFormat();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), STATUS_TICK_MS);

    return () => clearInterval(timer);
  }, []);

  if (saves === null) return <Shimmer className="h-3 w-16" />;

  const newest = saves[0];
  if (!newest) return null;

  const line = saveStatusLine(newest, formatAgo(newest.savedAt, now), t);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="relative flex shrink-0 items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground"
          // The header hides the time only once the nav's labels are all gone.
          {...navFitItem(SAVE_STATUS_ID, compact, true)}
        >
          <SaveIcon className="size-3.5 text-success" aria-hidden />
          <span className="sr-only">{line}</span>
          {/* Hidden out of the flow rather than removed, so the header can
              still measure it as the minutes change its width. */}
          <span {...NAV_FIT_LABEL} aria-hidden className={cn(compact && 'invisible absolute')}>
            {formatAgo(newest.savedAt, now, 'narrow')}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{line}</TooltipContent>
    </Tooltip>
  );
};
