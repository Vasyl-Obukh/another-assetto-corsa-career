import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';


import { RadioCard } from './RadioCard.tsx';
import { WeatherPlanBar } from './WeatherPlanBar.tsx';
import { WeatherSlotButton } from './WeatherSlotButton.tsx';
import { WeatherType } from '../../../../shared/constants';
import type {
  Conditions, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { supportsDynamic } from '../../../../shared/utils/weather-system';
import { useSettings } from '@/app';
import { ConfirmDialog, WeatherPicker } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import {
  addWeatherSlot, fromNumber, offeredTypes, removeWeatherSlot, setWeatherSlot, toNumber, withChosenTypes,
  withWeather,
} from '@/screens/race';

interface WeatherControlProps {
  /**
   * Prefix for the controls' ids.
   */
  idPrefix: string;
  /**
   * The conditions whose weather this is.
   */
  conditions: Conditions;
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];
  /**
   * Which mod renders the weather, which decides whether weather can change.
   */
  system: WeatherSystem;
  /**
   * Whether nothing may change just now.
   */
  locked: boolean;
  /**
   * Called with the conditions whenever the weather changes.
   * @param next The conditions
   */
  onChange: (next: Conditions) => void;
}

/**
 * The weather of a round or a session: one that holds all session, picked by
 * kind and then by how heavy, or one that changes as it runs - a plan of
 * slots, each weather for so long, the last until the flag.
 */
export const WeatherControl = ({
  idPrefix, conditions, weather, controllers, system, locked, onChange,
}: WeatherControlProps) => {
  const { t } = useKindTranslation();
  const { settings } = useSettings();
  const [dropping, setDropping] = useState(false);
  const offered = offeredTypes(weather, system, true, settings.allowedWeather);
  const types = withChosenTypes(offered, conditions);
  const steps = conditions.weatherSteps ?? [];
  const changing = steps.length > 1;
  const canChange = supportsDynamic(system);
  const preset = weather.find((one) => one.id === conditions.weather);
  const chosen = conditions.weatherType ?? preset?.type ?? undefined;

  /**
   * Picks the weather that holds all session.
   * @param type The weather
   */
  const hold = (type: WeatherType): void => onChange(withWeather(conditions, { kind: 'type', type }, controllers));

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label={t('editor.weather.mode')} className="grid gap-2 sm:grid-cols-2">
        {([false, true] as const).map((dynamic) => {
          const on = changing === dynamic;
          const unavailable = dynamic && !canChange;

          return (
            <RadioCard
              key={String(dynamic)}
              checked={on}
              disabled={locked || (unavailable && !on)}
              className={cn('px-3 py-2', unavailable && !on && 'opacity-60')}
              onClick={() => {
                if (on) return;
                if (dynamic) onChange(addWeatherSlot(conditions, weather, offered));
                else setDropping(true);
              }}
            >
              <span className="flex flex-col gap-0.5">
                <b className="text-sm font-semibold">{t(dynamic ? 'editor.weather.changes' : 'editor.weather.holds')}</b>
                <span className="text-xs text-muted-foreground">
                  {t(unavailable ? 'editor.weather.needsPlanner' : `editor.weather.${dynamic ? 'changesHint' : 'holdsHint'}`)}
                </span>
              </span>
            </RadioCard>
          );
        })}
      </div>

      {changing ? (
        <>
          <WeatherPlanBar steps={steps} />
          <ol className="flex flex-col gap-1.5">
            {steps.map((step, index) => {
              const last = index === steps.length - 1;

              return (
                // Slots carry no identity of their own, so their position is their key.
                // eslint-disable-next-line react/no-array-index-key
                <li key={index} className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto_2.25rem] items-center gap-2">
                  <span className="text-right text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                  <WeatherSlotButton
                    id={`${idPrefix}-slot-${index}`}
                    label={t('race.conditions.slot', { index: index + 1 })}
                    value={typeof step.weather === 'number' ? step.weather : undefined}
                    offered={types}
                    disabled={locked}
                    onPick={(type) => onChange(setWeatherSlot(conditions, index, { weather: type }))}
                  />
                  {/* The last holds until the flag: a race is laps, so nobody
                      knows how long it runs. */}
                  {last ? (
                    <span className="w-36 text-xs text-muted-foreground italic">{t('editor.weather.untilEnd')}</span>
                  ) : (
                    <label htmlFor={`${idPrefix}-slot-${index}-minutes`} className="flex w-36 items-center gap-1.5 text-xs text-muted-foreground">
                      {t('editor.weather.for')}
                      <Input
                        id={`${idPrefix}-slot-${index}-minutes`}
                        type="number"
                        min={1}
                        className="h-8 w-16 text-right tabular-nums"
                        value={fromNumber(step.minutes)}
                        disabled={locked}
                        onChange={(event) => onChange(
                          setWeatherSlot(conditions, index, { minutes: toNumber(event.target.value) }),
                        )}
                      />
                      {t('editor.weather.minutes')}
                    </label>
                  )}
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
                </li>
              );
            })}
          </ol>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={locked || !canChange}
              onClick={() => onChange(addWeatherSlot(conditions, weather, offered))}
            >
              <PlusIcon />
              {t('race.conditions.slotAdd')}
            </Button>
            <span className="text-xs text-muted-foreground">{t('race.conditions.slotHint')}</span>
          </div>
          {canChange ? null : <p className="text-xs text-muted-foreground">{t('editor.weather.planKept')}</p>}
        </>
      ) : (
        <WeatherPicker value={chosen} offered={types} disabled={locked} onPick={hold} />
      )}

      <ConfirmDialog
        open={dropping}
        title={t('editor.weather.dropTitle')}
        description={t('editor.weather.dropBody', { count: steps.length - 1 })}
        confirmLabel={t('editor.weather.drop')}
        onClose={() => setDropping(false)}
        onConfirm={() => {
          setDropping(false);
          const first = steps[0]?.weather;
          onChange({
            ...conditions,
            weatherSteps: undefined,
            weather: undefined,
            weatherType: typeof first === 'number' ? first : undefined,
          });
        }}
      />
    </div>
  );
};
