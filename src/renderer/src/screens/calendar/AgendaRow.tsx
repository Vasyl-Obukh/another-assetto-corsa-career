import { useTranslation } from 'react-i18next';

import type { CalendarEntry } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { DISCIPLINE_ACCENT, EVENT_ACCENT } from '@/lib/accents';
import { disciplineKey, tierAccent } from '@/screens/championships';

interface AgendaRowProps {
  /**
   * The event this row stands for.
   */
  event: CalendarEntry;
  /**
   * Whether the career's clock is inside this weekend.
   */
  current: boolean;
  /**
   * Whether a command is in flight, which holds every button.
   */
  busy: boolean;
  /**
   * Called to enter the championship this event belongs to.
   */
  onEnter: () => void;
  /**
   * Called to race this round, when it is one the career may race now.
   */
  onRace: () => void;
}

export const AgendaRow = ({
  event, current, busy, onEnter, onRace,
}: AgendaRowProps) => {
  const { t } = useTranslation();

  // Entering is offered on a championship the career is not in; racing only on
  // a weekend it is in, that is still to come, and that the install can run.
  const canEnter = !event.enrolled && event.eligible && event.raceable;
  const canRace = event.enrolled && event.status === 'scheduled' && event.raceable && current;

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border bg-card p-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{event.seriesName}</span>
          <Badge className={DISCIPLINE_ACCENT[event.ladder.discipline]}>
            {t(disciplineKey(event.ladder.discipline))}
          </Badge>
          <Badge className={tierAccent(event.ladder.tier)}>
            {t('championships.tier', { tier: event.ladder.tier })}
          </Badge>
          {/* The class only earns a chip on a championship that runs more than
              one, and the calendar cannot tell - so it is plain text beside the
              name rather than a chip competing with the discipline. */}
          <span className="text-xs text-muted-foreground">{event.entryName}</span>
        </div>

        <span className="text-sm text-muted-foreground">{event.roundName}</span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Neutral on purpose: being entered is not a state of the weekend
              the way raced and missed are, and it already shows in the row
              offering Race rather than Enter. */}
          {event.enrolled ? (
            <Badge variant="outline">{t('calendar.enrolled')}</Badge>
          ) : null}
          {/* Only on a weekend the career is in. Every championship is dated,
              so an un-entered one has rounds behind the clock too - and they
              were not missed, since missing something means having entered it. */}
          {event.enrolled && event.status !== 'scheduled' ? (
            <Badge className={EVENT_ACCENT[event.status]}>
              {t(`calendar.status.${event.status}`)}
            </Badge>
          ) : null}
          {event.clash ? (
            <Badge className="border-transparent bg-warning text-warning-foreground">
              {t('calendar.clash')}
            </Badge>
          ) : null}
          {event.raceable ? null : (
            <Badge variant="destructive">{t('calendar.unraceable')}</Badge>
          )}
          {/* Neutral beside the destructive one above it on purpose: a rung you
              have not climbed to yet is not broken, and the tier chip on the
              line above already carries the colour that says which rung. */}
          {event.eligible ? null : (
            <Badge variant="outline">{t('calendar.locked')}</Badge>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        {canEnter ? (
          <Button size="sm" variant="outline" disabled={busy} onClick={onEnter}>
            {t('calendar.enter')}
          </Button>
        ) : null}
        {canRace ? (
          <Button size="sm" disabled={busy} onClick={onRace}>{t('calendar.race')}</Button>
        ) : null}
      </div>
    </div>
  );
};
