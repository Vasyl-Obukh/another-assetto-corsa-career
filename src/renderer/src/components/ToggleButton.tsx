import { SWITCH_TRACK } from './browser';
import { Switch } from '@/components/ui/switch.tsx';
import { CONTROL_WIDTH } from '@/lib/layout';

interface ToggleButtonProps {
  /**
   * The control's id, for a layout that binds a label to it.
   */
  id?: string;
  /**
   * What the control is switching, for a layout that has no bound label.
   */
  label?: string;
  /**
   * Whether it is on.
   */
  value: boolean;
  /**
   * Whether it cannot be changed just now.
   */
  disabled?: boolean;
  /**
   * Switches it.
   * @param next Whether it should now be on
   */
  onChange(next: boolean): void;
}

export const ToggleButton = ({
  id, label, value, disabled = false, onChange,
}: ToggleButtonProps) => (
  // The same switch every card in the app wears, held in a control-width box
  // so it starts at the left edge every other settings control shares.
  <span className={`${CONTROL_WIDTH} flex items-center`}>
    <Switch
      id={id}
      checked={value}
      aria-label={label}
      disabled={disabled}
      className={SWITCH_TRACK}
      onCheckedChange={onChange}
    />
  </span>
);
