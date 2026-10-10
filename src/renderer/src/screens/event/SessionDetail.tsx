import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LaunchArea } from './LaunchArea.tsx';
import { SessionBriefing } from './SessionBriefing.tsx';
import { SessionResult } from './SessionResult.tsx';
import { dotted, sessionDay } from './utils.ts';
import type { CareerEventView, Championship, EventSession } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { EVENT_ACCENT, SESSION_ACCENT } from '@/lib/accents';
import { SESSION_TYPE_LABEL, sessionName } from '@/lib/session-labels';

interface SessionDetailProps {
  /**
   * The round.
   */
  view: CareerEventView;
  /**
   * The session to show.
   */
  session: EventSession;
  /**
   * The championship the round belongs to, for flags and teams, once read.
   */
  series: Championship | null;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to run the next session.
   */
  onLaunch: () => void;
}

export const SessionDetail = ({
  view, session, series, busy, onLaunch,
}: SessionDetailProps) => {
  const { t } = useTranslation();
  const before = view.sessions[session.index - 1];

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={SESSION_ACCENT[session.type]}>{t(SESSION_TYPE_LABEL[session.type])}</Badge>
            <h2 className="text-lg font-semibold">
              {sessionName(session, t)}
            </h2>
            {session.status === 'done' ? (
              <Badge className={EVENT_ACCENT.raced}>{t('event.status.done')}</Badge>
            ) : null}
          </div>
          <span className="text-sm text-muted-foreground">
            {dotted([sessionDay(session, view.sessions, t), session.startsAt])}
          </span>
        </div>

        {session.record ? (
          <SessionResult view={view} session={session} record={session.record} series={series} />
        ) : (
          <SessionBriefing session={session} />
        )}

        {session.status === 'next' ? (
          <LaunchArea
            view={view}
            session={session}
            busy={busy}
            onLaunch={onLaunch}
          />
        ) : null}

        {session.status === 'later' && view.entered && view.status === 'scheduled' && before ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LockIcon className="size-4" />
            {t('event.waits', { name: sessionName(before, t) })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};
