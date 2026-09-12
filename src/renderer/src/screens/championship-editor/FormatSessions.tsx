import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EditorConditionsDialog } from './EditorConditionsDialog.tsx';
import { RowList } from './RowList.tsx';
import { SessionForm } from './SessionForm.tsx';
import { SessionRow } from './SessionRow.tsx';
import { sessionScope, sessionSource, withoutSession, withSession } from './utils.ts';
import type { Championship, SeriesSession, Weather, WeatherController, WeatherSystem, WeekendFormat } from '../../../../shared/types';
import type { RowEditState } from '@/hooks';
import { pointsOf } from '@/screens/championships';
import { nextSession, SESSION_TYPE_LABEL, withSessionConditions } from '@/screens/race';

interface FormatSessionsProps {
  /**
   * The championship, for resolving what a race pays.
   */
  series: Championship;
  /**
   * The format whose sessions these are.
   */
  format: WeekendFormat;
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
   * Which row of the editor has its form open.
   */
  rows: RowEditState;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole format whenever its sessions change.
   * @param next The format to apply
   */
  onChange: (next: WeekendFormat) => void;
}

/**
 * The sessions of one weekend format, in the order they run.
 *
 * Rows keyed by position, which is the only identity a session has: `id` is
 * optional and exists only so another session can name it, so most sessions in
 * most formats have none. Reordering therefore moves what a row stands for,
 * which is why the drag and the chevrons both go off while a row is open - the
 * same rule every other list in the editor follows, for a sharper reason here.
 */
export const FormatSessions = ({
  series, format, weather, controllers, system, rows, locked, onChange,
}: FormatSessionsProps) => {
  const { t } = useTranslation();
  // Which session's conditions dialog is open, by position.
  const [conditions, setConditions] = useState<number | null>(null);
  const { sessions } = format;
  const scope = sessionScope(format.id);
  const days = Math.max(...sessions.map((session) => (session.day ?? 0) + 1), 1);

  /**
   * Puts the sessions back on the format.
   * @param next The sessions, in the order they run
   */
  const apply = (next: readonly SeriesSession[]): void => onChange({ ...format, sessions: next });

  /**
   * Names one session, as its row and any link to it both read it.
   * @param session The session to name
   * @returns Its own name, or its type where it has none
   */
  const labelOf = (session: SeriesSession): string => (
    session.name ?? t(SESSION_TYPE_LABEL[session.type])
  );

  /**
   * Names the session one session takes its field from.
   * @param session The session to read
   * @returns What it follows, or null when it follows nothing
   */
  const followsOf = (session: SeriesSession): string | null => {
    const at = sessionSource(sessions, session);

    return at === null ? null : labelOf(sessions[at]);
  };

  return (
    <div className="flex flex-col gap-3">
      <RowList
        items={sessions}
        scope={scope}
        rows={rows}
        locked={locked}
        // Position is the only identity a session has: two sessions of a sprint
        // weekend can be identical, and most carry no id.
        idOf={(session, index) => String(index)}
        addLabel={t('editor.sessions.add')}
        onReorder={apply}
        renderRow={(session, controls) => (
          <SessionRow
            {...controls}
            session={session}
            name={labelOf(session)}
            days={days}
            follows={followsOf(session)}
            points={session.pointsSystem === undefined
              ? null
              : pointsOf(series, session)?.name ?? session.pointsSystem}
            onConditions={() => setConditions(controls.index)}
            onRemove={() => onChange(withoutSession(format, controls.index))}
          />
        )}
        renderForm={(session, index) => (
          <SessionForm
            series={series}
            format={format}
            session={session ?? nextSession([...sessions])}
            index={index}
            locked={locked}
            labelOf={labelOf}
            onConfirm={(edit) => {
              // At the length, withSession appends.
              onChange(withSession(format, index, edit));
              rows.close();
            }}
            onCancel={rows.close}
          />
        )}
      />

      {conditions === null || sessions[conditions] === undefined ? null : (
        <EditorConditionsDialog
          title={labelOf(sessions[conditions])}
          description={t('editor.sessions.conditionsHint')}
          inheritLabel={t('editor.sessions.inherit')}
          conditions={sessions[conditions].conditions ?? {}}
          weather={weather}
          controllers={controllers}
          system={system}
          idPrefix={`session-${format.id}-${conditions}`}
          locked={locked}
          onConfirm={(value) => {
            // An emptied set drops the block rather than leaving `{}` behind.
            apply(sessions.map((one, at) => (
              at === conditions ? withSessionConditions(one, value) : one
            )));
            setConditions(null);
          }}
          onCancel={() => setConditions(null)}
        />
      )}
    </div>
  );
};
