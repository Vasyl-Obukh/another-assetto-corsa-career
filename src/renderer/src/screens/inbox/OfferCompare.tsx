import {
  CarIcon, CheckIcon, ChevronRightIcon, KeyRoundIcon, LockIcon, PenLineIcon, RefreshCwIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { COMPARE_COLUMN, COMPARE_LABEL } from './constants.ts';
import { feePerRound, seasonBeforePrizes } from './utils.ts';
import type { MailStatus, SeatOffer } from '../../../../shared/types';
import { roundSalary } from '../../../../shared/utils/contracts';
import { percentOf } from '../../../../shared/utils/sponsors';
import {
  BudgetBadge, carPictureSources, ContentImage, NationFlag, SwitchTile,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { CONTRACT_ACCENT, INVITATION_ACCENT, TRADE_BUTTON } from '@/lib/accents';
import { bonusLine } from '@/lib/inbox';
import { cn } from '@/lib/utils.ts';

interface OfferCompareProps {
  /**
   * One class's offers, the best funded first.
   */
  offers: readonly SeatOffer[];
  /**
   * Where the mail stands.
   */
  status: MailStatus;
  /**
   * The offer signed, once the mail was accepted - which may be in another
   * class.
   */
  signed: SeatOffer | null;
  /**
   * The day the mail was answered or lapsed on, as an ISO date.
   */
  answered: string;
  /**
   * The career's money, which says whether a seat can be paid for.
   */
  money: number;
  /**
   * Names a car by its folder ID.
   */
  carName: (model: string) => string;
  /**
   * The championship's page, which racing it on the player's own starts from.
   */
  link: string;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * The sponsor who can pay part of a paid seat, when one can.
   * @param offer The offer
   * @returns The sponsor and its share, or null
   */
  backerOf: (offer: SeatOffer) => { sponsor: string; share: number } | null;
  /**
   * Called to accept one of the offers.
   * @param offer The offer
   * @param backed Whether to spend a sponsor's backing on it
   */
  onAccept: (offer: SeatOffer, backed: boolean) => void;
}

/**
 * A column's width at most, so one offer beside racing on your own does not
 * stretch across the whole reader.
 */
const COLUMN_WIDTH = 16;

/**
 * The label column's width.
 */
const LABEL_WIDTH = 8;

// One class's offers side by side: a column per team and a row per term, each
// column ending in its own Accept, and a last column saying what racing it on
// the player's own comes to. A renewal from the player's own team leads its
// class, washed in the contract's violet, saying what it renews. Before prizes
// is what the season comes to as signed. Once the mail is accepted the signed
// column is tinted the accepted green and the rest muted, and the own column
// drops out.
export const OfferCompare = ({
  offers, status, signed, answered, money, backerOf, carName, link, busy, onAccept,
}: OfferCompareProps) => {
  const { t } = useTranslation();
  const { formatDayShort, formatMoney } = useFormat();
  // Which seats the player has switched a sponsor's backing on for: off to
  // start with, since backing is only ever spent on purpose.
  const [backing, setBacking] = useState<readonly string[]>([]);
  const offerKey = (offer: SeatOffer): string => `${offer.entry}:${offer.team}`;
  const first = offers[0];
  if (!first) return null;

  const awaiting = status === 'awaiting';
  const own = status !== 'accepted';
  const columns = offers.length + (own ? 1 : 0);
  const perRound = feePerRound(first);
  const ownCost = first.fees + first.rent * first.rounds;
  const isSigned = (offer: SeatOffer): boolean => signed?.entry === offer.entry && signed.team === offer.team;
  const muted = (offer: SeatOffer): boolean => !awaiting && !isSigned(offer);
  // Washed only while there is a choice to make; once answered, signed or not
  // says it.
  const renewing = (offer: SeatOffer): boolean => awaiting && offer.renews !== undefined;
  // What a renewal's term was before, where it changed.
  const was = (before: number | undefined, now: number, text: string): string | null => (
    before !== undefined && before !== now ? t('inbox.compare.was', { value: text }) : null
  );
  // The one offer best on a row, while there is still a choice to make.
  const bestBy = (score: (offer: SeatOffer) => number): SeatOffer | null => {
    if (!awaiting || offers.length < 2) return null;
    const top = Math.max(...offers.map(score));
    const leaders = offers.filter((offer) => score(offer) === top);

    return leaders.length === 1 ? leaders[0] : null;
  };
  // What a sponsor would pay of a seat, and what the player has switched on.
  const halfOf = (offer: SeatOffer): number => percentOf(offer.amount, backerOf(offer)?.share ?? 0);
  const backedOf = (offer: SeatOffer): number => (backing.includes(offerKey(offer)) ? halfOf(offer) : 0);
  const bestSeason = bestBy((offer) => seasonBeforePrizes(offer) + backedOf(offer));
  const bestShare = bestBy((offer) => offer.prizeShare);

  const signedMoney = (amount: number): ReactNode => {
    const text = amount > 0 ? `+${formatMoney(amount)}` : formatMoney(amount);

    return <span className={cn('tabular-nums', amount < 0 ? 'text-destructive' : 'text-success')}>{text}</span>;
  };
  const cell = (
    offer: SeatOffer,
    value: ReactNode,
    hint: string | null,
    best = false,
  ): ReactNode => (
    <div
      key={`${offer.entry}:${offer.team}`}
      className={cn(
        COMPARE_COLUMN.cell,
        renewing(offer) && COMPARE_COLUMN.renewal,
        isSigned(offer) && COMPARE_COLUMN.signed,
        best && COMPARE_COLUMN.best,
      )}
    >
      <span className={cn('font-medium', muted(offer) && 'font-normal text-muted-foreground')}>
        {value}
        {best ? <Badge className={cn('ml-1.5 px-1.5 py-0 text-[0.65rem]', INVITATION_ACCENT.accepted)}>{t('inbox.compare.best')}</Badge> : null}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
  const ownCell = (value: ReactNode, hint: string | null): ReactNode => (own ? (
    <div className={cn(COMPARE_COLUMN.cell, COMPARE_COLUMN.own)}>
      <span className="font-medium">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  ) : null);
  const row = (label: string, cells: ReactNode[], ownValue: ReactNode): ReactNode => (
    <>
      <div className={COMPARE_LABEL}>{label}</div>
      {cells}
      {ownValue}
    </>
  );

  const pay = (offer: SeatOffer): [string, string] => {
    if (offer.pay === 'salary') {
      const before = offer.renews && offer.renews.amount !== offer.amount ? offer.renews : null;

      return [
        t('inbox.compare.salary', { amount: formatMoney(offer.amount) }),
        before
          ? t('inbox.compare.raised', { amount: formatMoney(before.amount), place: before.place })
          : t('inbox.offer.terms.salaryHint', { amount: formatMoney(roundSalary(offer, offer.rounds) ?? 0) }),
      ];
    }
    if (offer.pay === 'seat') {
      return [t('inbox.offer.terms.seat', { amount: formatMoney(offer.amount) }), t('inbox.offer.terms.seatHint')];
    }

    return [t('inbox.offer.terms.free'), t('inbox.offer.terms.freeHint')];
  };
  const bonus = (offer: SeatOffer): string => bonusLine(offer.bonus, t, formatMoney) ?? t('inbox.compare.none');
  const foot = (offer: SeatOffer): ReactNode => {
    if (status === 'accepted' && isSigned(offer)) {
      return (
        <span className="flex items-center gap-1.5 text-sm font-semibold text-mail-accepted-foreground">
          <CheckIcon className="size-4" />
          {t('inbox.compare.signedOn', { day: formatDayShort(answered) })}
        </span>
      );
    }
    if (!awaiting) {
      return (
        <span className="text-sm text-muted-foreground">
          {t(status === 'lapsed' ? 'inbox.compare.lapsedOn' : 'inbox.compare.declinedOn', { day: formatDayShort(answered) })}
        </span>
      );
    }
    const backed = backedOf(offer);
    const price = (offer.pay === 'seat' ? offer.amount : 0) - backed;
    const backer = backerOf(offer);
    const key = offerKey(offer);
    const tile = backer ? (
      <SwitchTile
        label={t('trade.backing.use', { sponsor: backer.sponsor })}
        hint={t('event.enter.seats.backingHint', { amount: formatMoney(halfOf(offer)) })}
        checked={backing.includes(key)}
        onChange={(on) => setBacking((now) => (on ? [...now, key] : now.filter((one) => one !== key)))}
      />
    ) : null;
    // A seat the career cannot pay for says so in the soft red a refusal
    // wears, as a car it cannot buy does.
    if (price > money) {
      return (
        <div className="flex w-full flex-col gap-2">
          {tile}
          <Button variant="outline" aria-disabled className={cn('w-full', TRADE_BUTTON.cantAfford)}>
            <LockIcon />
            {t('inbox.offer.reply.short', { amount: formatMoney(price) })}
          </Button>
        </div>
      );
    }

    let label = t('inbox.compare.accept');
    if (offer.renews) label = t('inbox.compare.renew');
    else if (price > 0) label = t('inbox.offer.reply.acceptPay', { amount: formatMoney(price) });

    return (
      <div className="flex w-full flex-col gap-2">
        {tile}
        <Button className="w-full" disabled={busy} onClick={() => onAccept(offer, backed > 0)}>
          {offer.renews ? <RefreshCwIcon /> : <PenLineIcon />}
          {label}
        </Button>
      </div>
    );
  };

  return (
    <div
      className="grid overflow-hidden rounded-lg border bg-card text-sm"
      style={{
        gridTemplateColumns: `${LABEL_WIDTH}rem repeat(${columns}, minmax(0, 1fr))`,
        maxWidth: `${LABEL_WIDTH + columns * COLUMN_WIDTH}rem`,
      }}
    >
      <div className={cn(COMPARE_LABEL, 'border-t-0')} />
      {offers.map((offer) => (
        <div
          key={`${offer.entry}:${offer.team}`}
          className={cn(
            COMPARE_COLUMN.head,
            renewing(offer) && COMPARE_COLUMN.renewalHead,
            isSigned(offer) && COMPARE_COLUMN.signedHead,
          )}
        >
          <span className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
            <ContentImage
              sources={carPictureSources(offer.car.model, offer.car.skin)}
              alt={carName(offer.car.model)}
              className={cn('object-cover', muted(offer) && 'opacity-75 grayscale')}
              fallback={(
                <span className="absolute inset-0 grid place-items-center">
                  <CarIcon className="size-5 text-muted-foreground/40" />
                </span>
              )}
            />
          </span>
          <span className="flex flex-wrap items-center gap-1">
            <BudgetBadge budget={offer.budget} />
            {offer.renews ? (
              <Badge className={cn('gap-1', CONTRACT_ACCENT)}>
                <RefreshCwIcon className="size-3" />
                {t('inbox.compare.yourTeam')}
              </Badge>
            ) : null}
            {status === 'accepted' ? (
              <Badge className={isSigned(offer) ? INVITATION_ACCENT.accepted : INVITATION_ACCENT.declined}>
                {t(isSigned(offer) ? 'inbox.compare.signed' : 'inbox.status.declined')}
              </Badge>
            ) : null}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 font-semibold">
            <span className="truncate">{offer.teamName}</span>
            {offer.nation ? <NationFlag code={offer.nation} /> : null}
          </span>
          <span className="truncate text-xs text-muted-foreground">{carName(offer.car.model)}</span>
        </div>
      ))}
      {own ? (
        <div className={cn(COMPARE_COLUMN.head, COMPARE_COLUMN.own)}>
          <span className="grid aspect-[16/9] w-full place-items-center rounded-md border border-dashed text-muted-foreground">
            <KeyRoundIcon className="size-5" />
          </span>
          {/* Racing on your own is no team at all, so it wears no budget's
              colour - the one neutral chip in the row. */}
          <span className="flex">
            <Badge variant="secondary">{t('inbox.compare.noContract')}</Badge>
          </span>
          <span className="font-semibold">{t('inbox.compare.own')}</span>
          <span className="text-xs text-muted-foreground">{t('inbox.compare.ownHint')}</span>
        </div>
      ) : null}

      {row(
        t('inbox.offer.terms.pay'),
        offers.map((offer) => cell(offer, ...pay(offer))),
        ownCell(t('inbox.compare.nothing'), t('inbox.compare.nothingHint')),
      )}
      {row(
        t('inbox.offer.terms.fees'),
        offers.map((offer) => (offer.feeCover >= 1
          ? cell(
            offer,
            t('inbox.offer.terms.covered'),
            was(offer.renews?.feeCover, offer.feeCover, t('inbox.offer.terms.half')) ?? t('inbox.compare.coveredHint'),
          )
          : cell(offer, t('inbox.offer.terms.half'), t('inbox.compare.halfHint', { amount: formatMoney(Math.round(perRound / 2)) })))),
        ownCell(t('inbox.compare.feesOwn'), t('inbox.compare.feesOwnHint', { amount: formatMoney(perRound) })),
      )}
      {row(
        t('inbox.offer.terms.car'),
        offers.map((offer) => cell(offer, t('inbox.compare.teamCar'), t('inbox.offer.terms.carHint'))),
        ownCell(
          t('inbox.compare.carOwn'),
          first.rent > 0 ? t('inbox.compare.carOwnHint', { amount: formatMoney(first.rent) }) : null,
        ),
      )}
      {row(
        t('inbox.compare.before'),
        offers.map((offer) => cell(
          offer,
          signedMoney(seasonBeforePrizes(offer) + backedOf(offer)),
          t('inbox.compare.season'),
          offer === bestSeason,
        )),
        ownCell(
          signedMoney(-ownCost),
          t('inbox.compare.beforeOwn', { fees: formatMoney(first.fees), rent: formatMoney(first.rent * first.rounds) }),
        ),
      )}
      {row(
        t('inbox.offer.terms.prizes'),
        offers.map((offer) => (offer.prizeShare >= 100
          ? cell(offer, t('inbox.offer.terms.shareAll'), t('inbox.compare.shareAllHint'), offer === bestShare)
          : cell(
            offer,
            t('inbox.offer.terms.share', { share: offer.prizeShare }),
            was(offer.renews?.prizeShare, offer.prizeShare, t('inbox.offer.terms.share', {
              share: offer.renews?.prizeShare ?? 0,
            })) ?? t('inbox.compare.keeps', { rest: 100 - offer.prizeShare }),
            offer === bestShare,
          ))),
        ownCell(t('inbox.offer.terms.shareAll'), null),
      )}
      {row(
        t('inbox.offer.terms.bonus'),
        offers.map((offer) => cell(offer, bonus(offer), offer.bonus ? t('inbox.offer.terms.bonusHint') : null)),
        ownCell(t('inbox.compare.none'), null),
      )}
      {row(
        t('inbox.compare.keep'),
        offers.map((offer) => (offer.keep === undefined
          ? cell(offer, t('inbox.compare.keepAlways'), t('inbox.compare.keepAlwaysHint'))
          : cell(offer, t('inbox.compare.keepPlace', { place: offer.keep }), t('inbox.compare.keepHint')))),
        ownCell(t('inbox.compare.keepOwn'), null),
      )}
      {row(
        t('inbox.offer.terms.missed'),
        offers.map((offer) => (offer.pay === 'seat'
          ? cell(offer, t('inbox.offer.terms.noFine'), t('inbox.compare.noFineHint'))
          : cell(
            offer,
            t('inbox.compare.fine', { amount: formatMoney(perRound) }),
            t(offer.pay === 'salary' ? 'inbox.compare.fineSalaryHint' : 'inbox.compare.fineHint'),
          ))),
        ownCell(t('inbox.offer.terms.noFine'), null),
      )}

      <div className={COMPARE_LABEL} />
      {offers.map((offer) => (
        <div
          key={`${offer.entry}:${offer.team}`}
          className={cn(COMPARE_COLUMN.cell, 'justify-center', isSigned(offer) && COMPARE_COLUMN.signed)}
        >
          {foot(offer)}
        </div>
      ))}
      {own ? (
        <div className={cn(COMPARE_COLUMN.cell, COMPARE_COLUMN.own, 'justify-center')}>
          <Button asChild variant="outline" className="w-full">
            <Link to={link}>
              {t('inbox.compare.enterOwn')}
              <ChevronRightIcon />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
};
