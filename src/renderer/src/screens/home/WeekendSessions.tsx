import { useTranslation } from 'react-i18next';

import { SessionsSkeleton } from './SessionsSkeleton.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { useCareerEvent } from '@/hooks';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { sessionName } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';
import { dotted, sessionLength } from '@/screens/event';

interface WeekendSessionsProps {
  /**
   * Which championship, by its id.
   */
  series: string;
  /**
   * Which round of it, by its id.
   */
  round: string;
}

/**
 * A weekend's sessions, a day and a length each - read off the event page's own
 * view, so the two never disagree about what the weekend runs.
 */
export const WeekendSessions = ({ series, round }: WeekendSessionsProps) => {
  const { t } = useTranslation();
  const { formatNumber, formatWeekday } = useFormat();
  const { view } = useCareerEvent(series, round);

  if (!view) return <SessionsSkeleton />;

  return (
    // Columns rather than a grid, so the weekend reads down in the order it runs.
    <ul className="gap-x-6 space-y-1.5 sm:columns-2">
      {view.sessions.map((session) => (
        <li
          key={session.index}
          className={cn('flex min-w-0 break-inside-avoid items-center gap-2 text-sm', session.status === 'done' && 'opacity-60')}
        >
          <span className="w-9 shrink-0 text-xs text-muted-foreground">{formatWeekday(session.date)}</span>
          <Badge className={SESSION_ACCENT[session.type]}>
            {sessionName(session, t)}
          </Badge>
          <span className="truncate text-xs text-muted-foreground">
            {dotted([session.startsAt, sessionLength(session, t, formatNumber)])}
          </span>
        </li>
      ))}
    </ul>
  );
};
