import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SeatCar, Skin } from '../../../../shared/types';
import { CarPicker } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Field } from '@/screens/race';

interface SeatCarFieldProps {
  /**
   * Whether it goes without its label, for a table whose column heading says
   * what it is.
   */
  bare?: boolean;
  /**
   * The control's id, which is what ties the label to it.
   */
  id: string;
  /**
   * What the seat is pinned to, or undefined when it takes whatever the class
   * hands it.
   */
  car: SeatCar | undefined;
  /**
   * Every car the class may field at some point in the season, which is what
   * the picker is restricted to.
   */
  fieldable: readonly string[];
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
   * Called with what the seat is now pinned to, or undefined when it was
   * unpinned.
   * @param next The pin to apply
   */
  onChange: (next: SeatCar | undefined) => void;
}

/**
 * The car and livery one seat is pinned to.
 *
 * The editor is the only place either can be set: a shipped championship cannot
 * know which liveries a user's copy of a mod installs, so the app ships none
 * pinned and the lowering falls back to automatic assignment for a livery that
 * is not there.
 */
export const SeatCarField = ({
  id, car, fieldable, locked, nameOf, onChange, bare = false,
}: SeatCarFieldProps) => {
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);
  // Only a pick brings a livery's name back, so it is kept stamped with the car
  // and livery it was for - and ignored once the pin no longer matches.
  const [picked, setPicked] = useState<{ model: string; skin: Skin | null } | null>(null);

  const model = car?.model;
  const skin = car?.skin;
  const fresh = picked !== null && picked.model === model && picked.skin?.id === skin
    ? picked
    : null;
  const skinName = fresh === null ? skin : fresh.skin?.name;

  /**
   * What the button reads as: the pin, or where the car comes from otherwise.
   * @returns The already-translated label
   */
  const label = (): string => {
    if (model === undefined) return t('editor.seats.fromClass');
    if (skinName === undefined) return t('editor.seats.pinnedCar', { car: nameOf(model) });

    return t('editor.seats.pinned', { car: nameOf(model), skin: skinName });
  };

  const control = (
    <>
      <div className="flex items-center gap-1">
        {/* Disabled when the class names no cars: an empty `ids` is no filter at
            all, so the picker would open onto the whole library. */}
        <Button
          id={id}
          type="button"
          variant="outline"
          className="min-w-0 flex-1 shrink justify-start font-normal"
          // The whole pin on hover, for when a long livery name is cut short.
          title={label()}
          disabled={locked || fieldable.length === 0}
          onClick={() => setPicking(true)}
        >
          <span className="truncate">{label()}</span>
        </Button>

        {model === undefined ? null : (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('editor.seats.unpin')}
            disabled={locked}
            onClick={() => onChange(undefined)}
          >
            <XIcon />
          </Button>
        )}
      </div>

      {fieldable.length === 0 ? null : (
        <CarPicker
          open={picking}
          selectedId={model}
          selectedSkinId={skin}
          baseQuery={{ ids: [...fieldable] }}
          onOpenChange={setPicking}
          onPick={(chosen, chosenSkin) => {
            setPicked({ model: chosen.id, skin: chosenSkin });
            onChange({ model: chosen.id, skin: chosenSkin?.id });
          }}
        />
      )}
    </>
  );

  return bare ? control : (
    <Field id={id} label={t('editor.seats.car')}>{control}</Field>
  );
};
