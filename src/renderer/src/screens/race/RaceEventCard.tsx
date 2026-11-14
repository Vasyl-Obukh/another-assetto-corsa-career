import { CopyIcon, Trash2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { PHASE_PILL } from './constants.ts';
import type { RaceEventState } from './types.ts';
import { sessionLength as definitionLength } from './utils.ts';
import type {
  EventSession, EventSessionStatus, QuickRaceView, SessionDefinition, SessionType,
} from '../../../../shared/types';
import { CarSwatch, ResultCell } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx';
import { useCarNames, useUnits } from '@/hooks';
import { useFormat } from '@/i18n';
import { SESSION_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { SESSION_TYPE_LABEL, sessionName } from '@/lib/session-labels';
import { ChampionshipMenu } from '@/screens/championships';
import { playerPosition, sessionLength, SessionStatusDot } from '@/screens/event';
import { ResultCardHead } from '@/screens/results';

interface RaceEventCardProps {
  /**
   * The race event.
   */
  view: QuickRaceView;
  /**
   * Whether a command is in flight, which holds the menu.
   */
  busy: boolean;
  /**
   * Called to copy it.
   */
  onDuplicate: () => void;
  /**
   * Called to ask about deleting it.
   */
  onRemove: () => void;
}

/**
 * One race event of the player's own, as the Race tab lists it: the Results
 * page's card head over its sessions, each with where it stands and where the
 * player finished it, and the way into it.
 */
export const RaceEventCard = ({
  view, busy, onDuplicate, onRemove,
}: RaceEventCardProps) => {
  const { t } = useTranslation();
  const { formatDay, formatNumber } = useFormat();
  const units = useUnits();
  const { race } = view;
  const carName = useCarNames(race.car ? [race.car.model] : []);
  const title = view.title || t('race.untitled');
  const done = view.sessions.filter((one) => one.status === 'done').length;
  const link = path.raceEvent({ id: race.id });
  // A launch of it is with Content Manager, which it cannot be deleted under.
  const flying = view.status !== null && view.status.phase !== 'idle';

  let pill: string;
  if (view.phase === 'running') pill = t('race.phase.running', { done, count: view.sessions.length });
  else if (view.phase === 'finished') pill = t('race.phase.finished');
  else pill = t('race.phase.setup');

  /**
   * One session's row: where it stands, its kind and name, and what goes on
   * the right.
   * @param key The row's key
   * @param status Where the session stands
   * @param session The session's kind and name
   * @param end The player's finish or the session's length
   * @returns The row
   */
  const row = (
    key: number,
    status: EventSessionStatus,
    session: { type: SessionType; name?: string | null },
    end: ReactNode,
  ) => (
    <div key={key} className="flex h-9 items-center gap-2 border-t text-sm first:border-t-0">
      <SessionStatusDot status={status} />
      <Badge className={SESSION_ACCENT[session.type]}>{t(SESSION_TYPE_LABEL[session.type])}</Badge>
      <span className="min-w-0 flex-1 truncate">{sessionName(session, t)}</span>
      {end}
    </div>
  );

  /**
   * One planned session's row, ending in the player's finish or its length.
   * @param session The session
   * @returns The row
   */
  const plannedRow = (session: EventSession) => {
    const position = session.place?.classPosition ?? playerPosition(session.record);

    return row(session.index, session.status, session, session.status === 'done' && position !== null ? (
      <ResultCell position={position} scored={false} quiet={session.type !== 'race'} prefixed size="sm" />
    ) : (
      <span className="text-xs text-muted-foreground tabular-nums">{sessionLength(session, t, formatNumber, units)}</span>
    ));
  };

  /**
   * A session of an event that cannot be planned yet, as it is written. Its
   * place is its key, since a written session carries no identity of its own.
   * @param session The session
   * @param index Where it runs
   * @returns The row
   */
  const writtenRow = (session: SessionDefinition, index: number) => {
    const length = definitionLength(session);

    return row(index, 'later', session, (
      <span className="text-xs text-muted-foreground tabular-nums">
        {length === null ? null : t(length.key, { count: length.count })}
      </span>
    ));
  };

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm hover-outline">
      {/* The whole card opens the event; the menu sits above the link
          rather than inside it, since a link may not hold a button. */}
      <Link
        to={link}
        state={{ phase: view.phase } satisfies RaceEventState}
        aria-label={title}
        className="absolute inset-0 z-[1] rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      />
      <ResultCardHead
        corner={(
          <div className="relative z-[2]">
            <ChampionshipMenu
              name={title}
              busy={busy}
              triggerClassName="size-8 bg-scrim/55 text-on-scrim hover:bg-scrim/75 hover:text-on-scrim"
            >
              <DropdownMenuItem onSelect={onDuplicate}>
                <CopyIcon />
                {t('race.card.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" disabled={flying} onSelect={onRemove}>
                <Trash2Icon />
                {t('race.card.delete')}
              </DropdownMenuItem>
            </ChampionshipMenu>
          </div>
        )}
        layout={race.track ? { id: race.track.id, layout: race.track.layout ?? '' } : null}
        pill={pill}
        pillClassName={PHASE_PILL[view.phase]}
        title={title}
        line={view.lastRaced
          ? t('race.card.lastRaced', { date: formatDay(view.lastRaced.slice(0, 10)) })
          : t('race.card.created', { date: formatDay(race.createdAt.slice(0, 10)) })}
      />

      <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-muted-foreground">
        {race.car ? (
          <>
            <CarSwatch model={race.car.model} skin={race.car.skin} />
            <span className="truncate">{carName(race.car.model)}</span>
          </>
        ) : <span>{t('race.card.noCar')}</span>}
      </div>

      <div className="flex flex-col px-4 pb-2">
        {view.plan ? view.sessions.map(plannedRow) : race.sessions.map(writtenRow)}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t px-4 py-2.5">
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {view.grid.length > 0
            ? t('race.card.field', { count: view.grid.length })
            : t('race.card.notReady')}
        </span>
      </div>
    </article>
  );
};
