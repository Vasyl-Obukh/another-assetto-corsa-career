import { useId } from 'react';

import { SWITCH_TRACK } from './browser/index.ts';
import { Shimmer } from './Shimmer.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { cn } from '@/lib/utils.ts';

interface SwitchTileProps {
  /**
   * What the switch turns on.
   */
  label: string;
  /**
   * A line under the label saying what that means.
   */
  hint?: string;
  /**
   * Whether it is on, or null while that is still being read - the tile is
   * drawn with its label and a placeholder where the switch will be.
   */
  checked: boolean | null;
  /**
   * Whether it cannot be switched just now.
   */
  disabled?: boolean;
  /**
   * Whether a tile that is on is tinted the colour its switch already is, for a
   * grid of them where which are on is the point.
   */
  tinted?: boolean;
  /**
   * Switches it.
   * @param next Whether it is now on
   */
  onChange(next: boolean): void;
}

/**
 * A setting that is one switch, as a bordered tile with its label beside it -
 * the whole tile is the label, so clicking anywhere on it switches.
 */
export const SwitchTile = ({
  label, hint, checked, disabled = false, tinted = false, onChange,
}: SwitchTileProps) => {
  const id = useId();

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5 transition-colors',
        tinted && checked === true && 'border-success/45 bg-success/6',
      )}
    >
      <label htmlFor={id} className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </label>
      {checked === null ? <Shimmer className="h-[1.15rem] w-8 rounded-full" /> : (
        <Switch
          id={id}
          checked={checked}
          disabled={disabled}
          className={SWITCH_TRACK}
          onCheckedChange={onChange}
        />
      )}
    </div>
  );
};
