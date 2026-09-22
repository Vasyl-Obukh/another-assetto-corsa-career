import { useTranslation } from 'react-i18next';

import { SessionStatusDot } from './SessionStatusDot.tsx';
import { dotted, playerPosition, sessionLength } from './utils.ts';
import type { EventSession } from '../../../../shared/types';
import { WeatherStepIcons } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { useFormat } from '@/i18n';
import { PODIUM_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { SESSION_TYPE_LABEL } from '@/screens/race';

interface WeekendItemProps {
  /**
   * The session this row stands for.
   */
  session: EventSession;
  /**
   * Whether it is the one the right-hand side is showing.
   */
  selected: boolean;
  /**
   * Called to show it.
   */
  onSelect: () => void;
}

export const WeekendItem = ({ session, selected, onSelect }: WeekendItemProps) => {
  const { t } = useTranslation();
  const { formatDay, formatNumber } = useFormat();

  const position = playerPosition(session.record);
  const when = dotted([
    formatDay(session.date), session.startsAt, sessionLength(session, t, formatNumber),
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
          {session.name ?? t(SESSION_TYPE_LABEL[session.type])}
        </span>
        <span className="truncate text-xs text-muted-foreground">{when}</span>
      </span>

      <span className="flex items-center gap-2">
        {/* The session's weather at a glance, so the whole weekend's reads down
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
            weekend rather than a footnote on one row of it. */}
        {session.record?.skipped ? (
          <Badge variant="outline">{t('event.status.simulated')}</Badge>
        ) : null}
        {position !== null && !session.record?.skipped ? (
          <Badge
            variant="outline"
            className={cn('tabular-nums', PODIUM_ACCENT[position - 1])}
          >
            {t('event.position', { position })}
          </Badge>
        ) : null}
      </span>
    </button>
  );
};
