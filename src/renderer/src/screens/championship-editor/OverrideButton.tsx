import type { ReactNode } from 'react';

import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { cn } from '@/lib/utils.ts';

interface OverrideButtonProps {
  /**
   * Its icon.
   */
  icon: ReactNode;
  /**
   * What it reads, already translated - the thing, or how much of it is set.
   */
  label: string;
  /**
   * Whether anything is set, which tints it so a row with its own settings
   * stands out down the column.
   */
  active: boolean;
  /**
   * Whether it cannot be pressed just now.
   */
  disabled: boolean;
  /**
   * Called to open what it sets.
   */
  onClick: () => void;
  /**
   * What is set, in a tooltip, or undefined where nothing is.
   */
  children?: ReactNode;
}

/**
 * A small button for something a row may set for itself, always there so
 * setting one is a click away, and tinted once something is set.
 */
export const OverrideButton = ({
  icon, label, active, disabled, onClick, children,
}: OverrideButtonProps) => {
  const button = (
    <button
      type="button"
      className={cn(
        'relative z-10 inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs whitespace-nowrap',
        'disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-3.5',
        active
          ? 'border-primary/40 bg-primary/5 text-foreground'
          : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );

  if (children === undefined) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
};
