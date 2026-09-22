import { LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LaunchArea } from './LaunchArea.tsx';
import { SessionBriefing } from './SessionBriefing.tsx';
import { SessionResult } from './SessionResult.tsx';
import { dotted } from './utils.ts';
import type { CareerEventView, EventSession } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { EVENT_ACCENT, SESSION_ACCENT } from '@/lib/accents';
import { SESSION_TYPE_LABEL } from '@/screens/race';

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
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to run the next session.
   */
  onLaunch: () => void;
  /**
   * Called to start a weekend changed on the Race screen again.
   */
  onRestart: () => void;
}

export const SessionDetail = ({
  view, session, busy, onLaunch, onRestart,
}: SessionDetailProps) => {
  const { t } = useTranslation();
  const { formatDay } = useFormat();

  const before = view.sessions[session.index - 1];

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={SESSION_ACCENT[session.type]}>{t(SESSION_TYPE_LABEL[session.type])}</Badge>
            <h2 className="text-lg font-semibold">
              {session.name ?? t(SESSION_TYPE_LABEL[session.type])}
            </h2>
            {session.status === 'done' ? (
              <Badge className={EVENT_ACCENT.raced}>{t('event.status.done')}</Badge>
            ) : null}
          </div>
          <span className="text-sm text-muted-foreground">
            {dotted([formatDay(session.date), session.startsAt])}
          </span>
        </div>

        {session.record ? <SessionResult session={session} record={session.record} /> : (
          <SessionBriefing session={session} />
        )}

        {session.status === 'next' ? (
          <LaunchArea
            view={view}
            session={session}
            busy={busy}
            onLaunch={onLaunch}
            onRestart={onRestart}
          />
        ) : null}

        {session.status === 'later' && view.entered && view.status === 'scheduled' && before ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LockIcon className="size-4" />
            {t('event.waits', { name: before.name ?? t(SESSION_TYPE_LABEL[before.type]) })}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};
