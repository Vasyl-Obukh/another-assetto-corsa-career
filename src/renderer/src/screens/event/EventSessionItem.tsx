import { useTranslation } from 'react-i18next';

import { SessionStatusDot } from './SessionStatusDot.tsx';
import { dotted, playerPosition, sessionLength } from './utils.ts';
import type { EventSession } from '../../../../shared/types';
import { ResultCell, WeatherStepIcons } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { sessionName } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';

interface EventSessionItemProps {
  /**
   * The session this row stands for.
   */
  session: EventSession;
  /**
   * Whether it is the one the right-hand side is showing.
   */
  selected: boolean;
  /**
   * Whether the player's seat was raced without them.
   */
  substituted: boolean;
  /**
   * Called to show it.
   */
  onSelect: () => void;
  /**
   * Which day of the event it runs on, as a label, or null for a one-day event.
   */
  day: string | null;
}

export const EventSessionItem = ({
  session, selected, substituted, onSelect, day,
}: EventSessionItemProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  // A race says what it paid; anything else where the player's car finished,
  // which is someone else's place in a round raced without them.
  const raced = session.place && !session.place.bonusOnly ? session.place : null;
  const position = raced?.classPosition ?? (substituted ? null : playerPosition(session.record));
  const when = dotted([
    day,
    session.startsAt,
    sessionLength(session, t, formatNumber),
  ]);

  return (
    <button
      type="button"
      aria-current={selected}
      onClick={onSelect}
      className={cn(
        'grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-t px-3 py-2.5 text-left first:border-t-0',
        selected ? 'bg-accent' : 'hover:bg-accent/50',
      )}
    >
      <SessionStatusDot status={session.status} />

      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">
          {sessionName(session, t)}
        </span>
        <span className="truncate text-xs text-muted-foreground">{when}</span>
      </span>

      <span className="flex items-center gap-2">
        {/* The session's weather at a glance, so the whole event's reads down
            the list without opening each one. Nothing for a session whose
            weather the championship authors - its conditions are its own. */}
        {session.forecast ? (
          <span className="text-muted-foreground" title={t('event.weatherTitle')}>
            <WeatherStepIcons steps={session.forecast.steps} />
          </span>
        ) : null}

        {session.status === 'next' ? (
          // Neutral on purpose: the dot beside it already carries the colour
          // that says "next", and a second one would only repeat it.
          <Badge variant="outline">{t('event.status.next')}</Badge>
        ) : null}
        {/* Neutral on purpose: a simulated segment is a caveat about where the
            order came from, not a state of the session - the dot already says
            it ran, and colouring the caveat would read as a warning about the
            event rather than a footnote on one row of it. */}
        {session.record?.skipped ? (
          <Badge variant="outline">{t('event.status.simulated')}</Badge>
        ) : null}
        {position !== null ? (
          <ResultCell
            position={position}
            scored={(raced?.finishPoints ?? 0) > 0}
            pole={raced?.qualifyingPosition === 1}
            fastestLap={raced?.fastestLap}
            quiet={session.type !== 'race'}
            prefixed
          />
        ) : null}
      </span>
    </button>
  );
};
