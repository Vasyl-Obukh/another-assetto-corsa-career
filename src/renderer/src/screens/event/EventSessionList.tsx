import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SUMMARY } from './constants.ts';
import { EventSessionItem } from './EventSessionItem.tsx';
import { sessionDay } from './utils.ts';
import type { EventSession } from '../../../../shared/types';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface EventSessionListProps {
  /**
   * Every session of the event, in the order they run.
   */
  sessions: readonly EventSession[];
  /**
   * The index of the session being shown, or SUMMARY for the round's results.
   */
  selected: number;
  /**
   * What the round paid the player, once anything of it has been raced - which
   * is when the list offers the round's results at its head. Null before.
   */
  summary: {
    /**
     * What it paid the player, or null where there is nothing to say.
     */
    points: number | null;
    /**
     * Whether every session has run.
     */
    complete: boolean;
    /**
     * What the item is called, when not the round's results.
     */
    title?: string;
  } | null;
  /**
   * Whether the player's seat was raced without them, which keeps the first
   * car's places from being read as theirs.
   */
  substituted: boolean;
  /**
   * Called with the index of the session to show.
   * @param index Which session
   */
  onSelect: (index: number) => void;
}

export const EventSessionList = ({
  sessions, selected, summary, substituted, onSelect,
}: EventSessionListProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-3 pt-3 pb-2">
        <CardTitle className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t('event.listTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {summary ? (
          <button
            type="button"
            aria-current={selected === SUMMARY}
            onClick={() => onSelect(SUMMARY)}
            className={cn(
              'grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5 text-left',
              selected === SUMMARY ? 'bg-accent' : 'hover:bg-accent/50',
            )}
          >
            <TrophyIcon className="size-4 text-podium-gold-foreground" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">{summary.title ?? t('event.summary.title')}</span>
              <span className="truncate text-xs text-muted-foreground">
                {t(summary.complete ? 'event.summary.complete' : 'event.summary.sofar')}
              </span>
            </span>
            {summary.points === null ? null : (
              <span className="text-xs font-semibold text-result-points-foreground tabular-nums">
                {t('standings.bonus.plus', { points: formatNumber(summary.points) })}
              </span>
            )}
          </button>
        ) : null}
        {sessions.length === 0 ? (
          <p className="px-3 pb-3 text-sm text-muted-foreground">{t('event.noSessions')}</p>
        ) : sessions.map((session) => (
          <EventSessionItem
            key={session.index}
            session={session}
            selected={session.index === selected}
            substituted={substituted}
            day={sessionDay(session, sessions, t)}
            onSelect={() => onSelect(session.index)}
          />
        ))}
      </CardContent>
    </Card>
  );
};
