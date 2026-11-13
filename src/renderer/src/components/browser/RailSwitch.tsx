import { useId } from 'react';

import { SWITCH_TRACK } from './constants.ts';
import { Switch } from '@/components/ui/switch.tsx';

interface RailSwitchProps {
  /**
   * What it narrows to, already translated.
   */
  label: string;
  /**
   * A short line under the label, already translated.
   */
  hint?: string;
  /**
   * Whether it is on.
   */
  checked: boolean;
  /**
   * Turns it on or off.
   * @param next Whether it is now on
   */
  onChange(next: boolean): void;
}

/**
 * A filter that is either on or off, as a line of the rail.
 */
export const RailSwitch = ({
  label, hint, checked, onChange,
}: RailSwitchProps) => {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <label htmlFor={id} className="flex flex-col text-[13px]">
        {label}
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </label>
      <Switch id={id} checked={checked} className={SWITCH_TRACK} onCheckedChange={onChange} />
    </div>
  );
};
