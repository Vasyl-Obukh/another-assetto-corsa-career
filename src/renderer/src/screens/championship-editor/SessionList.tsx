import { MoreVerticalIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { DragEvent, ReactNode } from 'react';
import { Fragment, useState } from 'react';


import { MAX_DAY } from './constants.ts';
import { RuleHeading } from './RuleHeading.tsx';
import { SessionBlock } from './SessionBlock.tsx';
import type { SeriesSession } from '../../../../shared/types';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';

/**
 * Where a dragged session would land: in front of a session, or at the end of
 * a day.
 */
interface DropTarget {
  /**
   * The session it would land in front of, or null for the end of the day.
   */
  before: number | null;
  /**
   * The day it would land on, counting from zero.
   */
  day: number;
}

interface SessionListProps {
  /**
   * Something listed above the days, which is how a race event of the
   * player's own puts its event-wide conditions at the head of its sessions.
   */
  head?: ReactNode;
  /**
   * Whether the sessions are one list rather than days - a single race
   * event of the player's own, which runs on no calendar.
   */
  flat?: boolean;
  /**
   * The format's sessions, in the order they run.
   */
  sessions: readonly SeriesSession[];
  /**
   * How many days the event spans, an empty day just added included.
   */
  days: number;
  /**
   * Which session is open beside the list.
   */
  selected: number;
  /**
   * Whether nothing may change just now.
   */
  locked: boolean;
  /**
   * Names one session.
   * @param session The session
   * @returns Its name, already translated
   */
  nameOf: (session: SeriesSession) => string;
  /**
   * Says how long one session runs.
   * @param session The session
   * @returns Its length, already translated
   */
  lengthOf: (session: SeriesSession) => string;
  /**
   * Says what sets one session's grid.
   * @param session The session
   * @returns What it follows, already translated, or null
   */
  fromOf: (session: SeriesSession) => string | null;
  /**
   * Says whether one session is a qualifying whose classes run apart.
   * @param session The session
   * @returns True when its row should say so
   */
  apartOf: (session: SeriesSession) => boolean;
  /**
   * Called to open a session.
   * @param index Where it sits
   */
  onSelect: (index: number) => void;
  /**
   * Called to move a session.
   * @param from Where it sits
   * @param before Which session it lands in front of, or null for the end of
   * the day
   * @param day The day it lands on
   */
  onMove: (from: number, before: number | null, day: number) => void;
  /**
   * Called to add a session at the end of a day.
   * @param day Which day
   */
  onAdd: (day: number) => void;
  /**
   * Called to add a day at the end of the event.
   */
  onAddDay: () => void;
  /**
   * Called to take a day off the event.
   * @param day Which day
   */
  onRemoveDay: (day: number) => void;
}

/**
 * An event's sessions down the side, headed by day. A session drags within
 * its day and across a day's heading onto another; a day is added under the
 * list, to the three an event may span.
 */
export const SessionList = ({
  head, flat = false, sessions, days, selected, locked, nameOf, lengthOf, fromOf, apartOf,
  onSelect, onMove, onAdd, onAddDay, onRemoveDay,
}: SessionListProps) => {
  const { t } = useKindTranslation();
  const [dragging, setDragging] = useState<number | null>(null);
  const [target, setTarget] = useState<DropTarget | null>(null);

  /**
   * Marks where a drag over one session would land it.
   * @param index The session dragged over
   * @param event The drag event
   */
  const overSession = (index: number, event: DragEvent<HTMLElement>): void => {
    if (dragging === null) return;
    event.preventDefault();
    const box = event.currentTarget.getBoundingClientRect();
    const after = event.clientY > box.top + box.height / 2;
    const day = sessions[index].day ?? 0;
    const next = sessions[index + 1];
    const before = after ? (next !== undefined && (next.day ?? 0) === day ? index + 1 : null) : index;
    setTarget({ before, day });
  };

  /**
   * Marks the end of a day as where a drag would land.
   * @param day The day dragged over
   * @param event The drag event
   */
  const overDay = (day: number, event: DragEvent<HTMLElement>): void => {
    if (dragging === null) return;
    event.preventDefault();
    setTarget({ before: null, day });
  };

  /**
   * Drops the dragged session where the drag last marked.
   * @param event The drop event
   */
  const drop = (event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    if (dragging !== null && target !== null) onMove(dragging, target.before, target.day);
    setDragging(null);
    setTarget(null);
  };

  const line = <div className="h-0.5 rounded-full bg-primary" aria-hidden />;

  return (
    <div className="flex flex-col gap-1.5">
      {head}
      {Array.from({ length: days }, (_, day) => {
        const own = sessions
          .map((session, index) => ({ session, index }))
          .filter(({ session }) => flat || (session.day ?? 0) === day);

        return (
          <div
            // By position: a day is its place in the event.
            key={day}
            className={cn('flex flex-col gap-1.5 rounded-lg p-0.5', target?.day === day && target.before === null && 'bg-primary/5')}
            onDragOver={(event) => overDay(day, event)}
            onDrop={drop}
          >
            {flat ? null : (
              <RuleHeading className="mt-1">
                {t('championships.format.day', { number: day + 1 })}
                {days > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" size="icon" variant="ghost" className="order-last size-6" disabled={locked} aria-label={t('editor.days.menu', { number: day + 1 })}>
                        <MoreVerticalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem variant="destructive" onSelect={() => onRemoveDay(day)}>
                        <Trash2Icon />
                        {t(day === 0 ? 'editor.days.removeFirst' : 'editor.days.remove')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </RuleHeading>
            )}

            {own.length === 0 ? (
              <button
                type="button"
                className="rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed"
                disabled={locked}
                onClick={() => onAdd(day)}
              >
                {t('editor.days.empty')}
              </button>
            ) : own.map(({ session, index }) => (
              <Fragment key={session.id ?? `at-${index}`}>
                {target?.before === index ? line : null}
                <SessionBlock
                  session={session}
                  name={nameOf(session)}
                  length={lengthOf(session)}
                  from={fromOf(session)}
                  apart={apartOf(session)}
                  selected={selected === index}
                  dragging={dragging === index}
                  draggable={!locked}
                  onSelect={() => onSelect(index)}
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    setDragging(index);
                  }}
                  onDragEnd={() => { setDragging(null); setTarget(null); }}
                  onDragOver={(event) => { event.stopPropagation(); overSession(index, event); }}
                  onDrop={(event) => { event.stopPropagation(); drop(event); }}
                />
              </Fragment>
            ))}
            {target?.day === day && target.before === null && own.length > 0 ? line : null}
          </div>
        );
      })}

      <Button type="button" size="sm" variant="outline" className="border-dashed" disabled={locked} onClick={() => onAdd(days - 1)}>
        <PlusIcon />
        {t('editor.sessions.add')}
      </Button>
      {flat ? null : days <= MAX_DAY ? (
        <Button type="button" size="sm" variant="ghost" className="border border-dashed" disabled={locked} onClick={onAddDay}>
          <PlusIcon />
          {t('editor.days.add', { number: days + 1 })}
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">{t('editor.days.most')}</span>
      )}
    </div>
  );
};
