import { CheckIcon } from 'lucide-react';

import { NationFlag } from '@/components';
import { cn } from '@/lib/utils.ts';

interface NationOptionProps {
  /**
   * The option's element id, which the search box points at while it is the
   * one the arrow keys are on.
   */
  id: string;
  /**
   * The nation it picks, or undefined for the option that clears the pick.
   */
  code: string | undefined;
  /**
   * What it reads as, already translated.
   */
  label: string;
  /**
   * How many teams and seats of the championship already race under it, where
   * that is worth saying.
   */
  count?: number;
  /**
   * The flag drawn for the option that clears the pick, faded - the team's,
   * which is what clearing it leaves the seat under.
   */
  fallback?: string;
  /**
   * Whether it is what the picker holds now.
   */
  selected: boolean;
  /**
   * Whether the arrow keys are on it.
   */
  active: boolean;
  /**
   * Called when the pointer moves onto it, so the keys carry on from there.
   */
  onHover: () => void;
  /**
   * Called to pick it.
   */
  onPick: () => void;
}

/**
 * One nation in the picker's list: its flag, its name, how often the
 * championship already uses it and its code.
 */
export const NationOption = ({
  id, code, label, count, fallback, selected, active, onHover, onPick,
}: NationOptionProps) => (
  <div
    id={id}
    role="option"
    aria-selected={selected}
    tabIndex={-1}
    className={cn(
      'flex cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm',
      active && 'bg-accent',
      selected && 'font-semibold',
    )}
    onMouseMove={onHover}
    // Down rather than click, so the search box keeps its focus.
    onMouseDown={(event) => {
      event.preventDefault();
      onPick();
    }}
  >
    <CheckIcon className={cn('size-3.5 shrink-0 text-primary', !selected && 'invisible')} />
    <NationFlag code={code ?? fallback} dim={code === undefined} />
    <span className={cn('min-w-0 truncate', code === undefined && 'text-muted-foreground')}>{label}</span>
    {count === undefined ? null : (
      <span className="rounded-full bg-muted px-1.5 text-[11px] font-normal text-muted-foreground tabular-nums">
        {count}
      </span>
    )}
    {code === undefined ? null : (
      <span className="ml-auto text-[11px] font-semibold tracking-wide text-muted-foreground">{code}</span>
    )}
  </div>
);
