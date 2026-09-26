import { useId } from 'react';

import { SWITCH_TRACK } from './constants.ts';
import { Switch } from '@/components/ui/switch.tsx';

interface RailSwitchProps {
  /**
   * What it narrows to, already translated.
   */
  label: string;
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
export const RailSwitch = ({ label, checked, onChange }: RailSwitchProps) => {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <label htmlFor={id} className="text-[13px]">{label}</label>
      <Switch id={id} checked={checked} className={SWITCH_TRACK} onCheckedChange={onChange} />
    </div>
  );
};
