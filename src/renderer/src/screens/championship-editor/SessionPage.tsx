import { Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ChoiceChips } from './ChoiceChips.tsx';
import { ConditionsEditor } from './ConditionsEditor.tsx';
import {
  DEFAULT_REF, LENGTH_LABEL, LENGTH_UNITS, MIN_INHERIT_TOP, MIN_SESSION_LENGTH, START_KINDS, START_LABEL,
} from './constants.ts';
import { ReverseDiagram } from './ReverseDiagram.tsx';
import { RuleHeading } from './RuleHeading.tsx';
import { StartPosition } from './StartPosition.tsx';
import type {
  LengthUnit, SessionEdit, StartClass, StartKind,
} from './types.ts';
import {
  lengthUnit, sessionSource, sessionSources, startKindOf, withLengthUnit, withSession, withSessionConditionsOf,
} from './utils.ts';
import { MIN_REVERSED } from '../../../../shared/constants';
import type {
  Championship, SeriesSession, SessionType, Weather, WeatherController, WeatherSystem, WeekendFormat,
} from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { SESSION_ACCENT } from '@/lib/accents';
import { SESSION_TYPE_LABEL } from '@/lib/session-labels';
import { countsLaps, Field, fromNumber, NOT_SET, toNumber } from '@/screens/race';

/**
 * The session types a session page offers as chips. The exotic four - hotlap,
 * time attack, drift and drag - are offered only to a session that already is
 * one, since a championship weekend is made of these three.
 */
const MAIN_TYPES: readonly SessionType[] = ['practice', 'qualify', 'race'];

interface SessionPageProps {
  /**
   * The championship, for its points systems.
   */
  series: Championship;
  /**
   * The format the session belongs to.
   */
  format: WeekendFormat;
  /**
   * Where the session sits in the format.
   */
  index: number;
  /**
   * Names one session.
   * @param session The session
   * @returns Its name, already translated
   */
  nameOf: (session: SeriesSession) => string;
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
   * Called with the format whenever the session changes.
   * @param next The format
   */
  onChange: (next: WeekendFormat) => void;
  /**
   * Whether races pay points here, which is what offers a race its points
   * table. A race weekend of the player's own pays none.
   */
  scoring?: boolean;
  /**
   * What a conditions group left alone falls back on: the round's, or the
   * weekend's own for a race weekend that is no round.
   */
  behind?: 'round' | 'weekend';
  /**
   * Whether the weekend runs on no days, so the session's day goes unsaid.
   */
  undated?: boolean;
  /**
   * The class a race of the player's own starts them in, which turns the slot
   * into a slider bounded by it. A championship has no one class to bound it
   * by, so it types the slot in.
   */
  startClass?: StartClass;
  /**
   * Called to take the session out of the format.
   */
  onRemove: () => void;
}

/**
 * One session, opened beside the format's list: what it is, how long it
 * runs, what sets its grid, what it pays and what it runs in. Typed into
 * directly - there is nothing to confirm.
 */
export const SessionPage = ({
  series, format, index, nameOf, weather, controllers, system, locked, scoring = true, behind = 'round',
  undated = false, startClass, onChange, onRemove,
}: SessionPageProps) => {
  const { t } = useTranslation();
  const session = format.sessions[index];
  const idPrefix = `session-${format.id}-${index}`;
  const from = sessionSource(format.sessions, session);
  const sources = sessionSources(format.sessions, index, session.type);
  const unit = lengthUnit(session);
  const types = MAIN_TYPES.includes(session.type) ? MAIN_TYPES : [...MAIN_TYPES, session.type];

  /**
   * Applies a change to the session and to what it follows.
   * @param patch What changes about the session
   * @param link What it follows, and how much of it, where that changes
   */
  const edit = (patch: Partial<SeriesSession>, link: Partial<Omit<SessionEdit, 'session'>> = {}): void => {
    const next: SessionEdit = {
      session: { ...session, ...patch, inherit: undefined },
      from,
      top: session.inherit?.top,
      reverse: session.inherit?.reverse,
      ...link,
    };
    // Changing the type can take the chosen source out of reach - a qualifying
    // may not follow a race - so only what is still offered is kept.
    const offered = sessionSources(format.sessions, index, next.session.type);
    const follows = next.from !== null && offered.includes(next.from) ? next.from : null;
    onChange(withSession(format, index, {
      ...next,
      from: follows,
      top: follows === null ? undefined : next.top,
      reverse: follows !== null && next.session.type === 'race' ? next.reverse : undefined,
    }));
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={SESSION_ACCENT[session.type]}>{t(SESSION_TYPE_LABEL[session.type])}</Badge>
        <h3 className="text-base font-semibold">{nameOf(session)}</h3>
        {undated ? null : (
          <span className="text-xs text-muted-foreground">{t('championships.format.day', { number: (session.day ?? 0) + 1 })}</span>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="ml-auto text-destructive"
          // A format with no sessions is refused, so the last one cannot go.
          disabled={locked || format.sessions.length < 2}
          onClick={onRemove}
        >
          <Trash2Icon />
          {t('editor.sessions.remove')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('editor.sessions.type')}</span>
          <ChoiceChips<SessionType>
            label={t('editor.sessions.type')}
            options={types}
            value={session.type}
            labelOf={(type) => t(SESSION_TYPE_LABEL[type])}
            accentOf={(type) => SESSION_ACCENT[type]}
            disabled={locked}
            onChange={(type) => {
              // Only a race scores, so anything else drops its points system;
              // and only a race counts laps, so anything else runs the clock.
              const scored = type === 'race' ? session.pointsSystem : undefined;
              const next = { ...session, type, pointsSystem: scored };
              edit(countsLaps(type) ? next : withLengthUnit(next, 'minutes'));
            }}
          />
        </div>
        <Field id={`${idPrefix}-name`} label={t('editor.sessions.name')}>
          <Input
            id={`${idPrefix}-name`}
            value={session.name ?? ''}
            placeholder={t(SESSION_TYPE_LABEL[session.type])}
            disabled={locked}
            onChange={(event) => edit({ name: event.target.value === '' ? undefined : event.target.value })}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${idPrefix}-length`} className="text-sm font-medium">{t('editor.sessions.length')}</label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={`${idPrefix}-length`}
            type="number"
            className="w-24 text-right tabular-nums"
            min={MIN_SESSION_LENGTH}
            value={fromNumber(session[unit])}
            disabled={locked}
            onChange={(event) => edit({ [unit]: toNumber(event.target.value) })}
          />
          {/* Only a race is offered the choice: everything else runs to the
              clock, and AC reads LAPS on a race session alone. */}
          {countsLaps(session.type) ? (
            <ChoiceChips<LengthUnit>
              label={t('editor.sessions.lengthUnit')}
              options={LENGTH_UNITS}
              value={unit}
              labelOf={(one) => t(LENGTH_LABEL[one])}
              disabled={locked}
              onChange={(one) => edit(withLengthUnit(session, one))}
            />
          ) : (
            <span className="text-sm text-muted-foreground">{t(LENGTH_LABEL.minutes)}</span>
          )}
        </div>
        {countsLaps(session.type) ? <span className="text-xs text-muted-foreground">{t('editor.sessions.raceLengthHint')}</span> : null}
      </div>

      {session.type === 'practice' || (sources.length === 0 && session.type !== 'race') ? null : (
        <>
          <RuleHeading>{t('editor.sessions.grid')}</RuleHeading>
          {sources.length === 0 ? null : (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>{t('editor.sessions.startsFrom')}</span>
              <Select
                value={from === null ? NOT_SET : String(from)}
                disabled={locked}
                onValueChange={(value) => edit({}, { from: value === NOT_SET ? null : Number(value) })}
              >
                <SelectTrigger id={`${idPrefix}-follows`} className="h-8 w-52" aria-label={t('editor.sessions.follows')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_SET}>{t('editor.sessions.seeded')}</SelectItem>
                  {sources.map((at) => (
                    <SelectItem key={at} value={String(at)}>{nameOf(format.sessions[at])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {from === null ? null : (
                <>
                  <span>{t('editor.sessions.keeps')}</span>
                  <Input
                    type="number"
                    aria-label={t('editor.sessions.top')}
                    className="h-8 w-20 text-right tabular-nums"
                    min={MIN_INHERIT_TOP}
                    placeholder={t('editor.sessions.all')}
                    value={fromNumber(session.inherit?.top)}
                    disabled={locked}
                    onChange={(event) => edit({}, { top: toNumber(event.target.value) })}
                  />
                </>
              )}
              {from !== null && session.type === 'race' ? (
                <>
                  <span>{t('editor.sessions.reversesTop')}</span>
                  <Input
                    type="number"
                    aria-label={t('editor.sessions.reverse')}
                    className="h-8 w-20 text-right tabular-nums"
                    min={MIN_REVERSED}
                    placeholder="0"
                    value={fromNumber(session.inherit?.reverse)}
                    disabled={locked}
                    onChange={(event) => edit({}, { reverse: toNumber(event.target.value) })}
                  />
                </>
              ) : null}
            </div>
          )}
          {from !== null && session.inherit?.reverse ? (
            <ReverseDiagram from={nameOf(format.sessions[from])} reverse={session.inherit.reverse} />
          ) : null}
          {/* With nothing lining it up, the field starts on pace and the player
              says where they join it. */}
          {session.type === 'race' && from === null ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t('editor.sessions.youStart')}</span>
              <div className="flex flex-wrap items-center gap-2">
                <ChoiceChips<StartKind>
                  label={t('editor.sessions.youStart')}
                  options={START_KINDS}
                  value={startKindOf(session.start)}
                  labelOf={(kind) => t(START_LABEL[kind])}
                  disabled={locked}
                  onChange={(kind) => {
                    if (kind === 'position') edit({ start: typeof session.start === 'number' ? session.start : 1 });
                    else edit({ start: kind === 'last' ? undefined : kind });
                  }}
                />
                {typeof session.start === 'number' && !startClass ? (
                  <Input
                    type="number"
                    aria-label={t('editor.sessions.startSlot')}
                    className="h-8 w-20 text-right tabular-nums"
                    min={1}
                    value={fromNumber(session.start)}
                    disabled={locked}
                    onChange={(event) => edit({ start: toNumber(event.target.value) ?? 1 })}
                  />
                ) : null}
              </div>
              {typeof session.start === 'number' && startClass ? (
                <StartPosition
                  value={session.start}
                  within={startClass}
                  disabled={locked}
                  onChange={(start) => edit({ start })}
                />
              ) : null}
              <span className="text-xs text-muted-foreground">{t('editor.sessions.youStartHint')}</span>
            </div>
          ) : null}
        </>
      )}

      {session.type === 'race' && scoring ? (
        <>
          <RuleHeading>{t('editor.sessions.scoring')}</RuleHeading>
          <Field id={`${idPrefix}-points`} label={t('editor.sessions.points')} hint={t('editor.sessions.pointsHint')}>
            <Select
              value={session.pointsSystem ?? DEFAULT_REF}
              disabled={locked}
              onValueChange={(value) => edit({ pointsSystem: value === DEFAULT_REF ? undefined : value })}
            >
              <SelectTrigger id={`${idPrefix}-points`} className="w-full max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT_REF}>
                  {t('editor.points.defaultNamed', {
                    name: series.pointsSystems.find((one) => one.id === series.defaultPointsSystem)?.name ?? '',
                  })}
                </SelectItem>
                {series.pointsSystems.map((points) => (
                  <SelectItem key={points.id} value={points.id}>{points.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </>
      ) : null}

      <RuleHeading>{t('editor.sessions.conditions')}</RuleHeading>
      <ConditionsEditor
        idPrefix={idPrefix}
        conditions={session.conditions ?? {}}
        behind={behind}
        layout="list"
        weather={weather}
        controllers={controllers}
        system={system}
        locked={locked}
        onChange={(conditions) => onChange(withSessionConditionsOf(format, index, conditions))}
      />
      <span className="text-xs text-muted-foreground">{t(behind === 'round' ? 'editor.sessions.conditionsWin' : 'editor.sessions.conditionsWinWeekend')}</span>
    </div>
  );
};
