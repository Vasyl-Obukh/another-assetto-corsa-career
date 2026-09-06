import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SkinStep } from './SkinStep.tsx';
import type { Car, CarQuery, Skin } from '../../../../shared/types';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { CarBrowserBody } from '@/screens/car-browser';

interface CarPickerProps {
  /**
   * Whether the picker is showing.
   */
  open: boolean;
  /**
   * Folder ID of the car already chosen, when there is one.
   */
  selectedId?: string;
  /**
   * Folder name of the livery already chosen, when there is one.
   */
  selectedSkinId?: string;
  /**
   * A query the browser is narrowed by before the user filters anything.
   *
   * What restricts the picker to the cars a championship's class entry may
   * field. Omitted, the picker offers the whole library.
   */
  baseQuery?: CarQuery;
  /**
   * Called when the dialog opens or closes itself - Escape, the close button,
   * or a click outside.
   * @param open Whether it should now be showing
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the car and livery that were picked. The dialog closes itself
   * first.
   * @param car The chosen car
   * @param skin The chosen livery, or null when the car ships none
   */
  onPick: (car: Car, skin: Skin | null) => void;
}

export const CarPicker = ({
  open, selectedId, selectedSkinId, baseQuery, onOpenChange, onPick,
}: CarPickerProps) => {
  const { t } = useTranslation();

  // Which car's liveries are being chosen between, or null while the library is
  // showing. A one-livery car never sets this: confirming it would be a step
  // with only one answer.
  const [chosen, setChosen] = useState<Car | null>(null);

  const close = (next: boolean): void => {
    if (!next) setChosen(null);
    onOpenChange(next);
  };

  const pick = (car: Car, skin: Skin | null): void => {
    close(false);
    onPick(car, skin);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex h-[85vh] max-w-[min(90rem,calc(100vw-4rem))] flex-col gap-4 px-0 sm:max-w-[min(90rem,calc(100vw-4rem))]">
        <DialogHeader className="px-6">
          <DialogTitle>{chosen ? t('race.pick.skin') : t('race.pick.car')}</DialogTitle>
          <DialogDescription>
            {chosen ? t('race.pick.skinHint') : t('race.pick.carHint')}
          </DialogDescription>
        </DialogHeader>

        {/* The browser paints its own scroller, so this only has to give it a
            height to fill and a minimum of zero to shrink into. The second step
            is laid over it rather than swapped for it: unmounting the browser
            would throw away the filters and the scroll offset the user was at,
            and going back would land them at the top of the whole library. It
            needs a z-index of its own: the browser's toolbar is sticky at z-10,
            so being later in the DOM is not enough to cover it. */}
        <div className="relative min-h-0 flex-1">
          <div className="h-full" inert={chosen !== null}>
            <CarBrowserBody
              selectedId={selectedId}
              baseQuery={baseQuery}
              onSelect={(car) => {
                const [only] = car.skins;
                // A car with no livery at all is refused at launch by
                // race.car.noSkins rather than here, which is where every other
                // "that cannot race" answer is given.
                if (car.skins.length < 2) pick(car, only ?? null);
                else setChosen(car);
              }}
            />
          </div>

          {chosen ? (
            <div className="absolute inset-0 z-20 bg-background">
              <SkinStep
                car={chosen}
                selectedId={selectedSkinId}
                onBack={() => setChosen(null)}
                onPick={(skin) => pick(chosen, skin)}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
