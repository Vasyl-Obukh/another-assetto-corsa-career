import { CarIcon, LockIcon, MailIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { EventClassOption, Mail, SeatSale } from '../../../../shared/types';
import { TeamBudget } from '../../../../shared/types';
import { percentOf } from '../../../../shared/utils/sponsors';
import {
  BackingMark, BudgetBadge, carPictureSources, ContentImage, NationFlag,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT, TRADE_BUTTON } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface SeatSaleListProps {
  /**
   * The seats the class's privateers sell, the cheapest first.
   */
  seats: readonly SeatSale[];
  /**
   * The edition's seat offers still to be answered, whose teams show their
   * offer rather than a price.
   */
  offers: Mail | null;
  /**
   * The class the seats are in, by its class entry id.
   */
  entry: string;
  /**
   * What the career holds, which says whether a seat can be paid for.
   */
  money: number;
  /**
   * The sponsor who can pay part of a seat, when one can.
   */
  backer: EventClassOption['seatBacker'];
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to buy one of the seats, before anything is paid.
   */
  onBuy: (seat: SeatSale) => void;
}

// The privateers' seats a class sells, each with its car in its colours and
// its price - and a team whose offer is waiting shows that offer instead, since
// it is cheaper to accept than to buy.
export const SeatSaleList = ({
  seats, offers, entry, money, backer, busy, onBuy,
}: SeatSaleListProps) => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const carName = useCarNames(seats.map((seat) => seat.car.model));

  if (seats.length === 0) return <p className="text-sm text-muted-foreground">{t('event.enter.seats.none')}</p>;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      {seats.map((seat) => {
        const offered = offers?.offers?.some((offer) => offer.entry === entry && offer.team === seat.team) ?? false;
        const backing = percentOf(seat.price, backer?.share ?? 0);

        return (
          <div key={seat.team} className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-2.5 border-b px-2.5 py-2 last:border-b-0">
            <span className="relative aspect-[16/10] w-16 overflow-hidden rounded-md bg-muted">
              <ContentImage
                sources={carPictureSources(seat.car.model, seat.car.skin)}
                alt={carName(seat.car.model)}
                className="object-cover"
                fallback={(
                  <span className="absolute inset-0 grid place-items-center">
                    <CarIcon className="size-4 text-muted-foreground/40" />
                  </span>
                )}
              />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5 text-sm">
              <span className="flex min-w-0 items-center gap-1.5 font-medium">
                <span className="truncate">{seat.name}</span>
                {seat.nation ? <NationFlag code={seat.nation} /> : null}
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <BudgetBadge budget={TeamBudget.PRIVATEER} className="shrink-0" />
                <span className="truncate">{carName(seat.car.model)}</span>
              </span>
            </span>
            {offered && offers ? (
              <Link to={path.inbox(offers.id)} className="shrink-0">
                <Badge className={cn('gap-1', CONTRACT_ACCENT)}>
                  <MailIcon className="size-3" />
                  {t('event.enter.seats.offered')}
                </Badge>
              </Link>
            ) : (
              <span className="flex flex-col items-end gap-1">
                <span className="flex items-center gap-1.5">
                  {backer ? <BackingMark sponsor={backer.sponsor} amount={backing} /> : null}
                  <span className="text-sm font-semibold tabular-nums">{formatMoney(seat.price)}</span>
                </span>
                {/* A seat the career cannot pay for says so in the soft red a
                    refusal wears, as a car it cannot buy does. */}
                {seat.price - backing > money ? (
                  <Button size="sm" variant="outline" aria-disabled className={cn(TRADE_BUTTON.cantAfford)}>
                    <LockIcon />
                    {t('event.enter.seats.short')}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => onBuy(seat)}>
                    {t('event.enter.seats.buy')}
                  </Button>
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
