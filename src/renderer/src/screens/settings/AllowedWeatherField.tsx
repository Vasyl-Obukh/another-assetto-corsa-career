import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { WEATHER_GROUPS } from './constants.ts';
import { DEFAULT_ALLOWED_WEATHER, WEATHER_TYPE_ORDER } from '../../../../shared/constants';
import type { WeatherType } from '../../../../shared/constants';
import { useSettings } from '@/app';
import { FieldGrid, FieldRow, WEATHER_TYPE_LABEL } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useFormat } from '@/i18n';
import { CONTROL_WIDTH } from '@/lib/layout';
import { cn } from '@/lib/utils.ts';

export const AllowedWeatherField = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { settings, patch } = useSettings();
  const allowed = new Set(settings.allowedWeather);

  /**
   * Lets one type into the sim or keeps it out, keeping the list in menu order.
   * @param type The type to switch
   */
  const toggle = (type: WeatherType) => {
    const next = new Set(allowed);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    patch({ allowedWeather: WEATHER_TYPE_ORDER.filter((each) => next.has(each)) });
  };

  return (
    <FieldGrid>
      <FieldRow label={t('settings.allowedWeather')} hint={t('settings.allowedWeatherHint')}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(CONTROL_WIDTH, 'justify-between font-normal')}
              aria-label={t('settings.allowedWeather')}
            >
              {t('settings.allowedWeatherCount', {
                count: formatNumber(allowed.size),
                total: formatNumber(WEATHER_TYPE_ORDER.length),
              })}
              <ChevronDownIcon className="opacity-60" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-64 p-2">
            <div role="listbox" aria-multiselectable className="max-h-80 overflow-y-auto">
              {WEATHER_GROUPS.map((group) => (
                <div key={group.label} className="pb-1">
                  <div className="px-2 pt-2 pb-1 text-xs text-muted-foreground">{t(group.label)}</div>

                  {group.types.map((type) => {
                    const selected = allowed.has(type);
                    // The last type still allowed stays on: a sim with no
                    // weather at all has nothing to race in.
                    const locked = selected && allowed.size === 1;

                    return (
                      <button
                        key={type}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={locked}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                          'hover:bg-accent hover:text-accent-foreground disabled:opacity-60',
                        )}
                        onClick={() => toggle(type)}
                      >
                        <CheckIcon className={cn('size-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')} />
                        <span className="min-w-0 flex-1 truncate">{t(WEATHER_TYPE_LABEL[type])}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => patch({ allowedWeather: [...DEFAULT_ALLOWED_WEATHER] })}
            >
              {t('settings.allowedWeatherReset')}
            </Button>
          </PopoverContent>
        </Popover>
      </FieldRow>
    </FieldGrid>
  );
};
