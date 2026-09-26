import { CornerDownRightIcon, GripVerticalIcon } from 'lucide-react';
import type { DragEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { groupsSet } from './utils.ts';
import type { SeriesSession } from '../../../../shared/types';
import { WEATHER_ICON, WEATHER_TYPE_LABEL, weatherKindOf } from '@/components';
import { SESSION_ACCENT } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface SessionBlockProps {
  /**
   * The session it stands for.
   */
  session: SeriesSession;
  /**
   * What it is called, its own name or its type's.
   */
  name: string;
  /**
   * How long it runs, already translated.
   */
  length: string;
  /**
   * What sets its grid, already translated, or null for nothing.
   */
  from: string | null;
  /**
   * Whether it is the session open beside the list.
   */
  selected: boolean;
  /**
   * Whether it is the one being dragged.
   */
  dragging: boolean;
  /**
   * Whether it may be dragged.
   */
  draggable: boolean;
  /**
   * Called to open it.
   */
  onSelect: () => void;
  /**
   * Called as it starts being dragged.
   * @param event The drag event
   */
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  /**
   * Called as it stops being dragged.
   */
  onDragEnd: () => void;
  /**
   * Called as something is dragged over it.
   * @param event The drag event
   */
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  /**
   * Called as something is dropped on it.
   * @param event The drag event
   */
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

/**
 * One session of a weekend, as a block in its type's colour: what it is
 * called, how long it runs, what sets its grid, and any conditions of its own.
 */
export const SessionBlock = ({
  session, name, length, from, selected, dragging, draggable, onSelect,
  onDragStart, onDragEnd, onDragOver, onDrop,
}: SessionBlockProps) => {
  const { t } = useTranslation();
  const conditions = session.conditions ?? {};
  const own = groupsSet(conditions);
  // A single weather is one of a closed set and wears its picker colour; a
  // plan that changes, a clock, a temperature or a grip level stays on the
  // block's own session colour, since none of them is a set worth a second hue.
  const weather = (conditions.weatherSteps?.length ?? 0) > 1 ? null : conditions.weatherType ?? null;
  const WeatherIcon = weather === null ? null : WEATHER_ICON[weather];

  /**
   * Says in a word what one group of its own conditions is.
   * @param group Which group
   * @returns The word, already translated
   */
  const said = (group: (typeof own)[number]): string => {
    if (group === 'time' && typeof conditions.timeOfDay === 'string') return conditions.timeOfDay;
    if (group === 'weather' && (conditions.weatherSteps?.length ?? 0) > 1) return t('editor.weather.changes');
    if (group === 'weather' && conditions.weatherType != null) return t(WEATHER_TYPE_LABEL[conditions.weatherType]);

    return t(`editor.conditions.groups.${group}`);
  };

  return (
    <button
      type="button"
      draggable={draggable}
      aria-pressed={selected}
      className={cn(
        'grid w-full grid-cols-[0.875rem_minmax(0,1fr)_auto] items-start gap-1.5 rounded-lg px-2 py-2 text-left',
        SESSION_ACCENT[session.type] ?? 'bg-muted',
        selected && 'ring-2 ring-primary',
        dragging && 'opacity-40',
      )}
      onClick={onSelect}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <GripVerticalIcon className="mt-0.5 size-3.5 cursor-grab opacity-50" aria-hidden />
      <span className="flex min-w-0 flex-col gap-0.5">
        <b className="truncate text-sm">{name}</b>
        {from === null ? null : (
          <span className="flex items-center gap-1 truncate text-xs opacity-85">
            <CornerDownRightIcon className="size-3 shrink-0" aria-hidden />
            {from}
          </span>
        )}
        {own.length === 0 ? null : (
          <span className="flex flex-wrap gap-1">
            {own.map((group) => (
              <span
                key={group}
                className={cn(
                  'flex items-center gap-1 rounded bg-card/60 px-1.5 text-[11px]',
                  group === 'weather' && weather !== null && weatherKindOf(weather)?.tint,
                )}
              >
                {group === 'weather' && WeatherIcon ? <WeatherIcon className="size-3" aria-hidden /> : null}
                {said(group)}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="text-xs whitespace-nowrap tabular-nums">{length}</span>
    </button>
  );
};
