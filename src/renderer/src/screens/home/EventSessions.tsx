import { useTranslation } from 'react-i18next';

import { SessionsSkeleton } from './SessionsSkeleton.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { useCareerEvent, useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { sessionName } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';
import { dotted, sessionDay, sessionLength } from '@/screens/event';

interface EventSessionsProps {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which round of it, by its id.
   */
  round: string;
  /**
   * Which of the season's editions it is a round of.
   */
  edition: number;
}

/**
 * An event's sessions, a length each and the day of the event each runs on
 * where it runs over more than one - read off the event page's own view, so
 * the two never disagree about what the event runs.
 */
export const EventSessions = ({ series, round, edition }: EventSessionsProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const units = useUnits();
  const { view } = useCareerEvent(series, round, { edition });

  if (!view) return <SessionsSkeleton />;

  return (
    // Columns rather than a grid, so the event reads down in the order it runs.
    <ul className="gap-x-6 space-y-1.5 sm:columns-2">
      {view.sessions.map((session) => {
        const day = sessionDay(session, view.sessions, t);

        return (
          <li
            key={session.index}
            className={cn('flex min-w-0 break-inside-avoid items-center gap-2 text-sm', session.status === 'done' && 'opacity-60')}
          >
            {/* Held even when empty, so a one-day event's rows sit where the skeleton put them. */}
            <span className="w-12 shrink-0 text-xs text-muted-foreground">{day}</span>
            <Badge className={SESSION_ACCENT[session.type]}>
              {sessionName(session, t)}
            </Badge>
            <span className="truncate text-xs text-muted-foreground">
              {dotted([session.startsAt, sessionLength(session, t, formatNumber, units)])}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
