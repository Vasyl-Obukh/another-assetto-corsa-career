
import { EligibilityField } from './EligibilityField.tsx';
import type { Championship, Eligibility, Round } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { Switch } from '@/components/ui/switch.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { TierMedal } from '@/screens/championships';

interface RoundCarsProps {
  /**
   * The championship, for its classes.
   */
  series: Championship;
  /**
   * The round being edited.
   */
  round: Round;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Names a car, for the ones the library could resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called with a class's cars at this round, or null to run its season's.
   * @param entry The class entry's id
   * @param eligibility The rule to apply, or null
   */
  onChange: (entry: string, eligibility: Eligibility | null) => void;
}

/**
 * Which cars each class runs at this round: its season's, or others for this
 * round alone. Only the car changes - the seats, the teams and the standings
 * stay the championship's.
 */
export const RoundCars = ({
  series, round, locked, nameOf, onChange,
}: RoundCarsProps) => {
  const { t } = useKindTranslation();
  const { catalogue } = useClasses();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">{t('editor.roundEligibility.hint')}</p>
      {series.entries.map((entry) => {
        const override = round.eligibility?.find((one) => one.entry === entry.id);
        const season = entry.eligibility.kind === 'spec'
          ? carSpecName(entry.eligibility.spec, catalogue)
          : t('editor.entries.carCount', { count: entry.eligibility.cars.length });
        const switchId = `round-${round.id}-${entry.id}-swap`;

        return (
          <div key={entry.id} className={cn('overflow-hidden rounded-lg border', override && 'border-primary/50')}>
            <div className="flex flex-wrap items-center gap-2.5 px-3 py-2.5">
              <TierMedal tier={entry.ladder.tier} className="size-7 text-xs" />
              <b className="min-w-16 text-sm">{entry.name}</b>
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {t('editor.roundEligibility.season', { cars: season })}
              </span>
              <label htmlFor={switchId} className="flex items-center gap-2 text-xs">
                {override ? t('editor.roundEligibility.toggle') : t('editor.roundEligibility.seasonCars')}
                <Switch
                  id={switchId}
                  checked={override !== undefined}
                  disabled={locked}
                  // Seeded from the class's own rule: a round usually swaps a
                  // few cars, and an empty list fields nothing.
                  onCheckedChange={(on) => onChange(entry.id, on ? entry.eligibility : null)}
                />
              </label>
            </div>
            {override ? (
              <div className="border-t bg-primary/5 p-3">
                <EligibilityField
                  idPrefix={`round-${round.id}-${entry.id}`}
                  eligibility={override.eligibility}
                  locked={locked}
                  nameOf={nameOf}
                  onChange={(next) => onChange(entry.id, next)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
