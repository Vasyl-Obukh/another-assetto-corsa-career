import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmActions } from './ConfirmActions.tsx';
import { EligibilityField } from './EligibilityField.tsx';
import type { SetAside } from './types.ts';
import { withRoundEligibility } from './utils.ts';
import type { Championship, Eligibility, Round } from '../../../../shared/types';
import { ToggleRow } from '@/components';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';

interface RoundEligibilityDialogProps {
  /**
   * The championship, for the classes it runs and what each of them fields.
   */
  series: Championship;
  /**
   * The round whose overrides these are.
   */
  round: Round;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Names a car, for the ones the library could resolve.
   * @param model The car folder ID
   * @returns What to show for it
   */
  nameOf: (model: string) => string;
  /**
   * Called with the whole championship whenever an override changes.
   *
   * The championship rather than the round, because turning an override off can
   * orphan a pinned livery or a balance-of-performance row on the class entry.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
  /**
   * Called to commit what has been changed.
   */
  onConfirm: () => void;
  /**
   * Called to leave the round as it was.
   */
  onCancel: () => void;
}

/**
 * What each class drives at this round instead of its usual cars.
 *
 * Some fields change car with the track - IndyCar runs road, short-oval and
 * superspeedway kits as separate car folders across one season with one entry
 * list. Only the car varies: the calendar, the entry list and the standings
 * stay at championship level, which is why this is a round's override of a
 * class rather than a second class.
 */
export const RoundEligibilityDialog = ({
  series, round, locked, nameOf, onChange, onConfirm, onCancel,
}: RoundEligibilityDialogProps) => {
  const { t } = useTranslation();
  // What these changes took off each class, so turning an override back on
  // restores it. Lives as long as the dialog, which is how long a detour lasts.
  const [aside, setAside] = useState<SetAside>({});

  /**
   * Applies one class's override at this round.
   * @param entry Which class entry
   * @param eligibility The rule to apply, or null to stop overriding
   */
  const apply = (entry: string, eligibility: Eligibility | null): void => {
    const narrowed = withRoundEligibility(series, round.id, entry, eligibility, aside);
    setAside(narrowed.aside);
    onChange(narrowed.series);
  };

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onCancel(); }}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col gap-4 overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{round.name}</DialogTitle>
          <DialogDescription>{t('editor.roundEligibility.hint')}</DialogDescription>
        </DialogHeader>

        {series.entries.map((entry) => {
          const override = round.eligibility?.find((one) => one.entry === entry.id);

          return (
            <div key={entry.id} className="flex flex-col gap-3 border-b pb-4 last:border-b-0">
              <span className="font-medium">{entry.name}</span>

              <ToggleRow
                label={t('editor.roundEligibility.toggle')}
                value={override !== undefined}
                disabled={locked}
                // Seeded from the class's own rule: a round usually swaps a few
                // cars, and an empty list fields nothing.
                onChange={(on) => apply(entry.id, on ? entry.eligibility : null)}
              />

              {override ? (
                <EligibilityField
                  idPrefix={`round-${round.id}-${entry.id}`}
                  eligibility={override.eligibility}
                  locked={locked}
                  nameOf={nameOf}
                  onChange={(next) => apply(entry.id, next)}
                />
              ) : null}
            </div>
          );
        })}

        <ConfirmActions locked={locked} onConfirm={onConfirm} onCancel={onCancel} />
      </DialogContent>
    </Dialog>
  );
};
