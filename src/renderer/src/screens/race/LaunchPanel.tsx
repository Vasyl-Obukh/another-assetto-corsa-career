import {
  AlertTriangleIcon, FlagIcon, Loader2Icon, RotateCcwIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { RaceSetup } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useAppError, useFormat } from '@/i18n';

interface LaunchPanelProps {
  /**
   * The race, its plan, its progress and its problems.
   */
  setup: RaceSetup;
  /**
   * Whether the race can be handed over right now.
   */
  runnable: boolean;
  /**
   * Whether an action is being applied.
   */
  busy: boolean;
  /**
   * Hands the next session that has not been run to Content Manager.
   */
  onLaunch: () => void;
  /**
   * Stops waiting for a result.
   */
  onCancel: () => void;
  /**
   * Forgets the weekend's progress.
   */
  onReset: () => void;
}

export const LaunchPanel = ({
  setup, runnable, busy, onLaunch, onCancel, onReset,
}: LaunchPanelProps) => {
  const { t } = useTranslation();
  const { formatDateTime } = useFormat();
  const describeError = useAppError();

  const { plan, state, status } = setup;
  const done = state?.completed.length ?? 0;
  const live = status.phase !== 'idle';
  const finished = plan !== null && done >= plan.launches.length;
  // One session, one launch - so which session runs next is what the button
  // actually says, and the session list badges the rest.
  const next = plan?.launches[done]?.session;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('race.plan.label')}</CardTitle>
        <CardDescription>{t('race.plan.hint')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {setup.problems.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-md border border-destructive/50 p-3">
            <span className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangleIcon className="size-4" />
              {t('race.problems.label')}
            </span>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
              {setup.problems.map((problem) => (
                <li key={problem.code + problem.message} data-selectable>
                  {describeError(problem)}
                </li>
              ))}
            </ul>
            <span className="text-xs text-muted-foreground">{t('race.problems.hint')}</span>
          </div>
        ) : null}

        {plan === null ? (
          <p className="text-sm text-muted-foreground">{t('race.plan.none')}</p>
        ) : null}

        {status.failure ? (
          <p className="text-sm text-destructive" data-selectable>
            {describeError(status.failure)}
          </p>
        ) : null}

        {live ? (
          <div className="flex flex-col gap-2 rounded-md border p-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Loader2Icon className="size-4 animate-spin" />
              {status.phase === 'launching' ? t('race.launch.launching') : t('race.launch.waiting')}
            </span>
            {status.startedAt ? (
              <span className="text-xs text-muted-foreground">
                {t('race.launch.started', { when: formatDateTime(new Date(status.startedAt)) })}
              </span>
            ) : null}
          </div>
        ) : null}

        {finished && !live ? (
          <p className="text-sm text-muted-foreground">{t('race.launch.finished')}</p>
        ) : null}

        {done > 0 && !live ? (
          <p className="text-sm text-muted-foreground">{t('race.launch.locked')}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={!runnable || busy} onClick={onLaunch}>
            <FlagIcon />
            {next && !live
              ? t('race.launch.actionNamed', { name: next.name ?? next.type })
              : t('race.launch.action')}
          </Button>

          {live ? (
            <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
              {t('race.launch.cancel')}
            </Button>
          ) : null}

          {done > 0 && !live ? (
            <Button type="button" variant="outline" disabled={busy} onClick={onReset}>
              <RotateCcwIcon />
              {t('race.launch.reset')}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
