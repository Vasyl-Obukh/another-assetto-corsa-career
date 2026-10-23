import { Loader2Icon, WalletIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { launchNote, moneyNote, scaleName } from './utils.ts';
import type { CareerEventView, EventSession } from '../../../../shared/types';
import { SkipNote } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useRaceStatus } from '@/hooks';
import { useAppError, useFormat } from '@/i18n';
import { sessionName } from '@/lib/session-labels';

interface LaunchAreaProps {
  /**
   * The round.
   */
  view: CareerEventView;
  /**
   * The session that runs next.
   */
  session: EventSession;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * The factor its race is shortened by, one for the full race.
   */
  scale: number;
  /**
   * Called to run it.
   */
  onLaunch: () => void;
}

/**
 * Where the next session is started, and where it says why it cannot be.
 *
 * The launching and waiting states are
 * the race store's, read only while it holds this event - another event's
 * launch has nothing to say here.
 */
export const LaunchArea = ({
  view, session, busy, scale, onLaunch,
}: LaunchAreaProps) => {
  const { t } = useTranslation();
  const describe = useAppError();
  const { formatMoney } = useFormat();
  const race = useRaceStatus();
  const { money } = view;
  // What the next launch pays: the fee and the rent, each until it is paid.
  const fee = money?.fee && !money.paid ? money.fee : 0;
  const rent = money?.rent && !money.rentPaid ? money.rent : 0;
  // Said with the amounts in the career's own currency, which the shared
  // English template cannot do.
  const short = view.blocked?.code === 'career.money.short' && money && fee + rent > 0 ? money : null;

  const status = view.live ? race.setup?.status : undefined;
  const running = status !== undefined && status.phase !== 'idle';
  const name = sessionName(session, t);
  const lost = view.skips.length;

  if (running) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
        <span className="flex items-center gap-2 text-sm">
          <Loader2Icon className="size-4 animate-spin" />
          {status.phase === 'launching' ? t('race.launch.launching') : t('race.launch.waiting')}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={race.cancel}>
          {t('race.launch.cancel')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {status?.failure ? (
        <p className="text-sm text-destructive">{describe(status.failure)}</p>
      ) : null}
      {short ? (
        <div className="flex flex-col gap-0.5 rounded-md border border-destructive/35 bg-destructive/10 p-3 text-sm">
          <span className="font-semibold text-destructive">{t('event.money.short')}</span>
          <span className="text-muted-foreground">
            {t('event.money.shortHint', {
              fee: formatMoney(fee + rent),
              money: formatMoney(short.balance),
              missing: formatMoney(fee + rent - short.balance),
            })}
          </span>
        </div>
      ) : null}
      {view.blocked && !short ? (
        <p className="text-sm text-muted-foreground">{describe(view.blocked)}</p>
      ) : null}
      {/* Said before it is paid, so launching never costs money unannounced. */}
      {view.blocked === null && fee + rent > 0 ? (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <WalletIcon className="mt-0.5 size-4 shrink-0" />
          {t(moneyNote(fee, rent), { fee: formatMoney(fee), rent: formatMoney(rent), session: name })}
        </p>
      ) : null}
      {/* The launch is offered regardless, and asks before it goes - this says
          what it will ask about before it is pressed. */}
      {view.blocked === null && lost > 0 ? (
        <SkipNote
          title={t(launchNote(view.skips), { count: lost })}
          hint={t('skip.launchNoteHint')}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {/* Plain on purpose: the step is a number, as a lap count is. Said
            beside Launch so the choice reads with its popover closed. */}
        {scale > 1 ? (
          <span className="text-sm text-muted-foreground">
            {t('event.length.launch', { share: scaleName(scale, t) })}
          </span>
        ) : null}
        <Button type="button" size="lg" disabled={busy || view.blocked !== null} onClick={onLaunch}>
          {t('race.launch.actionNamed', { name })}
        </Button>
      </div>
    </div>
  );
};
