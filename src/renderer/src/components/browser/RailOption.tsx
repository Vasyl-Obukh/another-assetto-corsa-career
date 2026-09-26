import {
  CheckIcon, ChevronDownIcon, ChevronRightIcon, MinusIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Shimmer } from '@/components/Shimmer.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface RailOptionProps {
  /**
   * What it reads as, already translated.
   */
  label: string;
  /**
   * How many entries carry it under the other filters, or null while that is
   * still being read.
   */
  count: number | null;
  /**
   * Whether it is picked.
   */
  checked: boolean;
  /**
   * Whether something under it is picked although it is not, drawn as a dash.
   */
  partial?: boolean;
  /**
   * Drawn before the label - a flag, a coloured dot.
   */
  lead?: ReactNode;
  /**
   * Whether it sits one level down a tree.
   */
  nested?: boolean;
  /**
   * Whether what is under it is showing, for a value with something under it.
   */
  expanded?: boolean;
  /**
   * Shows or hides what is under it, for a value with something under it.
   */
  onExpand?(): void;
  /**
   * Whether to leave the expander's room empty, so a value with nothing under
   * it lines up with its siblings in a tree.
   */
  spacer?: boolean;
  /**
   * Picks it, or lifts the pick.
   */
  onToggle(): void;
}

/**
 * One value of a filter list: a tick, what it is and how many carry it.
 */
export const RailOption = ({
  label, count, checked, partial = false, lead, nested = false, expanded = false, onExpand, spacer = false,
  onToggle,
}: RailOptionProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const mixed = partial && !checked;

  return (
    <div className={cn('flex items-center', nested && 'pl-5')}>
      {spacer ? <span aria-hidden className="-ml-1.5 w-5 shrink-0" /> : null}
      {onExpand === undefined ? null : (
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={t(expanded ? 'browse.collapse' : 'browse.expand', { label })}
          className="-ml-1.5 grid size-5 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={onExpand}
        >
          {expanded ? <ChevronDownIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
        </button>
      )}

      <button
        type="button"
        role="checkbox"
        aria-checked={mixed ? 'mixed' : checked}
        className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left text-[13px] hover:bg-accent"
        onClick={onToggle}
      >
        <span
          aria-hidden
          className={cn(
            'grid size-3.5 shrink-0 place-items-center rounded-[4px] border border-foreground/30',
            checked && 'border-primary bg-primary text-primary-foreground',
            mixed && 'border-primary bg-primary/20 text-primary',
          )}
        >
          {checked ? <CheckIcon className="size-2.5" strokeWidth={3} /> : null}
          {mixed ? <MinusIcon className="size-2.5" strokeWidth={3} /> : null}
        </span>
        {lead}
        <span className="min-w-0 flex-1 truncate" title={label}>{label}</span>
        {count === null ? <Shimmer className="h-2.5 w-4" /> : (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatNumber(count)}</span>
        )}
      </button>
    </div>
  );
};
