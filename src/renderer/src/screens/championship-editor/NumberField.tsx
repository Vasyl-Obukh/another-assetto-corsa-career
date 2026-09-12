import { Input } from '@/components/ui/input.tsx';
import { Field, fromNumber, toNumber } from '@/screens/race';

interface NumberFieldProps {
  /**
   * The control's id, which is what ties the label to it.
   */
  id: string;
  /**
   * The already-translated label.
   */
  label: string;
  /**
   * An already-translated line under the control, when one is worth having.
   */
  hint?: string;
  /**
   * What the field is worth, or undefined when the championship says nothing.
   */
  value: number | undefined;
  /**
   * The lowest value allowed. Not always zero - allowedTyresOut says -1 for
   * "leave Assetto Corsa's own per-track default alone".
   */
  min?: number;
  /**
   * The highest value allowed.
   */
  max?: number;
  /**
   * What an empty box means, shown in grey - usually the default that applies
   * when the field says nothing.
   */
  placeholder?: string;
  /**
   * Whether the championship is locked, in which case nothing may change.
   */
  disabled?: boolean;
  /**
   * Called with the new value, or undefined when the box was emptied.
   * @param next What the field is now worth
   */
  onChange: (next: number | undefined) => void;
}

/**
 * The optional number every numeric field in a championship goes through.
 *
 * An empty box is `undefined`, which JSON.stringify drops, so a field the author
 * said nothing about stays unsaid. Zero is a real value - a fee of zero is free
 * to enter - so nothing here may fall back with `||`.
 */
export const NumberField = ({
  id, label, hint, value, min, max, placeholder, disabled, onChange,
}: NumberFieldProps) => (
  <Field id={id} label={label} hint={hint}>
    <Input
      id={id}
      type="number"
      min={min}
      max={max}
      placeholder={placeholder}
      value={fromNumber(value)}
      disabled={disabled}
      onChange={(event) => onChange(toNumber(event.target.value))}
    />
  </Field>
);
