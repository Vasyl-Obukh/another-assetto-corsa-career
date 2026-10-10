import { Loader2Icon, LockIcon, RotateCcwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { QuickRaceView, SessionType } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import { useAppError } from '@/i18n';
import { sessionName } from '@/lib/session-labels';

interface RaceLaunchProps {
  /**
   * The race event.
   */
  view: QuickRaceView;
  /**
   * Whether a command is in flight.
   */
  busy: boolean;
  /**
   * Called to run the next session.
   */
  onLaunch: () => void;
  /**
   * Called to stop waiting for the session in flight.
   */
  onCancel: () => void;
  /**
   * Called to throw away what has run and start the event over.
   */
  onRestart: () => void;
}

/**
 * Where a race event is launched from, in the page's pinned header so it is
 * in reach from anywhere on the page: the next session by name, with the line
 * under it saying what follows or what is still missing - the event page's
 * launch area, moved up beside the title.
 */
export const RaceLaunch = ({
  view, busy, onLaunch, onCancel, onRestart,
}: RaceLaunchProps) => {
  const { t } = useTranslation();
  const describe = useAppError();
  const { status } = view;
  const running = status !== null && status.phase !== 'idle';

  if (running) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-card p-2.5 pl-3">
        <span className="flex items-center gap-2 text-sm">
          <Loader2Icon className="size-4 animate-spin" />
          {status.phase === 'launching' ? t('race.launch.launching') : t('race.launch.waiting')}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>{t('race.launch.cancel')}</Button>
      </div>
    );
  }

  // The planned sessions once there is a plan, the written ones until then.
  const sessions: readonly { type: SessionType; name?: string | null }[] = view.sessions.length > 0
    ? view.sessions
    : view.race.sessions;
  const names = sessions.map((one) => sessionName(one, t));
  const done = view.sessions.filter((one) => one.status === 'done').length;
  const next = names[done];
  const after = names.slice(done + 1);
  const problem = view.problems[0];

  let line = null;
  if (status?.failure) {
    line = <span className="text-destructive">{describe(status.failure)}</span>;
  } else if (problem) {
    line = <span className="text-warning-foreground dark:text-warning">{describe(problem)}</span>;
  } else if (after.length > 0) {
    line = <span className="text-muted-foreground">{t('race.launch.then', { sessions: after.join(', ') })}</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {/* Once a session has run the event is fixed, and starting it over
            is the way back to changing it. */}
        {view.phase !== 'setup' ? (
          <>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LockIcon className="size-3.5" />
              {t('race.launch.locked')}
            </span>
            <Button type="button" variant="outline" disabled={busy} onClick={onRestart}>
              <RotateCcwIcon />
              {t('race.launch.restart')}
            </Button>
          </>
        ) : null}
        {next === undefined ? null : (
          <Button type="button" size="lg" disabled={busy || problem !== undefined} onClick={onLaunch}>
            {t('race.launch.actionNamed', { name: next })}
          </Button>
        )}
      </div>
      {line ? <span className="max-w-md text-right text-xs">{line}</span> : null}
    </div>
  );
};
