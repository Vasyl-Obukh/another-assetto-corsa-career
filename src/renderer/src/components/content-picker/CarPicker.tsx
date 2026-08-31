import { useTranslation } from 'react-i18next';

import type { Car } from '../../../../shared/types';
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
   * Called when the dialog opens or closes itself - Escape, the close button,
   * or a click outside.
   * @param open Whether it should now be showing
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the car that was picked. The dialog closes itself first.
   * @param car The chosen car
   */
  onPick: (car: Car) => void;
}

export const CarPicker = ({
  open, selectedId, onOpenChange, onPick,
}: CarPickerProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-[min(90rem,calc(100vw-4rem))] flex-col gap-4 px-0 sm:max-w-[min(90rem,calc(100vw-4rem))]">
        <DialogHeader className="px-6">
          <DialogTitle>{t('race.pick.car')}</DialogTitle>
          <DialogDescription>{t('race.pick.carHint')}</DialogDescription>
        </DialogHeader>

        {/* The browser paints its own scroller, so this only has to give it a
            height to fill and a minimum of zero to shrink into. */}
        <div className="min-h-0 flex-1">
          <CarBrowserBody
            selectedId={selectedId}
            onSelect={(car) => {
              onOpenChange(false);
              onPick(car);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
