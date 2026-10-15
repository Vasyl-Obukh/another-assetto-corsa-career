import { useState } from 'react';


import { MAX_DAY } from './constants.ts';
import { SessionList } from './SessionList.tsx';
import { SessionPage } from './SessionPage.tsx';
import type { SessionsHead, StartClass } from './types.ts';
import {
  daysOf, sessionSource, withoutDay, withoutSession, withSessionMoved,
} from './utils.ts';
import type {
  Championship, EventFormat, SeriesSession, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { useKindTranslation } from '@/i18n';
import { useFormat } from '@/i18n';
import { sessionName } from '@/lib/session-labels';
import { cn } from '@/lib/utils.ts';
import { nextSession, sessionLength } from '@/screens/race';

interface SessionsSplitProps {
  /**
   * The championship, for its points systems.
   */
  series: Championship;
  /**
   * The format whose sessions these are.
   */
  format: EventFormat;
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];
  /**
   * Which mod renders the weather.
   */
  system: WeatherSystem;
  /**
   * Whether nothing may change just now.
   */
  locked: boolean;
  /**
   * Whether races pay points, which offers a race its points table.
   */
  scoring?: boolean;
  /**
   * What a session's conditions left alone fall back on.
   */
  behind?: 'round' | 'event';
  /**
   * Whether the sessions are one list rather than days.
   */
  flat?: boolean;
  /**
   * An item above the sessions, opened in their place.
   */
  head?: SessionsHead;
  /**
   * The class a race of the player's own starts them in, bounding the slot
   * they may start from.
   */
  startClass?: StartClass;
  /**
   * Called with the format whenever any session changes.
   * @param next The format
   */
  onChange: (next: EventFormat) => void;
}

/**
 * An event's sessions down the side and the one picked opened beside them -
 * the championship editor's event formats and a race event of the
 * player's own alike, since a session is the same thing in both.
 */
export const SessionsSplit = ({
  series, format, weather, controllers, system, locked, scoring = true, behind = 'round', flat = false, head, startClass,
  onChange,
}: SessionsSplitProps) => {
  const { t } = useKindTranslation();
  const { formatNumber } = useFormat();
  // -1 is the head, when there is one.
  const [selected, setSelected] = useState(0);
  // A day just added, which holds no session yet - so nothing in the
  // document says it is there, and it goes if it is left empty.
  const [extra, setExtra] = useState(0);
  const days = flat ? 1 : Math.min(MAX_DAY + 1, daysOf(format) + extra);
  const onHead = head !== undefined && selected < 0;
  const index = Math.max(0, Math.min(selected, format.sessions.length - 1));

  /**
   * Applies a format whose sessions one was moved or added to, and opens it.
   * The moved one is the only session not carried over as it was.
   * @param next The format
   */
  const land = (next: EventFormat): void => {
    onChange(next);
    setSelected(Math.max(0, next.sessions.findIndex((one) => !format.sessions.includes(one))));
    setExtra(0);
  };

  /**
   * Names one session.
   * @param session The session
   * @returns Its own name, or its type's
   */
  const nameOf = (session: SeriesSession): string => sessionName(session, t);

  /**
   * Says how long one session runs.
   * @param session The session
   * @returns Its length, already translated
   */
  const lengthOf = (session: SeriesSession): string => {
    if (session.distance !== undefined) return t('championships.format.distance', { value: formatNumber(session.distance) });
    const length = sessionLength(session);

    return length === null ? '' : t(length.key, { count: length.count });
  };

  /**
   * Says what sets one session's grid.
   * @param session The session
   * @returns What it follows, or null
   */
  const fromOf = (session: SeriesSession): string | null => {
    const at = sessionSource(format.sessions, session);
    if (at === null) return null;
    const name = nameOf(format.sessions[at]);
    const top = session.inherit?.top === undefined ? name : t('editor.sessions.followsTop', { name, top: session.inherit.top });

    return session.inherit?.reverse === undefined ? top : top + t('editor.sessions.followsReverse', { reverse: session.inherit.reverse });
  };

  return (
    <div className="grid lg:grid-cols-[19rem_minmax(0,1fr)]">
      <div className="border-b bg-muted/30 p-3 lg:border-r lg:border-b-0">
        <SessionList
          head={head ? (
            <button
              type="button"
              className={cn(
                'flex items-center justify-between gap-2 rounded-lg border-2 border-transparent bg-muted px-3 py-2 text-left',
                onHead && 'border-primary',
              )}
              onClick={() => setSelected(-1)}
            >
              <b className="text-sm">{head.label}</b>
              <span className="min-w-0 truncate text-xs text-muted-foreground">{head.detail}</span>
            </button>
          ) : undefined}
          flat={flat}
          sessions={format.sessions}
          days={days}
          selected={onHead ? -1 : index}
          locked={locked}
          nameOf={nameOf}
          lengthOf={lengthOf}
          fromOf={fromOf}
          onSelect={setSelected}
          onMove={(from, before, day) => land(withSessionMoved(format, from, before, day))}
          onAdd={(day) => land(withSessionMoved(
            { ...format, sessions: [...format.sessions, nextSession([...format.sessions])] },
            format.sessions.length,
            null,
            day,
          ))}
          onAddDay={() => setExtra(extra + 1)}
          onRemoveDay={(day) => {
            if (day >= daysOf(format)) { setExtra(Math.max(0, extra - 1)); return; }
            onChange(withoutDay(format, day));
          }}
        />
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        {onHead ? head.page : null}
        {!onHead && format.sessions[index] !== undefined ? (
          <SessionPage
            key={`${format.id}-${index}`}
            series={series}
            format={format}
            index={index}
            nameOf={nameOf}
            weather={weather}
            controllers={controllers}
            system={system}
            locked={locked}
            scoring={scoring}
            behind={behind}
            undated={flat}
            startClass={startClass}
            onChange={onChange}
            onRemove={() => { onChange(withoutSession(format, index)); setSelected(Math.max(0, index - 1)); }}
          />
        ) : null}
      </div>
    </div>
  );
};
