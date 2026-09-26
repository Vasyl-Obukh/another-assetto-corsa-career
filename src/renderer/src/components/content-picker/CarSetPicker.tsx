import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { BrowserToggle } from '@/components/browser/index.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useFormat } from '@/i18n';
import { CarBrowserBody } from '@/screens/car-browser';

interface CarSetPickerProps {
  /**
   * The dialog's title, naming what the cars are being picked for.
   */
  title: string;
  /**
   * The cars ticked when it opens.
   */
  initial: readonly string[];
  /**
   * Called with every car ticked when the user is done.
   * @param cars The ticked cars, in the order they were ticked
   */
  onDone: (cars: string[]) => void;
  /**
   * Called when the dialog closes without an answer.
   */
  onCancel: () => void;
}

/**
 * The car library with a switch on every card, for choosing a whole set of cars
 * at once - the same browser the car picker shows, with the toggling cards
 * Your content uses.
 *
 * Mounted only while open, so it always starts from the set it was handed.
 */
export const CarSetPicker = ({
  title, initial, onDone, onCancel,
}: CarSetPickerProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const [ticked, setTicked] = useState<readonly string[]>(initial);

  const toggle = useMemo((): BrowserToggle => ({
    isOn: (id) => ticked.includes(id),
    onToggle: (id, on) => setTicked((current) => (on
      ? [...current.filter((one) => one !== id), id]
      : current.filter((one) => one !== id))),
  }), [ticked]);

  return (
    <Dialog open onOpenChange={(next) => { if (!next) onCancel(); }}>
      <DialogContent className="flex h-[85vh] max-w-[min(90rem,calc(100vw-4rem))] flex-col gap-4 px-0 sm:max-w-[min(90rem,calc(100vw-4rem))]">
        <DialogHeader className="px-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t('race.pick.carsHint')}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1">
          <CarBrowserBody toggle={toggle} />
        </div>

        <DialogFooter className="items-center px-6 sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {t('race.pick.carsTicked', { count: ticked.length, shown: formatNumber(ticked.length) })}
          </span>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" onClick={onCancel}>{t('race.pick.cancel')}</Button>
            <Button onClick={() => onDone([...ticked])}>{t('race.pick.done')}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
