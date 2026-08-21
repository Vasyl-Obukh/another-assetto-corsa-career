import { CheckIcon } from 'lucide-react';

import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface FacetOptionProps {
  /**
   * The value, as the mod author wrote it.
   */
  value: string;
  /**
   * How many entries carry it, given every other filter.
   */
  count: number;
  /**
   * Whether it is currently picked.
   */
  selected: boolean;
  /**
   * Picks or unpicks it.
   * @param value The value that was clicked
   */
  onToggle(value: string): void;
}

export const FacetOption = ({
  value,
  count,
  selected,
  onToggle,
}: FacetOptionProps) => {
  const { formatNumber } = useFormat();

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={cn(
        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
        'hover:bg-accent hover:text-accent-foreground',
      )}
      onClick={() => onToggle(value)}
    >
      <CheckIcon className={cn('size-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')} />
      <span className="min-w-0 flex-1 truncate" title={value}>{value}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{formatNumber(count)}</span>
    </button>
  );
};
