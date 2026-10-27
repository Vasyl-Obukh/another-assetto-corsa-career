import { CarIcon, CheckIcon, MailIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { HistoricRatingNote } from './HistoricRatingNote.tsx';
import { dotted } from './utils.ts';
import type { CareerEventView, EventEntry, HistoricView } from '../../../../shared/types';
import { useSlot } from '@/app';
import {
  carPictureSources, CarSourceBadge, ConfirmDialog, ContentImage,
} from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';
import { INVITATION_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface HistoricSeatPanelProps {
  /**
   * The event, which says whether it can still be turned down.
   */
  view: Pick<CareerEventView, 'date' | 'roundName' | 'status' | 'sessions' | 'blocked'>;
  /**
   * How the career is entered, or null while an invitation still waits for an
   * answer.
   */
  entered: EventEntry | null;
  /**
   * The historic event, whose invitation says which seat this is and how the
   * player came to it.
   */
  historic: HistoricView;
  /**
   * Whether a command is in flight, which holds the buttons.
   */
  busy: boolean;
  /**
   * Called to accept an invitation still waiting for an answer.
   */
  onAccept: () => void;
  /**
   * Called once the player has confirmed turning the event down - declining an
   * invitation, or withdrawing an entry paid for.
   */
  onDecline: () => void;
}

// The seat the player holds in a historic event, or is offered by an
// invitation still to be answered, in place of the entry panel a
// championship's round has: the car, the team behind it and whose seat it is -
// and the way to answer, or to turn it down while nothing of it has run.
export const HistoricSeatPanel = ({
  view, entered, historic, busy, onAccept, onDecline,
}: HistoricSeatPanelProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const { invitation } = historic;
  const { offer, state } = invitation;
  const car = entered?.car ?? offer?.car;
  const carName = useCarNames(car ? [car.model] : []);
  const [declining, setDeclining] = useState(false);
  const { mode, career } = useSlot();
  if (!car) return null;

  const paid = state === 'entered';
  const awaiting = state === 'awaiting';
  const entryName = entered?.entryName ?? offer?.entryName ?? '';
  const team = entered?.team ?? invitation.team;
  const ladder = entered?.ladder
    ?? historic.event.entries.find((one) => one.id === offer?.entry)?.ladder;
  const missed = view.status === 'missed';
  // Only before it has started, and only in the season being raced.
  const declinable = view.status === 'scheduled' && view.sessions.every((one) => one.record === null)
    && view.blocked?.code !== 'career.season.closed';
  // The mail that brought the seat - none for an entry paid for, whatever
  // became of an invitation before it.
  const read = invitation.mail && !paid ? path.inbox(invitation.mail) : null;

  let chip: string | null = null;
  if (awaiting) chip = t('invitation.state.awaiting', { day: formatDayShort(view.date) });
  else if (state === 'accepted' && invitation.mail) chip = t('invitation.state.accepted');

  return (
    <Card className={cn('gap-3 py-3', awaiting && 'border-dashed border-historic-foreground/60')}>
      <CardHeader className="px-3">
        <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t(awaiting ? 'invitation.title' : 'historic.seat.title')}
          {chip ? (
            <Badge className={cn('ml-auto px-1.5 py-0 text-[0.65rem] normal-case', INVITATION_ACCENT[awaiting ? 'awaiting' : 'accepted'])}>
              {chip}
            </Badge>
          ) : null}
          {/* Neutral on purpose: entered at the player's own cost is what any
              round of theirs is, which its car's chip already says. */}
          {paid ? (
            <Badge variant="outline" className="ml-auto px-1.5 py-0 text-[0.65rem] normal-case">
              {t('invitation.state.entered')}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
          <ContentImage
            sources={carPictureSources(car.model, car.skin)}
            alt={carName(car.model)}
            className="object-cover"
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center">
                <CarIcon className="size-8 text-muted-foreground/40" />
              </div>
            )}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="min-w-0 truncate font-medium">{carName(car.model)}</span>
            {car.source ? <CarSourceBadge source={car.source} /> : null}
          </span>
          <span className="text-xs text-muted-foreground">{dotted([team, entryName])}</span>
          {paid ? (
            <span className="text-xs text-muted-foreground">{t('invitation.entered', { class: entryName })}</span>
          ) : null}
          {!paid && offer ? (
            <span className="text-xs text-muted-foreground">
              {t(missed ? 'historic.seat.racedBy' : 'historic.seat.inSeat')}
            </span>
          ) : null}
        </div>
        {mode === 'career' && career && ladder ? <HistoricRatingNote career={career} ladder={ladder} paid={paid} /> : null}

        {awaiting ? (
          <>
            <span className="text-xs text-muted-foreground">{t('invitation.free')}</span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={busy} onClick={() => setDeclining(true)}>
                {t('historic.decline.action')}
              </Button>
              <Button className="flex-1" disabled={busy} onClick={onAccept}>
                <CheckIcon />
                {t('invitation.accept')}
              </Button>
            </div>
          </>
        ) : null}
        {state === 'accepted' && invitation.answered ? (
          <span className="text-xs text-muted-foreground">
            {t('invitation.acceptedOn', { day: formatDayShort(invitation.answered) })}
          </span>
        ) : null}

        <div className="flex items-center gap-3">
          {!awaiting && declinable ? (
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-muted-foreground"
              disabled={busy}
              onClick={() => setDeclining(true)}
            >
              {t(paid ? 'invitation.withdraw' : 'historic.decline.event')}
            </Button>
          ) : null}
          {read ? (
            <Link to={read} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <MailIcon className="size-3.5" />
              {t('invitation.read')}
            </Link>
          ) : null}
        </div>
        {view.status === 'scheduled' && !declinable && view.sessions.some((one) => one.record !== null) ? (
          <span className="text-xs text-muted-foreground">{t('historic.seat.underWay')}</span>
        ) : null}
      </CardContent>

      <ConfirmDialog
        open={declining}
        busy={busy}
        title={paid
          ? t('invitation.withdrawTitle', { event: view.roundName })
          : t('historic.decline.title', { name: view.roundName })}
        description={paid
          ? t('invitation.withdrawBody', { class: entryName })
          : t('historic.decline.body')}
        confirmLabel={t(paid ? 'invitation.withdrawConfirm' : 'historic.decline.confirm')}
        onClose={() => setDeclining(false)}
        onConfirm={() => {
          setDeclining(false);
          onDecline();
        }}
      />
    </Card>
  );
};
