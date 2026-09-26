import { useTranslation } from 'react-i18next';

import { ASSIST_MODES } from './constants.ts';
import { cn } from '@/lib/utils.ts';

interface ModeSegmentsProps {
  /**
   * The aid's name, for the group's accessible name.
   */
  label: string;
  /**
   * The mode in force.
   */
  value: number;
  /**
   * Picks a mode.
   * @param next The mode picked
   */
  onChange(next: number): void;
}

/**
 * Assetto Corsa's three modes for an aid - off, as the car has it, forced on -
 * side by side, since three is few enough to show them all.
 */
export const ModeSegments = ({ label, value, onChange }: ModeSegmentsProps) => {
  const { t } = useTranslation();

  return (
    <div role="radiogroup" aria-label={label} className="flex gap-0.5 rounded-lg border bg-background p-0.5">
      {ASSIST_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          role="radio"
          aria-checked={value === mode}
          className={cn(
            'flex-1 rounded-md px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground',
            value === mode && 'bg-primary text-primary-foreground hover:text-primary-foreground',
          )}
          onClick={() => onChange(mode)}
        >
          {t(`assistMode.${mode}`)}
        </button>
      ))}
    </div>
  );
};
