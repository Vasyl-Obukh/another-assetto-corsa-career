import { CarIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HistoricRatingNote } from './HistoricRatingNote.tsx';
import { dotted } from './utils.ts';
import type { CareerEventView, EventEntry, HistoricView } from '../../../../shared/types';
import { useSlot } from '@/app';
import { carPictureSources, ConfirmDialog, ContentImage } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useCarNames } from '@/hooks';
import { useFormat } from '@/i18n';

interface HistoricSeatPanelProps {
  /**
   * The event, which says whether it can still be turned down.
   */
  view: Pick<CareerEventView, 'date' | 'roundName' | 'status' | 'sessions' | 'blocked'>;
  /**
   * The seat the player was given.
   */
  entered: EventEntry;
  /**
   * The historic event, whose field names the driver the seat belongs to.
   */
  historic: HistoricView;
  /**
   * Whether a command is in flight, which holds the button.
   */
  busy: boolean;
  /**
   * Called once the player has confirmed turning the event down.
   */
  onDecline: () => void;
}

// The seat a historic event invites the player into, in place of the entry
// panel a championship's round has: the car, the team behind it and whose seat
// it is - and the way to turn it down while nothing of it has run.
export const HistoricSeatPanel = ({
  view, entered, historic, busy, onDecline,
}: HistoricSeatPanelProps) => {
  const { t } = useTranslation();
  const { formatDayShort } = useFormat();
  const carName = useCarNames([entered.car.model]);
  const [declining, setDeclining] = useState(false);
  const { mode, career } = useSlot();

  const driver = historic.event.entries.flatMap((entry) => entry.seats)
    .find((seat) => seat.id === historic.seat)?.driver?.name ?? null;
  const missed = view.status === 'missed';
  // Only before it has started, and only in the season being raced.
  const declinable = view.status === 'scheduled' && view.sessions.every((one) => one.record === null)
    && view.blocked?.code !== 'career.season.closed';

  return (
    <Card className="gap-3 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t(missed ? 'historic.seat.declinedTitle' : 'historic.seat.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
          <ContentImage
            sources={carPictureSources(entered.car.model, entered.car.skin)}
            alt={carName(entered.car.model)}
            className="object-cover"
            fallback={(
              <div className="absolute inset-0 flex items-center justify-center">
                <CarIcon className="size-8 text-muted-foreground/40" />
              </div>
            )}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{carName(entered.car.model)}</span>
          <span className="text-xs text-muted-foreground">{dotted([entered.team, entered.entryName])}</span>
          {driver ? (
            <span className="text-xs text-muted-foreground">
              {t(missed ? 'historic.seat.racedBy' : 'historic.seat.inSeat', { driver })}
            </span>
          ) : null}
        </div>
        {mode === 'career' && career ? <HistoricRatingNote career={career} ladder={entered.ladder} /> : null}
        {declinable ? (
          <Button
            variant="ghost"
            size="sm"
            className="self-start px-0 text-muted-foreground"
            disabled={busy}
            onClick={() => setDeclining(true)}
          >
            {t('historic.decline.event')}
          </Button>
        ) : null}
        {view.status === 'scheduled' && !declinable && view.sessions.some((one) => one.record !== null) ? (
          <span className="text-xs text-muted-foreground">{t('historic.seat.underWay')}</span>
        ) : null}
      </CardContent>

      <ConfirmDialog
        open={declining}
        busy={busy}
        title={t('historic.decline.title', { name: view.roundName })}
        description={t('historic.decline.body', { driver: driver ?? '', day: formatDayShort(view.date) })}
        confirmLabel={t('historic.decline.confirm')}
        onClose={() => setDeclining(false)}
        onConfirm={() => {
          setDeclining(false);
          onDecline();
        }}
      />
    </Card>
  );
};
