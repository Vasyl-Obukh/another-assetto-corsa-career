import { useTranslation } from 'react-i18next';

import { INHERIT, TRACK_STATE_LABEL, TRACK_STATES } from './constants.ts';
import { Field } from './Field.tsx';
import { fromNumber, toNumber } from './utils.ts';
import { WeatherSlots } from './WeatherSlots.tsx';
import type {
  Conditions, TrackStateName, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';

interface ConditionsBodyProps {
  /**
   * The conditions being edited: the weekend's defaults, or one session's
   * overrides of them.
   */
  conditions: Conditions;
  /**
   * What the session runs in once the weekend's defaults are applied, which is
   * what an unset field shows as its placeholder. Absent for the weekend, which
   * inherits from nothing.
   */
  resolved?: Conditions;
  /**
   * What "take the weekend's" reads as. Present only for a session, and its
   * presence is what puts that entry at the top of each menu.
   */
  inheritLabel?: string;
  /**
   * Whether to offer a start time. The weekend has a default one; a session's
   * lives in its row, beside its length.
   */
  showTimeOfDay: boolean;
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
   * Whether weather that changes over the session can be asked for here.
   */
  allowSlots: boolean;
  /**
   * What makes these controls' ids unique on the page.
   */
  idPrefix: string;
  /**
   * Whether the weekend has started, in which case nothing here can change.
   */
  locked: boolean;
  /**
   * Called with the whole set whenever any part of it changes.
   * @param conditions The conditions to apply
   */
  onChange: (conditions: Conditions) => void;
}

/**
 * The conditions editor, and the one place conditions are edited.
 *
 * The weekend's defaults and a session's overrides are the same fields asked
 * twice, differing only in whether values inherit and whether a start time
 * belongs here, so they are one component rather than two that drift apart.
 * Weather sits in a panel above the rest, being the one answer that is a list:
 * beside the single values, a third slot stretched one grid cell and left every
 * other field short.
 */
export const ConditionsBody = ({
  conditions, resolved, inheritLabel, showTimeOfDay, weather, controllers, system, rainFx,
  allowSlots, idPrefix, locked, onChange,
}: ConditionsBodyProps) => {
  const { t } = useTranslation();

  /**
   * What an unset number shows instead of nothing.
   *
   * A session shows the weekend's value, so an inherited condition is visible
   * rather than merely absent; the weekend itself has nothing behind it.
   * @param value The resolved value, when there is one
   * @returns The placeholder
   */
  const inherited = (value: number | undefined): string => {
    if (!inheritLabel) return '';

    return value === undefined ? inheritLabel : String(value);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-4">
        <span className="text-sm font-medium">{t('race.conditions.weather')}</span>

        <WeatherSlots
          conditions={conditions}
          weather={weather}
          controllers={controllers}
          system={system}
          rainFx={rainFx}
          allowSlots={allowSlots}
          idPrefix={idPrefix}
          noneLabel={inheritLabel ?? t('race.conditions.weatherDefault')}
          locked={locked}
          onChange={onChange}
        />
      </div>

      <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {showTimeOfDay ? (
          <Field
            id={`${idPrefix}-time`}
            label={t('race.conditions.timeOfDay')}
          >
            <Input
              id={`${idPrefix}-time`}
              type="time"
              value={typeof conditions.timeOfDay === 'string' ? conditions.timeOfDay : ''}
              disabled={locked}
              // Cleared means "no answer", not an empty one: an empty string
              // survives ?? and reaches parseClock, which rejects it.
              onChange={(event) => onChange({
                ...conditions,
                timeOfDay: event.target.value === '' ? undefined : event.target.value,
              })}
            />
          </Field>
        ) : null}

        <Field id={`${idPrefix}-ambient`} label={t('race.conditions.ambient')}>
          <Input
            id={`${idPrefix}-ambient`}
            type="number"
            placeholder={inherited(resolved?.ambient)}
            value={fromNumber(conditions.ambient)}
            disabled={locked}
            onChange={(event) => onChange({ ...conditions, ambient: toNumber(event.target.value) })}
          />
        </Field>

        <Field id={`${idPrefix}-track-state`} label={t('race.conditions.trackState')}>
          <Select
            value={conditions.trackState ?? (inheritLabel ? INHERIT : 'fast')}
            disabled={locked}
            onValueChange={(value) => onChange({
              ...conditions,
              trackState: value === INHERIT ? undefined : (value as TrackStateName),
            })}
          >
            <SelectTrigger id={`${idPrefix}-track-state`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {inheritLabel ? <SelectItem value={INHERIT}>{inheritLabel}</SelectItem> : null}
              {TRACK_STATES.map((state) => (
                <SelectItem key={state} value={state}>{t(TRACK_STATE_LABEL[state])}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field id={`${idPrefix}-wind-direction`} label={t('race.conditions.windDirection')}>
          <Input
            id={`${idPrefix}-wind-direction`}
            type="number"
            placeholder={inherited(resolved?.windDirection)}
            value={fromNumber(conditions.windDirection)}
            disabled={locked}
            onChange={(event) => onChange({
              ...conditions,
              windDirection: toNumber(event.target.value),
            })}
          />
        </Field>

        <Field id={`${idPrefix}-wind-min`} label={t('race.conditions.windMin')}>
          <Input
            id={`${idPrefix}-wind-min`}
            type="number"
            min={0}
            placeholder={inherited(resolved?.windMin)}
            value={fromNumber(conditions.windMin)}
            disabled={locked}
            onChange={(event) => onChange({ ...conditions, windMin: toNumber(event.target.value) })}
          />
        </Field>

        <Field id={`${idPrefix}-wind-max`} label={t('race.conditions.windMax')}>
          <Input
            id={`${idPrefix}-wind-max`}
            type="number"
            min={0}
            placeholder={inherited(resolved?.windMax)}
            value={fromNumber(conditions.windMax)}
            disabled={locked}
            onChange={(event) => onChange({ ...conditions, windMax: toNumber(event.target.value) })}
          />
        </Field>
      </div>
    </div>
  );
};
