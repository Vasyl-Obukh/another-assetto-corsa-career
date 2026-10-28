import { InfoIcon, PenLineIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { SeatSale } from '../../../../shared/types';
import { MoneyAmount, SkipNote } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';

interface BuySeatDialogProps {
  /**
   * The seat being bought, or null while none is.
   */
  seat: SeatSale | null;
  /**
   * The championship's display name.
   */
  seriesName: string;
  /**
   * How many rounds the seat is for - every one still to race.
   */
  rounds: number;
  /**
   * How many rounds are already behind the clock, which the team's driver
   * races.
   */
  behind: number;
  /**
   * What the career holds.
   */
  money: number;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called once the player has confirmed what the seat costs.
   */
  onConfirm: () => void;
  /**
   * Called to close it without buying.
   */
  onClose: () => void;
}

// What buying a privateer's seat comes to, asked before anything is paid: the
// price on signing, what it covers, and what the career holds after.
export const BuySeatDialog = ({
  seat, seriesName, rounds, behind, money, busy, onConfirm, onClose,
}: BuySeatDialogProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const carName = useCarNames(seat ? [seat.car.model] : []);

  return (
    <Dialog open={seat !== null} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('event.enter.seats.title', { team: seat?.name ?? '' })}</DialogTitle>
          <DialogDescription>
            {t('event.enter.seats.body', { series: seriesName, count: rounds, car: seat ? carName(seat.car.model) : '' })}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-lg border p-3 text-sm">
          <dt className="text-muted-foreground">{t('event.enter.seats.price')}</dt>
          <dd className="text-right"><MoneyAmount amount={-(seat?.price ?? 0)} /></dd>
          <dt className="text-muted-foreground">{t('event.enter.fee')}</dt>
          <dd className="text-right font-medium">{t('event.enter.seats.covered')}</dd>
          <dt className="text-muted-foreground">{t('event.enter.seats.prizes')}</dt>
          <dd className="text-right font-medium">{t('event.enter.seats.allPrizes')}</dd>
          <dt className="text-muted-foreground">{t('event.enter.seats.missed')}</dt>
          <dd className="text-right font-medium">{t('event.enter.seats.noFine')}</dd>
          <dt className="border-t pt-2 font-medium">{t('event.enter.seats.after')}</dt>
          <dd className="border-t pt-2 text-right font-semibold tabular-nums">{formatMoney(money - (seat?.price ?? 0))}</dd>
        </dl>

        {behind > 0 ? (
          <SkipNote title={t('skip.behindNote', { count: behind })} hint={t('event.enter.seats.behind')} />
        ) : null}
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          {t('event.enter.seats.note')}
        </p>

        <DialogFooter>
          <Button variant="ghost" disabled={busy} onClick={onClose}>{t('event.enter.seats.cancel')}</Button>
          <Button disabled={busy || !seat} onClick={onConfirm}>
            <PenLineIcon />
            {t('event.enter.seats.confirm', { amount: formatMoney(seat?.price ?? 0) })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
