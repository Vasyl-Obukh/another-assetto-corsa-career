import { Loader2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CareerEventView, EventSession } from '../../../../shared/types';
import { lostCount, SkipNote } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useRaceStatus } from '@/hooks';
import { useAppError } from '@/i18n';
import { sessionName } from '@/lib/session-labels';

interface LaunchAreaProps {
  /**
   * The round.
   */
  view: CareerEventView;
  /**
   * The session that runs next.
   */
  session: EventSession;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to run it.
   */
  onLaunch: () => void;
}

/**
 * Where the next session is started, and where it says why it cannot be.
 *
 * The launching and waiting states are
 * the race store's, read only while it holds this weekend - another weekend's
 * launch has nothing to say here.
 */
export const LaunchArea = ({
  view, session, busy, onLaunch,
}: LaunchAreaProps) => {
  const { t } = useTranslation();
  const describe = useAppError();
  const race = useRaceStatus();

  const status = view.live ? race.setup?.status : undefined;
  const running = status !== undefined && status.phase !== 'idle';
  const name = sessionName(session, t);
  const lost = lostCount(view.skips);
  const partway = view.skips.some((one) => one.reason === 'partway');

  if (running) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
        <span className="flex items-center gap-2 text-sm">
          <Loader2Icon className="size-4 animate-spin" />
          {status.phase === 'launching' ? t('race.launch.launching') : t('race.launch.waiting')}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={race.cancel}>
          {t('race.launch.cancel')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {status?.failure ? (
        <p className="text-sm text-destructive">{describe(status.failure)}</p>
      ) : null}
      {view.blocked ? (
        <p className="text-sm text-muted-foreground">{describe(view.blocked)}</p>
      ) : null}
      {/* The launch is offered regardless, and asks before it goes - this says
          what it will ask about before it is pressed. */}
      {view.blocked === null && lost > 0 ? (
        <SkipNote
          title={t(partway ? 'skip.launchNotePartway' : 'skip.launchNote', { count: lost })}
          hint={t('skip.launchNoteHint')}
        />
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" size="lg" disabled={busy || view.blocked !== null} onClick={onLaunch}>
          {t('race.launch.actionNamed', { name })}
        </Button>
      </div>
    </div>
  );
};
