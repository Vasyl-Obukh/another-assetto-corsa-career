
import { RUNGS_OFFERED } from './constants.ts';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { TierMedal, tierMetalKey } from '@/screens/championships';

interface RungPickerProps {
  /**
   * The tier chosen, 1 being the top of a discipline.
   */
  tier: number;
  /**
   * Whether it cannot be changed just now.
   */
  disabled?: boolean;
  /**
   * Called with the tier chosen.
   * @param next The tier
   */
  onChange: (next: number) => void;
}

/**
 * Which rung of the ladder a class enters at, as the medals themselves -
 * bottom rung first, the way the Championships page lays the ladder out.
 */
export const RungPicker = ({
  tier, disabled, onChange,
}: RungPickerProps) => {
  const { t } = useKindTranslation();

  return (
    <div role="radiogroup" aria-label={t('editor.entries.rung')} className="flex flex-wrap gap-1">
      {RUNGS_OFFERED.map((rung) => (
        <button
          key={rung}
          type="button"
          role="radio"
          aria-checked={tier === rung}
          disabled={disabled}
          className={cn(
            'flex w-18 flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 text-xs text-muted-foreground disabled:cursor-not-allowed',
            tier === rung ? 'bg-primary/10 text-foreground ring-2 ring-primary' : 'hover:bg-accent',
          )}
          onClick={() => onChange(rung)}
        >
          <TierMedal tier={rung} />
          {t(tierMetalKey(rung))}
        </button>
      ))}
    </div>
  );
};
