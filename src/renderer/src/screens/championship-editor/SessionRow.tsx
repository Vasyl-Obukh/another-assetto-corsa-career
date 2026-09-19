import { CloudSunIcon, CornerDownRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CountBadge } from './CountBadge.tsx';
import { ListRow } from './ListRow.tsx';
import type { SeriesSession } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import type { RowDrag } from '@/hooks';
import { SESSION_ACCENT } from '@/lib/accents';
import {
  ConditionsSummaryLine, overrideCount, SESSION_TYPE_LABEL, sessionLength,
} from '@/screens/race';

interface SessionRowProps {
  /**
   * The session the row stands for.
   */
  session: SeriesSession;
  /**
   * What it is called - its own name, or its type where it has none.
   */
  name: string;
  /**
   * Where it sits in the weekend, counting from zero.
   */
  index: number;
  /**
   * How many sessions the format runs, which is what disables the last Move
   * later and refuses the last Remove.
   */
  count: number;
  /**
   * How many days the weekend spans, which decides whether the day is worth
   * saying: a one-day format repeating "Day 1" on every row says nothing.
   */
  days: number;
  /**
   * What the session it takes its field from is called, or null when it follows
   * nothing.
   */
  follows: string | null;
  /**
   * What the points system it pays is called, or null when it pays the
   * championship's own.
   */
  points: string | null;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the row may be acted on, which it may not while any row in the
   * editor has its form open.
   */
  editable: boolean;
  /**
   * The format's drag state.
   */
  drag: RowDrag;
  /**
   * Called to open the session's form.
   */
  onEdit: () => void;
  /**
   * Called to open what the session runs in.
   */
  onConditions: () => void;
  /**
   * Called to move the session along the weekend.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the session from the format.
   */
  onRemove: () => void;
}

/**
 * One session of a weekend format, read-only.
 */
export const SessionRow = ({
  session, name, index, count, days, follows, points, locked, editable, drag,
  onEdit, onConditions, onMove, onRemove,
}: SessionRowProps) => {
  const { t } = useTranslation();

  const length = sessionLength(session);
  // A distance first: it is what the race runs to, turned into laps per round.
  let lengthText = length === null ? '' : t(length.key, { count: length.count });
  if (session.distance !== undefined) {
    lengthText = t('championships.format.distance', { value: session.distance });
  }
  const overrides = overrideCount(session.conditions ?? {});

  return (
    <ListRow
      index={index}
      number={index + 1}
      name={name}
      muted={session.name === undefined}
      label={name}
      first={index === 0}
      last={index === count - 1}
      locked={locked}
      editable={editable}
      // A format with no sessions is refused, so the last one cannot go.
      removable={count > 1}
      drag={drag}
      onEdit={onEdit}
      extra={[{
        label: t('editor.sessions.conditions'),
        icon: <CloudSunIcon />,
        badge: overrides > 0 ? String(overrides) : undefined,
        onSelect: onConditions,
      }]}
      onMove={onMove}
      onRemove={onRemove}
    >
      {/* Neutral like the points badge after it: both carry a name, not one of a
          closed set. */}
      {follows === null ? null : (
        <Badge variant="secondary" className="max-w-40 shrink-0 truncate">
          <CornerDownRightIcon />
          {session.inherit?.top === undefined
            ? follows
            // Named `top` rather than `count` on purpose: `count` is i18next's
            // own plural selector, and this string does not pluralise.
            : t('editor.sessions.followsTop', { name: follows, top: session.inherit.top })}
          {session.inherit?.reverse === undefined
            ? null
            : t('editor.sessions.followsReverse', { reverse: session.inherit.reverse })}
        </Badge>
      )}

      {/* Only a race that pays a table of its own: a session paying the
          championship's own would repeat the points card on every row. */}
      {points === null ? null : (
        <Badge variant="secondary" className="max-w-40 shrink-0 truncate">{points}</Badge>
      )}

      <CountBadge
        icon={<CloudSunIcon />}
        count={overrides}
        label={t('editor.sessions.conditions')}
        disabled={locked || !editable}
        onClick={onConditions}
      >
        <ConditionsSummaryLine conditions={session.conditions ?? {}} className="text-xs text-background" />
      </CountBadge>

      {/* A fixed column after the badges that come and go, so the types line up
          down the list as the shape of the weekend. */}
      <div className="w-24 shrink-0">
        <Badge className={SESSION_ACCENT[session.type]}>
          {t(SESSION_TYPE_LABEL[session.type])}
        </Badge>
      </div>

      {/* Plain text on purpose: a length and a day are numbers, not one of a
          closed set. Fixed widths so they line up down the list. */}
      <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
        {lengthText}
      </span>

      {days > 1 ? (
        <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
          {t('championships.format.day', { number: (session.day ?? 0) + 1 })}
        </span>
      ) : null}
    </ListRow>
  );
};
