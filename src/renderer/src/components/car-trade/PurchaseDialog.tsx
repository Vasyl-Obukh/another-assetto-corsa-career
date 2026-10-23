import { ChevronLeftIcon, StoreIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LIVERY_DIALOG } from './constants.ts';
import { TradeError } from './TradeError.tsx';
import type { Car, Skin } from '../../../../shared/types';
import { carPictureSources, ContentImage } from '@/components/content-image/index.ts';
import { SkinStep } from '@/components/content-picker/index.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import type { Garage } from '@/hooks';
import { useFormat } from '@/i18n';
import { TRADE_BUTTON } from '@/lib/accents';

interface PurchaseDialogProps {
  /**
   * The car being bought, or null while nothing is.
   */
  car: Car | null;
  /**
   * The livery already picked, which goes straight to confirming - a car
   * picker's livery step asks it before Purchase.
   */
  skin?: Skin | null;
  /**
   * The career's garage, which buys it.
   */
  garage: Garage;
  /**
   * Called once the dialog is done with, bought or not.
   * @param bought The livery it was bought in, when it was bought
   */
  onClose: (bought?: Skin | null) => void;
}

/**
 * Buying a car: its livery first, as the car picker asks it, then a dialog
 * confirming the car in that livery, its price and what the career is left
 * with. A car shipping fewer than two liveries goes straight to confirming.
 */
export const PurchaseDialog = ({
  car, skin: initial = null, garage, onClose,
}: PurchaseDialogProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  // The livery picked, or null while it is still being picked.
  const [skin, setSkin] = useState<Skin | null>(null);
  const [shownFor, setShownFor] = useState<Car | null>(null);
  if (shownFor !== car) {
    setShownFor(car);
    setSkin(initial);
  }
  if (!car) return null;

  const choosing = car.skins.length >= 2 && skin === null;
  const picked = skin ?? car.skins[0] ?? null;
  const close = (): void => {
    garage.dismissError();
    onClose();
  };
  const buy = (): void => {
    garage.buy(car.id, picked?.id).then((ok) => { if (ok) onClose(picked); }, () => undefined);
  };

  if (choosing) {
    return (
      <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent className={LIVERY_DIALOG}>
          <DialogHeader className="px-6">
            <DialogTitle>{t('trade.pickLivery')}</DialogTitle>
            <DialogDescription>{t('trade.pickLiveryHint')}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1">
            <SkinStep car={car} backLabel={t('confirm.cancel')} onBack={close} onPick={setSkin} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('trade.purchaseTitle', { car: car.name })}</DialogTitle>
          <DialogDescription>
            {picked ? t('trade.purchaseIn', { livery: picked.name }) : t('trade.purchaseHint')}
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video overflow-hidden rounded-lg bg-scrim">
          <ContentImage
            sources={picked ? carPictureSources(car.id, picked.id) : []}
            alt={car.name}
            className="object-cover"
            fallback={null}
          />
        </div>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{t('trade.price')}</dt>
          <dd className="text-right font-semibold tabular-nums">{formatMoney(garage.priceOf(car))}</dd>
          <dt className="text-muted-foreground">{t('trade.balanceAfter')}</dt>
          <dd className="text-right font-semibold tabular-nums">{formatMoney(garage.balance - garage.priceOf(car))}</dd>
        </dl>
        <TradeError garage={garage} />

        <DialogFooter>
          {car.skins.length >= 2 ? (
            <Button variant="ghost" className="sm:mr-auto" disabled={garage.busy} onClick={() => setSkin(null)}>
              <ChevronLeftIcon />
              {t('trade.anotherLivery')}
            </Button>
          ) : null}
          <Button variant="ghost" disabled={garage.busy} onClick={close}>{t('confirm.cancel')}</Button>
          <Button className={TRADE_BUTTON.purchase} disabled={garage.busy} onClick={buy}>
            <StoreIcon />
            {t('trade.purchase')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
