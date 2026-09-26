import type { ReactNode } from 'react';

import { Shimmer } from './Shimmer.tsx';
import { cn } from '@/lib/utils.ts';

interface SegmentsProps<T extends string> {
  /**
   * The group's accessible name.
   */
  label: string;
  /**
   * Every choice, in the order shown.
   */
  items: readonly {
    /**
     * What the choice is.
     */
    id: T;
    /**
     * Its already-translated label.
     */
    label: string;
    /**
     * An icon before the label, when it has one.
     */
    icon?: ReactNode;
    /**
     * A count after the label, when it has one - null for one still being
     * worked out, which holds its place with a shimmer.
     */
    count?: number | null;
  }[];
  /**
   * The choice in force.
   */
  value: T;
  /**
   * Picks a choice.
   * @param next The one picked
   */
  onChange: (next: T) => void;
}

/**
 * A handful of mutually exclusive choices side by side, the one in force filled.
 */
export const Segments = <T extends string>({
  label, items, value, onChange,
}: SegmentsProps<T>) => (
  <div role="radiogroup" aria-label={label} className="flex gap-0.5 rounded-lg border bg-card p-0.5">
    {items.map((item) => {
      const on = item.id === value;

      return (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={on}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground',
            'transition-colors hover:text-foreground [&_svg]:size-3.5',
            on && 'bg-primary text-primary-foreground hover:text-primary-foreground',
          )}
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          {item.label}
          {item.count === null ? <Shimmer className="h-2.5 w-4 opacity-70" /> : null}
          {item.count == null ? null : <span className="tabular-nums opacity-70">{item.count}</span>}
        </button>
      );
    })}
  </div>
);
