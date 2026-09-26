import { cn } from '@/lib/utils.ts';

interface ChoiceChipsProps<T extends string | number> {
  /**
   * What the group is announced as, already translated.
   */
  label: string;
  /**
   * Every choice, in the order offered.
   */
  options: readonly T[];
  /**
   * The choice made.
   */
  value: T;
  /**
   * Names one choice.
   * @param option The choice
   * @returns Its label, already translated
   */
  labelOf: (option: T) => string;
  /**
   * The colour a chosen option wears, for a closed set with a colour family of
   * its own. Left out, the chosen option is lifted rather than tinted.
   * @param option The choice
   * @returns Its accent classes
   */
  accentOf?: (option: T) => string;
  /**
   * Whether it cannot be changed just now.
   */
  disabled?: boolean;
  /**
   * Called with the choice made.
   * @param next The choice
   */
  onChange: (next: T) => void;
}

/**
 * A handful of choices shown all at once, for a set short enough that a select
 * would hide what the options are.
 */
export const ChoiceChips = <T extends string | number>({
  label, options, value, labelOf, accentOf, disabled, onChange,
}: ChoiceChipsProps<T>) => (
  <div role="radiogroup" aria-label={label} className="inline-flex w-fit flex-wrap gap-0.5 rounded-lg border p-0.5">
    {options.map((option) => {
      const chosen = option === value;

      return (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={chosen}
          disabled={disabled}
          className={cn(
            'rounded-md px-2.5 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            !chosen && 'text-muted-foreground hover:bg-accent hover:text-foreground',
            chosen && (accentOf?.(option) ?? 'bg-card text-foreground shadow-sm ring-1 ring-border'),
          )}
          onClick={() => onChange(option)}
        >
          {labelOf(option)}
        </button>
      );
    })}
  </div>
);
