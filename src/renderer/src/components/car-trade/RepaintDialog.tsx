import { ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LIVERY_DIALOG } from './constants.ts';
import { TradeButton } from './TradeButton.tsx';
import { TradeError } from './TradeError.tsx';
import type { Car } from '../../../../shared/types';
import { repaintOf } from '../../../../shared/utils/car-prices';
import { liveryName } from '../../../../shared/utils/garage';
import { CarSwatch } from '@/components/content-image/index.ts';
import { SkinStep } from '@/components/content-picker/index.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import type { Garage } from '@/hooks';

interface RepaintDialogProps {
  /**
   * The car being repainted, or null while nothing is.
   */
  car: Car | null;
  /**
   * The career's garage, which owns it and repaints it.
   */
  garage: Garage;
  /**
   * Called once the dialog is done with, repainted or not.
   */
  onClose: () => void;
}

/**
 * Repainting a car the career owns: the livery step with the livery it wears
 * marked, and a foot saying what it goes from and to, and what that costs.
 */
export const RepaintDialog = ({ car, garage, onClose }: RepaintDialogProps) => {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<string | null>(null);
  const [shownFor, setShownFor] = useState<Car | null>(null);
  if (shownFor !== car) {
    setShownFor(car);
    setPicked(null);
  }
  const owned = car ? garage.owned(car.id) : null;
  if (!car || !owned) return null;

  const close = (): void => {
    garage.dismissError();
    onClose();
  };
  const name = (skin: string | undefined): string => liveryName(car, skin) ?? '';
  const changed = picked !== null && picked !== owned.skin;
  const repaint = (): void => {
    if (picked === null) return;
    garage.repaint(car.id, picked).then((ok) => { if (ok) onClose(); }, () => undefined);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className={LIVERY_DIALOG}>
        <DialogHeader className="px-6">
          <DialogTitle>{t('trade.repaintTitle', { car: car.name })}</DialogTitle>
          <DialogDescription>{t('trade.repaintHint')}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1">
          <SkinStep
            car={car}
            selectedId={picked ?? undefined}
            currentId={owned.skin}
            backLabel={t('confirm.cancel')}
            onBack={close}
            onPick={(skin) => setPicked(skin.id)}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-t px-6 pt-4">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <CarSwatch model={car.id} skin={owned.skin} />
            <span className="truncate">{name(owned.skin)}</span>
            {changed ? (
              <>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                <CarSwatch model={car.id} skin={picked} />
                <span className="truncate font-semibold">{name(picked)}</span>
              </>
            ) : null}
          </span>
          <TradeError garage={garage} />
          <span className="ml-auto flex gap-2">
            <Button variant="ghost" disabled={garage.busy} onClick={close}>{t('confirm.cancel')}</Button>
            <TradeButton
              kind="repaint"
              amount={repaintOf(owned.paid)}
              disabled={!changed || garage.busy || repaintOf(owned.paid) > garage.balance}
              onClick={repaint}
            />
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
