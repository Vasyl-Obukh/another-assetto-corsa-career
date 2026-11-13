import { PlusIcon } from 'lucide-react';

import { cn } from '@/lib/utils.ts';

interface AddButtonProps {
  /**
   * What it adds, already translated.
   */
  label: string;
  /**
   * Whether nothing may be added just now.
   */
  disabled?: boolean;
  /**
   * Its size and placement, which each list sets for itself.
   */
  className?: string;
  /**
   * Called to add one.
   */
  onClick: () => void;
}

/**
 * The editor's way to add one more of a list - a team, a class, a round, a
 * format, a points system: a dashed outline that lights up in the primary
 * colour, sized by the list it ends.
 */
export const AddButton = ({
  label, disabled, className, onClick,
}: AddButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-2 rounded-lg border border-dashed text-sm font-medium text-muted-foreground transition-colors',
      'hover:border-primary hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
  >
    <PlusIcon className="size-4" />
    {label}
  </button>
);
