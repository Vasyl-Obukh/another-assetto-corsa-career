import { InfoIcon } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { cn } from '@/lib/utils.ts';

interface InfoTipProps {
  /**
   * What the tooltip says, already translated.
   */
  text: string;
  /**
   * Anything the caller adds to the icon.
   */
  className?: string;
}

// An info mark beside a label, saying on hover the one thing the label cannot.
export const InfoTip = ({ text, className }: InfoTipProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={text}
        className={cn('inline-grid place-items-center rounded-full text-muted-foreground hover:text-foreground', className)}
      >
        <InfoIcon className="size-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent className="max-w-64">{text}</TooltipContent>
  </Tooltip>
);
