import { Loader2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CareerEventView, EventSession } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import { useRaceSetup } from '@/hooks';
import { useAppError } from '@/i18n';
import { SESSION_TYPE_LABEL } from '@/screens/race';

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
  /**
   * Called to start a weekend changed on the Race screen again.
   */
  onRestart: () => void;
}

/**
 * Where the next session is started, and where it says why it cannot be.
 *
 * The page's own rather than the Race screen's LaunchPanel, whose Reset and
 * "locked" belong to a race set up by hand. The launching and waiting states are
 * the race store's, read only while it holds this weekend - another weekend's
 * launch has nothing to say here.
 */
export const LaunchArea = ({
  view, session, busy, onLaunch, onRestart,
}: LaunchAreaProps) => {
  const { t } = useTranslation();
  const describe = useAppError();
  const race = useRaceSetup();

  const status = view.live ? race.setup?.status : undefined;
  const running = status !== undefined && status.phase !== 'idle';
  const name = session.name ?? t(SESSION_TYPE_LABEL[session.type]);

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

      <div className="flex flex-wrap justify-end gap-2">
        {view.disturbed ? (
          <Button type="button" variant="outline" disabled={busy} onClick={onRestart}>
            {t('event.launch.restart')}
          </Button>
        ) : null}
        <Button type="button" size="lg" disabled={busy || view.blocked !== null} onClick={onLaunch}>
          {t('race.launch.actionNamed', { name })}
        </Button>
      </div>
    </div>
  );
};
