
import { MIN_TIER, RUNGS_OFFERED } from './constants.ts';
import { Input } from '@/components/ui/input.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { TierMedal, tierMetalKey } from '@/screens/championships';
import { fromNumber, toNumber } from '@/screens/race';

interface RungPickerProps {
  /**
   * Prefix for the controls' ids.
   */
  idPrefix: string;
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
 * bottom rung first, the way the Championships page lays the ladder out - and
 * a box for a rung deeper than the medals go.
 */
export const RungPicker = ({
  idPrefix, tier, disabled, onChange,
}: RungPickerProps) => {
  const { t } = useKindTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
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
      <label htmlFor={`${idPrefix}-tier`} className="flex items-center gap-2 text-xs text-muted-foreground">
        {t('editor.entries.deeper')}
        <Input
          id={`${idPrefix}-tier`}
          type="number"
          min={MIN_TIER}
          className="h-8 w-16 text-right"
          value={fromNumber(tier)}
          disabled={disabled}
          // A tier is required, so an emptied box keeps the number rather than
          // writing a class with no rung at all.
          onChange={(event) => onChange(toNumber(event.target.value) ?? tier)}
        />
      </label>
    </div>
  );
};
