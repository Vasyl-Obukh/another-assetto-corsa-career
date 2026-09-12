import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge.tsx';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';

interface CountBadgeProps {
  /**
   * What is being counted, as an icon.
   */
  icon: ReactNode;
  /**
   * How many there are. Nothing is shown for none.
   */
  count: number;
  /**
   * What the badge opens, already translated, for a screen reader.
   */
  label: string;
  /**
   * Whether it may be clicked - false under the same conditions as the menu
   * item it shortcuts.
   */
  disabled: boolean;
  /**
   * Called to open what the badge counts.
   */
  onClick: () => void;
  /**
   * What the tooltip says about them.
   */
  children: ReactNode;
}

/**
 * A count on a row that opens what it counts, with a summary on hover.
 *
 * A button so the tooltip is reachable from the keyboard; `relative z-10` keeps
 * it above the name's stretched hit area. Neutral, since a count is a number
 * rather than one of a closed set.
 */
export const CountBadge = ({
  icon, count, label, disabled, onClick, children,
}: CountBadgeProps) => {
  if (count === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="relative z-10 shrink-0"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          <Badge variant="secondary">
            {icon}
            {count}
          </Badge>
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
};
