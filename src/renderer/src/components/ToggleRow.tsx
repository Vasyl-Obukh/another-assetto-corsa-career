import { FieldRow } from './FieldRow.tsx';
import { ToggleButton } from './ToggleButton.tsx';

interface ToggleRowProps {
  /**
   * The already-translated name of the thing being switched.
   */
  label: string;
  /**
   * An already-translated line under it, for anything the label cannot carry.
   */
  hint?: string;
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

export const ToggleRow = ({
  label, hint, value, disabled = false, onChange,
}: ToggleRowProps) => (
  <FieldRow label={label} hint={hint}>
    <ToggleButton label={label} value={value} disabled={disabled} onChange={onChange} />
  </FieldRow>
);
