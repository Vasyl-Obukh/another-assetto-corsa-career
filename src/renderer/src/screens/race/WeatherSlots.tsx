import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  addWeatherSlot,
  fromNumber,
  offeredTypes,
  removeWeatherSlot,
  setWeatherSlot,
  toNumber,
  withChosenTypes,
} from './utils.ts';
import { WeatherSelect } from './WeatherSelect.tsx';
import type {
  Conditions, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { supportsDynamic } from '../../../../shared/utils/weather-system';
import { useSettings } from '@/app';
import { WEATHER_TYPE_LABEL } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';

interface WeatherSlotsProps {
  /**
   * The conditions being edited, weekend defaults or a session's overrides.
   */
  conditions: Conditions;
  /**
   * Every installed weather preset, which is what says a type is renderable.
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
   * Whether RainFX will draw rain. With it off, wet weather is never offered,
   * because asking for it would produce a dry race and say nothing.
   */
  rainFx: boolean;
  /**
   * Whether weather that changes over the session can be asked for here.
   *
   * False for the weekend defaults, which every session inherits: a plan there
   * would run the same rain at the same minute in practice, in qualifying and
   * in the race. Weather changes belong to a session, which is one launch.
   */
  allowSlots: boolean;
  /**
   * What makes this picker's control ids unique on the page.
   */
  idPrefix: string;
  /**
   * What the "no choice" entry reads as.
   */
  noneLabel: string;
  /**
   * Whether the weekend has started, in which case nothing can change.
   */
  locked: boolean;
  /**
   * Called with the whole set whenever any part of it changes.
   * @param conditions The conditions to apply
   */
  onChange: (conditions: Conditions) => void;
}

/**
 * The weather a session runs in: one slot is static, more than one is a plan.
 *
 * Each slot is a three-column grid rather than a wrapping row, so the weather
 * select takes whatever width there is and the length stays put. Only the length
 * column is headed: what the first one holds is said by the section this sits
 * in, and repeating "Weather" directly under that heading read as a mistake.
 * The labels the headings would carry survive as `aria-label`.
 */
export const WeatherSlots = ({
  conditions, weather, controllers, system, rainFx, allowSlots, idPrefix, noneLabel, locked,
  onChange,
}: WeatherSlotsProps) => {
  const { t } = useTranslation();

  const { settings } = useSettings();

  const steps = conditions.weatherSteps ?? [];
  const offered = offeredTypes(weather, system, rainFx, settings.allowedWeather);
  const types = withChosenTypes(offered, conditions);
  // One step is a weather that simply holds, which is static weather by another
  // name - so the plain picker stays until there are two.
  const changing = steps.length > 1;

  return (
    <div className="flex max-w-lg flex-col gap-3">
      {changing ? (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_6rem_2.25rem] items-end gap-2">
            <span />
            <span className="text-xs text-muted-foreground">{t('race.conditions.slotFor')}</span>
            <span />
          </div>

          {steps.map((step, index) => {
            const last = index === steps.length - 1;

            return (
              <div
                // Slots carry no identity of their own and are edited by
                // position, so their index is the only key there is.
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="grid grid-cols-[1fr_6rem_2.25rem] items-end gap-2"
              >
                <Select
                  value={String(step.weather)}
                  disabled={locked}
                  onValueChange={(value) => onChange(
                    setWeatherSlot(conditions, index, { weather: Number(value) }),
                  )}
                >
                  <SelectTrigger
                    id={`${idPrefix}-slot-${index}`}
                    className="w-full"
                    aria-label={t('race.conditions.slot', { index: index + 1 })}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type} value={String(type)}>
                        {t(WEATHER_TYPE_LABEL[type])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  id={`${idPrefix}-slot-${index}-minutes`}
                  type="number"
                  min={1}
                  aria-label={t('race.conditions.slotMinutes')}
                  // The last slot holds until the session ends, which is what
                  // makes a plan expressible for a race measured in laps.
                  placeholder={last ? t('race.conditions.slotUntilEnd') : ''}
                  value={last ? '' : fromNumber(step.minutes)}
                  disabled={locked || last}
                  onChange={(event) => onChange(
                    setWeatherSlot(conditions, index, { minutes: toNumber(event.target.value) }),
                  )}
                />

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={t('race.conditions.slotRemove')}
                  disabled={locked}
                  onClick={() => onChange(removeWeatherSlot(conditions, index))}
                >
                  <Trash2Icon />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <WeatherSelect
          conditions={conditions}
          controllers={controllers}
          types={types}
          id={`${idPrefix}-weather`}
          locked={locked}
          noneLabel={noneLabel}
          onChange={(choice) => onChange(setWeatherSlot(conditions, -1, {}, choice, controllers))}
        />
      )}

      {allowSlots && supportsDynamic(system) ? (
        <div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={locked}
            onClick={() => onChange(addWeatherSlot(conditions, weather, offered))}
          >
            <PlusIcon />
            {changing ? t('race.conditions.slotAdd') : t('race.conditions.slotMakeChanging')}
          </Button>
        </div>
      ) : null}

      {changing ? (
        <p className="text-xs text-muted-foreground">{t('race.conditions.slotHint')}</p>
      ) : null}
    </div>
  );
};
