import type { ReactNode } from 'react';


import { ChoiceChips } from './ChoiceChips.tsx';
import { CONDITION_GROUP_ORDER, CONDITION_SEEDS } from './constants.ts';
import { TemperatureControl } from './TemperatureControl.tsx';
import { TimeOfDayControl } from './TimeOfDayControl.tsx';
import type { ConditionGroup } from './types.ts';
import { coeffOf, groupSet, withoutGroup } from './utils.ts';
import { WeatherControl } from './WeatherControl.tsx';
import { WindControl } from './WindControl.tsx';
import { WeatherType } from '../../../../shared/constants';
import type {
  Conditions, TrackStateName, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { useSettings } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { offeredTypes, TRACK_STATE_LABEL, TRACK_STATES } from '@/screens/race';

interface ConditionsEditorProps {
  /**
   * Prefix for the controls' ids.
   */
  idPrefix: string;
  /**
   * The conditions being edited.
   */
  conditions: Conditions;
  /**
   * What stands behind a group left alone: a round falls back on the climate
   * when the championship generates its weather and on Assetto Corsa's own
   * defaults otherwise; a session falls back on its round, or on its event
   * when the event is no round.
   */
  behind: 'climate' | 'default' | 'round' | 'event';
  /**
   * How it is laid out: a round's groups as rows with their controls beside
   * them, or a session's as a list that opens a group once it is set.
   */
  layout: 'rows' | 'list';
  /**
   * What a group set in rows is set for: a round, or a race event of the
   * player's own, which is no round.
   */
  scope?: 'round' | 'event';
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
   * Called with the conditions whenever any group changes.
   * @param next The conditions
   */
  onChange: (next: Conditions) => void;
}

/**
 * Conditions a group at a time - weather, time of day, temperature, track and
 * wind - each either left to what stands behind it or set here. Setting one
 * starts it somewhere sensible; leaving it drops everything it held.
 */
export const ConditionsEditor = ({
  idPrefix, conditions, behind, layout, scope = 'round', weather, controllers, system, locked, onChange,
}: ConditionsEditorProps) => {
  const { t } = useKindTranslation();
  const { settings } = useSettings();
  const offered = offeredTypes(weather, system, true, settings.allowedWeather);

  /**
   * Sets a group here, starting it from a sensible value.
   * @param group Which group
   */
  const set = (group: ConditionGroup): void => onChange(group === 'weather'
    ? { ...conditions, weatherType: offered[0] ?? WeatherType.CLEAR }
    : { ...conditions, ...CONDITION_SEEDS[group] });

  /**
   * The control for one group.
   * @param group Which group
   * @param disabled Whether it is shown only for what it would be
   * @returns The control
   */
  const control = (group: ConditionGroup, disabled: boolean): ReactNode => {
    switch (group) {
      case 'weather':
        return (
          <WeatherControl
            idPrefix={`${idPrefix}-weather`}
            conditions={conditions}
            weather={weather}
            controllers={controllers}
            system={system}
            locked={disabled}
            onChange={onChange}
          />
        );
      case 'time':
        return (
          <TimeOfDayControl
            id={`${idPrefix}-time`}
            value={conditions.timeOfDay}
            disabled={disabled}
            onChange={(timeOfDay) => onChange({ ...conditions, timeOfDay })}
          />
        );
      case 'temperature':
        return (
          <TemperatureControl
            idPrefix={idPrefix}
            conditions={conditions}
            coeff={coeffOf(conditions, weather)}
            disabled={disabled}
            onChange={onChange}
          />
        );
      case 'track':
        // Neutral on purpose: how rubbered in a track is, a setting rather
        // than a set any other screen colours.
        return (
          <ChoiceChips<TrackStateName>
            label={t('race.conditions.trackState')}
            options={TRACK_STATES}
            value={conditions.trackState ?? 'fast'}
            labelOf={(state) => t(TRACK_STATE_LABEL[state])}
            disabled={disabled}
            onChange={(trackState) => onChange({ ...conditions, trackState })}
          />
        );
      default:
        return <WindControl idPrefix={idPrefix} conditions={conditions} disabled={disabled} onChange={onChange} />;
    }
  };

  if (layout === 'list') {
    return (
      <div className="flex flex-col overflow-hidden rounded-lg border">
        {CONDITION_GROUP_ORDER.map((group) => {
          const own = groupSet(conditions, group);

          return (
            <div key={group} className={cn('flex flex-col gap-3 border-t px-3 py-2.5 first:border-t-0', own && 'bg-primary/5')}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="w-28 text-sm font-medium">{t(`editor.conditions.groups.${group}`)}</span>
                <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {own ? t('editor.conditions.setSession') : t(`editor.conditions.behind.${behind}`)}
                </span>
                {own ? (
                  <Button type="button" size="sm" variant="ghost" disabled={locked} onClick={() => onChange(withoutGroup(conditions, group))}>
                    {t('editor.conditions.reset')}
                  </Button>
                ) : (
                  <Button type="button" size="sm" variant="outline" disabled={locked} onClick={() => set(group)}>
                    {t('editor.conditions.setForSession')}
                  </Button>
                )}
              </div>
              {own ? control(group, locked) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {CONDITION_GROUP_ORDER.map((group) => {
        const own = groupSet(conditions, group);
        const switchId = `${idPrefix}-${group}-own`;

        return (
          <div key={group} className="grid overflow-hidden rounded-lg border sm:grid-cols-[12rem_minmax(0,1fr)]">
            <div className="flex flex-col gap-2 border-b bg-muted/40 px-3.5 py-3 sm:border-r sm:border-b-0">
              <b className="text-sm font-semibold">{t(`editor.conditions.groups.${group}`)}</b>
              <label htmlFor={switchId} className="flex items-center gap-2 text-xs">
                <Switch
                  id={switchId}
                  checked={own}
                  disabled={locked}
                  onCheckedChange={(on) => (on ? set(group) : onChange(withoutGroup(conditions, group)))}
                />
                {own ? t(scope === 'event' ? 'editor.conditions.setEvent' : 'editor.conditions.setRound') : t(`editor.conditions.behind.${behind}`)}
              </label>
              <span className="text-xs text-muted-foreground">{t(`editor.conditions.hints.${group}`)}</span>
            </div>
            {/* A lone row of chips centres beside the taller column of its name. */}
            <div
              className={cn(
                'min-w-0 px-3.5 py-3',
                group === 'track' && 'flex items-center',
                !own && 'pointer-events-none opacity-50',
              )}
            >
              {control(group, locked || !own)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
