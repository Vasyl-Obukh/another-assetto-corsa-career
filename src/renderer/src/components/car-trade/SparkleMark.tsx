import { SparklesIcon } from 'lucide-react';

import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { cn } from '@/lib/utils.ts';

interface SparkleMarkProps {
  /**
   * What it says on hover, and to a screen reader.
   */
  text: string;
  /**
   * Anything the caller adds, such as a partner's colour over a main sponsor's.
   */
  className?: string;
}

// A sparkle beside a figure a sponsor changes, saying how on hover. Above a
// card's own link, and focusable, so the tooltip is reachable from the keyboard.
export const SparkleMark = ({ text, className }: SparkleMarkProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <span tabIndex={0} role="img" aria-label={text} className={cn('relative z-10 inline-flex shrink-0 text-sponsor-foreground', className)}>
        <SparklesIcon className="size-3.5" />
      </span>
    </TooltipTrigger>
    <TooltipContent>{text}</TooltipContent>
  </Tooltip>
);
