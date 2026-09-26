import type { ReactNode } from 'react';

import { cn } from '@/lib/utils.ts';

interface ChoiceTileProps {
  /**
   * A small picture of what choosing it looks like.
   */
  preview: ReactNode;
  /**
   * The line under the picture naming it.
   */
  children: ReactNode;
  /**
   * Whether it is the current choice.
   */
  selected: boolean;
  /**
   * Makes it the current choice.
   */
  onSelect(): void;
}

/**
 * One option of a choice shown as pictures rather than listed - a theme, a
 * language - so the choice reads before its name does.
 */
export const ChoiceTile = ({
  preview, children, selected, onSelect,
}: ChoiceTileProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    className={cn(
      'flex w-38 flex-col gap-1.5 rounded-lg border bg-card p-1.5 text-left hover-outline',
      'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
      selected && 'border-primary ring-1 ring-primary',
    )}
    onClick={onSelect}
  >
    <span aria-hidden className="block h-15 overflow-hidden rounded-md border">{preview}</span>
    <span className="flex items-center gap-1.5 px-1 pb-0.5 text-sm font-medium">{children}</span>
  </button>
);
