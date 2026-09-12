import {
  ArrowDownIcon, ArrowUpIcon, CheckIcon, SettingsIcon, Trash2Icon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ConditionsDialog } from './ConditionsDialog.tsx';
import { SESSION_TYPE_LABEL, SESSION_TYPES } from './constants.ts';
import { Field } from './Field.tsx';
import {
  countsLaps,
  fromNumber,
  isOffered,
  measuredInLaps,
  overrideCount,
  withSessionCondition,
  withSessionConditions,
  withSessionLength,
} from './utils.ts';
import type {
  Conditions, LaunchRecord, SessionDefinition, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';
import { cn } from '@/lib/utils.ts';

interface SessionRowProps {
  /**
   * The session this row edits.
   */
  session: SessionDefinition;
  /**
   * Where it sits in the list, which is what makes its control ids unique and,
   * one session being one launch, is also its launch index.
   */
  index: number;
  /**
   * How many sessions there are, so the last one cannot be moved further down
   * and the only one cannot be removed.
   */
  count: number;
  /**
   * What this session runs in once the weekend's defaults are applied.
   */
  resolved: Conditions;
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];

  /**
   * Which mod renders the weather, which decides whether slots are offered.
   */
  system: WeatherSystem;
  /**
   * Whether RainFX will draw rain.
   */
  rainFx: boolean;
  /**
   * What this session's launch left behind, or null when it has not run.
   */
  record: LaunchRecord | null;
  /**
   * Whether this is the session that runs next.
   */
  next: boolean;
  /**
   * Whether the weekend has started, in which case nothing here can change.
   */
  locked: boolean;
  /**
   * Called with the whole session whenever any part of it changes.
   * @param session The session to put in this row's place
   */
  onChange: (session: SessionDefinition) => void;
  /**
   * Called to move this session earlier or later.
   * @param by How far to move it, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to take this session out of the list.
   */
  onRemove: () => void;
}

export const SessionRow = ({
  session, index, count, resolved, weather, controllers, system, rainFx, record, next,
  locked, onChange, onMove, onRemove,
}: SessionRowProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const laps = measuredInLaps(session);
  const overrides = overrideCount(session.conditions ?? {});
  // A simulated segment is recorded like a driven one, so the record is what
  // tells them apart - a knockout the player was eliminated from was never run.
  const simulated = record?.skipped === true;
  const ran = record !== null && !simulated;

  return (
    // The session that runs next is picked out by its own frame, so the plan
    // says where you are up to before any badge in it is read.
    <div className={cn(
      'flex flex-col gap-3 rounded-md border p-3',
      next && 'border-primary/60 bg-primary/5',
    )}
    >
      <div className="flex items-end gap-2">
        <Field id={`session-${index}-type`} label={t('race.sessions.type')}>
          <Select
            value={session.type}
            disabled={locked}
            onValueChange={(value) => {
              if (!isOffered(value)) return;
              // A race may be measured either way, so becoming one keeps the
              // length it already had. Everything else runs to the clock, so a
              // lap count is dropped rather than carried into a unit that
              // cannot express it.
              onChange(countsLaps(value) && session.minutes !== undefined
                ? { ...session, type: value }
                : withSessionLength({ ...session, type: value }, countsLaps(value)));
            }}
          >
            <SelectTrigger id={`session-${index}-type`} className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{t(SESSION_TYPE_LABEL[type])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id={`session-${index}-name`} label={t('race.sessions.name')}>
          <Input
            id={`session-${index}-name`}
            className="w-44"
            value={session.name ?? ''}
            placeholder={t(SESSION_TYPE_LABEL[session.type])}
            disabled={locked}
            onChange={(event) => onChange({ ...session, name: event.target.value || undefined })}
          />
        </Field>

        <Field
          id={`session-${index}-length`}
          label={countsLaps(session.type)
            ? t('race.sessions.length')
            : t('race.sessions.minutes')}
        >
          <div className="flex items-center gap-2">
            {/* Only a race is offered the choice: everything else runs to the
                clock, and AC reads LAPS on a race session alone. */}
            {countsLaps(session.type) ? (
              <Select
                value={laps ? 'laps' : 'minutes'}
                disabled={locked}
                onValueChange={(value) => onChange(withSessionLength(session, value === 'laps'))}
              >
                <SelectTrigger aria-label={t('race.sessions.lengthUnit')} className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laps">{t('race.sessions.laps')}</SelectItem>
                  <SelectItem value="minutes">{t('race.sessions.minutes')}</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
            <Input
              id={`session-${index}-length`}
              className="w-16"
              type="number"
              min={1}
              value={fromNumber(laps ? session.laps : session.minutes)}
              disabled={locked}
              onChange={(event) => {
                const value = event.target.value === '' ? undefined : Number(event.target.value);
                onChange(laps ? { ...session, laps: value } : { ...session, minutes: value });
              }}
            />
          </div>
        </Field>

        <Field id={`session-${index}-time`} label={t('race.sessions.startTime')}>
          <Input
            id={`session-${index}-time`}
            className="w-28"
            type="time"
            value={typeof session.conditions?.timeOfDay === 'string' ? session.conditions.timeOfDay : ''}
            disabled={locked}
            onChange={(event) => onChange(withSessionCondition(
              session,
              'timeOfDay',
              event.target.value === '' ? undefined : event.target.value,
            ))}
          />
        </Field>

        <Field id={`session-${index}-day`} label={t('race.sessions.day')}>
          <Input
            id={`session-${index}-day`}
            className="w-16"
            type="number"
            min={0}
            value={fromNumber(session.day)}
            disabled={locked}
            onChange={(event) => onChange({
              ...session,
              day: event.target.value === '' ? undefined : Number(event.target.value),
            })}
          />
        </Field>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          {ran ? (
            <Badge variant="success">
              <CheckIcon />
              {t('race.plan.done')}
            </Badge>
          ) : null}
          {/* Amber rather than green: the segment has a classification, but
              nobody drove it. */}
          {simulated ? (
            <Badge variant="warning">{t('race.plan.simulated')}</Badge>
          ) : null}
          {next ? <Badge>{t('race.plan.next')}</Badge> : null}
          {!ran && !simulated && !next ? (
            <Badge variant="outline">{t('race.plan.pending')}</Badge>
          ) : null}

          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('race.sessions.up')}
            disabled={locked || index === 0}
            onClick={() => onMove(-1)}
          >
            <ArrowUpIcon />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('race.sessions.down')}
            disabled={locked || index === count - 1}
            onClick={() => onMove(1)}
          >
            <ArrowDownIcon />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('race.sessions.remove')}
            disabled={locked || count === 1}
            onClick={onRemove}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <div>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(true)}>
          <SettingsIcon />
          {t('race.sessions.conditions')}
          {overrides > 0 ? (
            <Badge variant="secondary">{t('race.sessions.overrides', { count: overrides })}</Badge>
          ) : null}
        </Button>
      </div>

      <ConditionsDialog
        open={open}
        title={t('race.conditions.dialogSession', {
          name: session.name ?? t(SESSION_TYPE_LABEL[session.type]),
        })}
        description={t('race.conditions.dialogSessionHint')}
        conditions={session.conditions ?? {}}
        resolved={resolved}
        inheritLabel={t('race.sessions.inherit')}
        showTimeOfDay={false}
        weather={weather}
        controllers={controllers}
        system={system}
        rainFx={rainFx}
        allowSlots
        idPrefix={`session-${index}`}
        locked={locked}
        onOpenChange={setOpen}
        onChange={(edited) => onChange(withSessionConditions(session, edited))}
      />
    </div>
  );
};
