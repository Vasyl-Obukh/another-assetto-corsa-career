import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TradeButton } from './TradeButton.tsx';
import { TradeError } from './TradeError.tsx';
import type { Car } from '../../../../shared/types';
import { rentOf } from '../../../../shared/utils/car-prices';
import { roundUnderWay } from '../../../../shared/utils/garage';
import { Callout } from '@/components/callout/index.ts';
import { SkipNote } from '@/components/skip-dialog/index.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import type { Garage } from '@/hooks';
import { useFormat } from '@/i18n';

interface SellDialogProps {
  /**
   * The car being sold, or null while nothing is.
   */
  car: Car | null;
  /**
   * The career's garage, which owns it and sells it.
   */
  garage: Garage;
  /**
   * Called once the dialog is done with, sold or not.
   */
  onClose: () => void;
}

/**
 * Selling a car the career owns: what it pays and what the career is left
 * with. A championship still racing it races the rest of its rounds in a
 * rented one, which the dialog says; a round under way in it refuses the sale
 * until the round is over.
 */
export const SellDialog = ({ car, garage, onClose }: SellDialogProps) => {
  const { t } = useTranslation();
  const { formatDay, formatMoney } = useFormat();
  const owned = car ? garage.owned(car.id) : null;
  if (!car || !owned) return null;

  const value = garage.valueOf(owned);
  const racing = garage.racingIn(car.id, 'owned');
  const held = roundUnderWay(racing);
  const round = held?.entry.championship.rounds.find((one) => one.id === held.event.round);
  const busy = held ? `${held.entry.championship.name} - ${round?.name ?? held.event.round}` : null;
  const close = (): void => {
    garage.dismissError();
    onClose();
  };
  const sell = (): void => {
    garage.sell(car.id).then((ok) => { if (ok) onClose(); }, () => undefined);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('trade.sellTitle', { car: car.name })}</DialogTitle>
          <DialogDescription>
            {owned.reward ? t('trade.rewardFrom', { sponsor: owned.reward, day: formatDay(owned.bought) }) : t('trade.boughtFor', { paid: formatMoney(owned.paid), day: formatDay(owned.bought) })}
          </DialogDescription>
        </DialogHeader>

        {busy ? (
          <SkipNote title={t('trade.underWay', { round: busy })} hint={t('trade.underWayHint')} />
        ) : (
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">{t('trade.sellsFor')}</dt>
            <dd className="text-right font-semibold text-success tabular-nums">{formatMoney(value)}</dd>
            <dt className="text-muted-foreground">{t('trade.balanceAfter')}</dt>
            <dd className="text-right font-semibold tabular-nums">{formatMoney(garage.balance + value)}</dd>
          </dl>
        )}
        {!busy && racing.length > 0 ? (
          <Callout tone="primary" icon={CarIcon}>
            {t('trade.rentedAfter', {
              series: racing.map((entry) => entry.championship.name).join(', '),
              rent: formatMoney(rentOf(garage.listedOf(car))),
            })}
          </Callout>
        ) : null}
        <TradeError garage={garage} />

        <DialogFooter>
          <Button variant="ghost" disabled={garage.busy} onClick={close}>{busy ? t('trade.close') : t('trade.keep')}</Button>
          <TradeButton kind="sell" disabled={busy !== null || garage.busy} onClick={sell} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
