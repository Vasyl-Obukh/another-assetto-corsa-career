import type { ReactNode } from 'react';

import { cn } from '@/lib/utils.ts';

interface RadioCardProps {
  /**
   * Whether it is the choice made.
   */
  checked: boolean;
  /**
   * Whether it cannot be chosen just now.
   */
  disabled?: boolean;
  /**
   * Classes for the card, such as its padding or a fade for a choice on offer
   * but out of reach.
   */
  className?: string;
  /**
   * Called to choose it.
   */
  onClick: () => void;
  /**
   * What the choice is, beside its radio.
   */
  children: ReactNode;
}

/**
 * One choice of a radio group as a card, its radio at the start, for a choice
 * that needs a line saying what it means.
 */
export const RadioCard = ({
  checked, disabled, className, onClick, children,
}: RadioCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={checked}
    disabled={disabled}
    className={cn(
      'flex items-start gap-2.5 rounded-lg border bg-card text-left transition-colors disabled:cursor-not-allowed',
      checked ? 'border-primary ring-1 ring-primary' : 'hover:bg-accent/50',
      className,
    )}
    onClick={onClick}
  >
    <span className={cn('mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border', checked ? 'border-primary' : 'border-input')}>
      {checked ? <span className="size-2 rounded-full bg-primary" /> : null}
    </span>
    {children}
  </button>
);
