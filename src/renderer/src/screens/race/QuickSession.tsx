import { useTranslation } from 'react-i18next';

import type { EventSession, QuickRaceView } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { EVENT_ACCENT, SESSION_ACCENT } from '@/lib/accents';
import { SESSION_TYPE_LABEL, sessionName } from '@/lib/session-labels';
import { SessionBriefing, SessionResult } from '@/screens/event';

interface QuickSessionProps {
  /**
   * The race event.
   */
  view: QuickRaceView;
  /**
   * The session to show.
   */
  session: EventSession;
}

/**
 * One session of a race event that has started: its briefing until it runs,
 * then its result - the round page's own two, since a session is the same
 * thing whatever event it belongs to.
 */
export const QuickSession = ({ view, session }: QuickSessionProps) => {
  const { t } = useTranslation();

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={SESSION_ACCENT[session.type]}>{t(SESSION_TYPE_LABEL[session.type])}</Badge>
            <h2 className="text-lg font-semibold">{sessionName(session, t)}</h2>
            {session.status === 'done' ? <Badge className={EVENT_ACCENT.raced}>{t('event.status.done')}</Badge> : null}
          </div>
          <span className="text-sm text-muted-foreground">
            {session.startsAt}
          </span>
        </div>

        {session.record ? (
          <SessionResult
            view={{ grid: view.grid, substituted: false, status: 'scheduled' }}
            session={session}
            record={session.record}
            series={view.championship}
          />
        ) : <SessionBriefing session={session} />}
      </CardContent>
    </Card>
  );
};
