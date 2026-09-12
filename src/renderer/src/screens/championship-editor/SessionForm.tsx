import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DEFAULT_REF, MAX_DAY, MIN_INHERIT_TOP, MIN_SESSION_LENGTH,
} from './constants.ts';
import { NumberField } from './NumberField.tsx';
import { RowForm } from './RowForm.tsx';
import type { SessionEdit } from './types.ts';
import { sessionSource, sessionSources } from './utils.ts';
import type { Championship, SeriesSession, WeekendFormat } from '../../../../shared/types';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { useFocusOnMount } from '@/hooks';
import {
  countsLaps,
  Field,
  fromNumber,
  isOffered,
  measuredInLaps,
  NOT_SET,
  SESSION_TYPE_LABEL,
  SESSION_TYPES,
  toNumber,
  withSessionLength,
} from '@/screens/race';

interface SessionFormProps {
  /**
   * The championship, for the points systems a race may pay.
   */
  series: Championship;
  /**
   * The format the session belongs to, for the qualifyings it may follow.
   */
  format: WeekendFormat;
  /**
   * The session as it stands, which seeds the draft. Read once, on mount.
   */
  session: SeriesSession;
  /**
   * Where it sits in the weekend, which decides what it may follow - only an
   * earlier session leaves a classification behind. The length of the list for
   * a session being added, which may therefore follow any of them.
   */
  index: number;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Names a session of this format, as its row reads it.
   * @param session The session to name
   * @returns Its own name, or its type where it has none
   */
  labelOf: (session: SeriesSession) => string;
  /**
   * Called with the session to commit, and what it follows.
   * @param next The session as edited
   */
  onConfirm: (next: SessionEdit) => void;
  /**
   * Called to leave the row as it was.
   */
  onCancel: () => void;
}

export const SessionForm = ({
  series, format, session, index, locked, labelOf, onConfirm, onCancel,
}: SessionFormProps) => {
  const { t } = useTranslation();
  // What it follows is held as a position beside the draft - see SessionEdit.
  const [draft, setDraft] = useState<SeriesSession>({ ...session, inherit: undefined });
  const [from, setFrom] = useState(sessionSource(format.sessions, session));
  const [top, setTop] = useState(session.inherit?.top);
  const name = useFocusOnMount<HTMLInputElement>();

  const idPrefix = `session-${format.id}-${index}`;
  const laps = measuredInLaps(draft);
  const sources = sessionSources(format.sessions, index);

  return (
    <RowForm
      locked={locked}
      onConfirm={() => onConfirm({
        session: draft,
        from,
        top: from === null ? undefined : top,
      })}
      onCancel={onCancel}
    >
      <Field id={`${idPrefix}-type`} label={t('editor.sessions.type')}>
        <Select
          value={draft.type}
          disabled={locked}
          onValueChange={(value) => {
            if (!isOffered(value)) return;

            // Only a race scores, so anything else drops its points system. A
            // race may be measured either way; everything else runs to the clock.
            const scored = value === 'race' ? draft.pointsSystem : undefined;
            const next = { ...draft, type: value, pointsSystem: scored };

            setDraft(countsLaps(value) && draft.minutes !== undefined
              ? next
              : withSessionLength(next, countsLaps(value)));
          }}
        >
          <SelectTrigger id={`${idPrefix}-type`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SESSION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{t(SESSION_TYPE_LABEL[type])}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id={`${idPrefix}-name`} label={t('editor.sessions.name')}>
        <Input
          id={`${idPrefix}-name`}
          ref={name}
          value={draft.name ?? ''}
          placeholder={t(SESSION_TYPE_LABEL[draft.type])}
          disabled={locked}
          onChange={(event) => setDraft({
            ...draft,
            name: event.target.value === '' ? undefined : event.target.value,
          })}
        />
      </Field>

      <Field
        id={`${idPrefix}-length`}
        label={laps ? t('editor.sessions.laps') : t('editor.sessions.minutes')}
      >
        <div className="flex items-center gap-2">
          {/* Only a race is offered the choice: everything else runs to the
              clock, and AC reads LAPS on a race session alone. */}
          {countsLaps(draft.type) ? (
            <Select
              value={laps ? 'laps' : 'minutes'}
              disabled={locked}
              onValueChange={(value) => setDraft(withSessionLength(draft, value === 'laps'))}
            >
              <SelectTrigger aria-label={t('editor.sessions.lengthUnit')} className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="laps">{t('editor.sessions.laps')}</SelectItem>
                <SelectItem value="minutes">{t('editor.sessions.minutes')}</SelectItem>
              </SelectContent>
            </Select>
          ) : null}

          <Input
            id={`${idPrefix}-length`}
            type="number"
            className="min-w-0 flex-1"
            min={MIN_SESSION_LENGTH}
            value={fromNumber(laps ? draft.laps : draft.minutes)}
            disabled={locked}
            onChange={(event) => {
              const value = toNumber(event.target.value);

              setDraft(laps ? { ...draft, laps: value } : { ...draft, minutes: value });
            }}
          />
        </div>
      </Field>

      {/* One-based, like the row's "Day 2", over the zero-based offset stored. */}
      <NumberField
        id={`${idPrefix}-day`}
        label={t('editor.sessions.day')}
        hint={t('editor.sessions.dayHint')}
        value={(draft.day ?? 0) + 1}
        min={1}
        max={MAX_DAY + 1}
        disabled={locked}
        onChange={(day) => setDraft({ ...draft, day: day === undefined ? undefined : day - 1 })}
      />

      {/* Only a race: validateFormat refuses a points system anywhere else,
          since nothing but a race scores. */}
      {draft.type === 'race' ? (
        <Field id={`${idPrefix}-points`} label={t('editor.sessions.points')}>
          <Select
            value={draft.pointsSystem ?? DEFAULT_REF}
            disabled={locked}
            onValueChange={(value) => setDraft({
              ...draft,
              pointsSystem: value === DEFAULT_REF ? undefined : value,
            })}
          >
            <SelectTrigger id={`${idPrefix}-points`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT_REF}>{t('editor.sessions.defaultPoints')}</SelectItem>
              {series.pointsSystems.map((points) => (
                <SelectItem key={points.id} value={points.id}>{points.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      {/* Nothing to offer until an earlier qualifying exists, and a select with
          one item reading "nothing" is worse than no select. */}
      {sources.length > 0 ? (
        <Field
          id={`${idPrefix}-follows`}
          label={t('editor.sessions.follows')}
          hint={t('editor.sessions.followsHint')}
        >
          <Select
            value={from === null ? NOT_SET : String(from)}
            disabled={locked}
            onValueChange={(value) => setFrom(value === NOT_SET ? null : Number(value))}
          >
            <SelectTrigger id={`${idPrefix}-follows`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NOT_SET}>{t('editor.sessions.followsNothing')}</SelectItem>
              {sources.map((at) => (
                <SelectItem key={at} value={String(at)}>{labelOf(format.sessions[at])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      {from === null ? null : (
        <NumberField
          id={`${idPrefix}-top`}
          label={t('editor.sessions.top')}
          hint={t('editor.sessions.topHint')}
          value={top}
          min={MIN_INHERIT_TOP}
          placeholder={t('editor.sessions.topAll')}
          disabled={locked}
          onChange={setTop}
        />
      )}
    </RowForm>
  );
};
