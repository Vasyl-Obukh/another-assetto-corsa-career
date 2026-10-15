import { cn } from '@/lib/utils.ts';

interface RuleStepsProps {
  /**
   * Every choice the editor offers.
   */
  options: readonly number[];
  /**
   * The one the rules state, or the one an unset rule races at.
   */
  value: number;
  /**
   * Whether the rules leave it to Assetto Corsa, which lights the choice muted.
   */
  unset: boolean;
  /**
   * What a choice is called.
   * @param option The choice
   * @returns Its label
   */
  labelOf: (option: number) => string;
}

// The editor's choices for a rule, read-only, with the one in force lit - so a
// rule reads the same where it is set and where it is looked up. Neutral on
// purpose: a count of seconds or wheels is not one of a set any screen colours.
export const RuleSteps = ({
  options, value, unset, labelOf,
}: RuleStepsProps) => (
  <span className="inline-flex w-fit flex-wrap gap-0.5 rounded-lg bg-muted p-0.5">
    {(options.includes(value) ? options : [...options, value].sort((a, b) => a - b)).map((option) => (
      <span
        key={option}
        className={cn(
          'rounded-md px-2.5 py-0.5 text-xs text-muted-foreground tabular-nums',
          option === value && !unset && 'bg-card font-semibold text-foreground shadow-xs',
          option === value && unset && 'ring-1 ring-border ring-inset',
        )}
      >
        {labelOf(option)}
      </span>
    ))}
  </span>
);
