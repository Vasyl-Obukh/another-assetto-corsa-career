import { MinusIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { fromNumber, toNumber } from '@/screens/race';

interface OffsetStepperProps {
  /**
   * The input's id, which a label points at.
   */
  id: string;
  /**
   * What the value is, already translated, for the buttons' labels.
   */
  label: string;
  /**
   * The offset, or undefined where nothing is stated.
   */
  value: number | undefined;
  /**
   * The furthest either way it may go.
   */
  limit: number;
  /**
   * The least it may be, when that is not simply the limit the other way -
   * ballast cannot go below none.
   */
  min?: number;
  /**
   * How far one press moves it.
   */
  step?: number;
  /**
   * Whether its sign is shown in colour. Off for an amount rather than an
   * offset, which has no direction to lean.
   */
  signed?: boolean;
  /**
   * The compact size a card's pair of them uses.
   */
  small?: boolean;
  /**
   * What an empty box shows, already translated.
   */
  placeholder?: string;
  /**
   * Whether it cannot be changed just now.
   */
  disabled?: boolean;
  /**
   * Called with the new offset, or undefined once the box is emptied.
   * @param next The offset
   */
  onChange: (next: number | undefined) => void;
}

/**
 * An offset over something else - stronger or weaker, heavier or lighter -
 * with a button either side and its sign in colour: green above what it is
 * laid over, red below, and a plus written before a step up. Typed into as
 * well as pressed, and held within its limits either way.
 */
export const OffsetStepper = ({
  id, label, value, limit, min = -limit, step = 1, signed = true, small = false, placeholder = '0',
  disabled, onChange,
}: OffsetStepperProps) => {
  const { t } = useKindTranslation();
  // What is being typed, kept as typed until the box is left - a lone minus
  // is no number yet, and must not be wiped while it is written.
  const [draft, setDraft] = useState<string | null>(null);

  /**
   * Holds a value within the limits.
   * @param next The value
   * @returns It, clamped
   */
  const held = (next: number): number => Math.max(min, Math.min(limit, next));

  /**
   * Moves the value by one press, held within its limit.
   * @param by How far, signed
   */
  const nudge = (by: number): void => {
    setDraft(null);
    onChange(held((value ?? 0) + by));
  };

  const shown = signed && value !== undefined && value > 0 ? `+${value}` : fromNumber(value);

  return (
    <div
      className={cn(
        'grid items-center overflow-hidden rounded-md border border-input bg-transparent shadow-xs dark:bg-input/30',
        small ? 'h-7 grid-cols-[1.5rem_minmax(0,1fr)_1.5rem]' : 'h-9 grid-cols-[2rem_minmax(0,1fr)_2rem]',
      )}
    >
      <button
        type="button"
        className="grid h-full place-items-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3.5"
        aria-label={t('editor.stepper.less', { label })}
        disabled={disabled || (value ?? 0) <= min}
        onClick={() => nudge(-step)}
      >
        <MinusIcon />
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={draft ?? shown}
        disabled={disabled}
        // Signed in colour: a plain number would not say which way it leans.
        className={cn(
          'h-full w-full min-w-0 bg-transparent text-center font-semibold tabular-nums outline-none placeholder:font-normal placeholder:text-muted-foreground disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
          small ? 'text-xs' : 'text-sm',
          signed && (value ?? 0) > 0 && 'text-success',
          signed && (value ?? 0) < 0 && 'text-destructive',
        )}
        onChange={(event) => {
          const text = event.target.value;
          setDraft(text);
          const next = toNumber(text);
          if (next !== undefined) onChange(held(Math.round(next)));
          else if (text.trim() === '') onChange(undefined);
        }}
        onBlur={() => setDraft(null)}
      />
      <button
        type="button"
        className="grid h-full place-items-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3.5"
        aria-label={t('editor.stepper.more', { label })}
        disabled={disabled || (value ?? 0) >= limit}
        onClick={() => nudge(step)}
      >
        <PlusIcon />
      </button>
    </div>
  );
};
