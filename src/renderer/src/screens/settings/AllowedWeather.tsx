import { useTranslation } from 'react-i18next';

import { SubHeading } from './SubHeading.tsx';
import { DEFAULT_ALLOWED_WEATHER, WEATHER_TYPE_ORDER } from '../../../../shared/constants';
import { useSettings } from '@/app';
import { WEATHER_KINDS, WEATHER_TYPE_LABEL } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { toggled } from '@/screens/content-sources';

export const AllowedWeather = () => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const { settings, patch } = useSettings();
  const allowed = new Set(settings.allowedWeather);

  return (
    <>
      <div className="mt-5 mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <SubHeading className="mb-0">{t('settings.allowedWeather')}</SubHeading>
        <span className="text-xs text-muted-foreground">
          {t('settings.allowedWeatherCount', {
            count: formatNumber(allowed.size),
            total: formatNumber(WEATHER_TYPE_ORDER.length),
          })}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => patch({ allowedWeather: [...DEFAULT_ALLOWED_WEATHER] })}
        >
          {t('settings.allowedWeatherReset')}
        </Button>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{t('settings.allowedWeatherHint')}</p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-2.5">
        {WEATHER_KINDS.map((group) => {
          const on = group.types.filter((type) => allowed.has(type)).length;

          return (
            <div key={group.label} className="flex flex-col gap-2 rounded-lg border p-3">
              <span className="flex items-center justify-between text-sm font-semibold">
                {t(group.label)}
                <span className="text-xs font-normal text-muted-foreground">
                  {t('settings.allowedWeatherCount', {
                    count: formatNumber(on),
                    total: formatNumber(group.types.length),
                  })}
                </span>
              </span>

              <div className="flex flex-wrap gap-1.5">
                {group.types.map((type) => {
                  const selected = allowed.has(type);
                  // The last type still allowed stays on: a sim with no
                  // weather at all has nothing to race in.
                  const locked = selected && allowed.size === 1;

                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={selected}
                      disabled={locked}
                      className={cn(
                        'rounded-md border px-2 py-0.5 text-xs transition-colors',
                        selected
                          ? cn('border-transparent', group.accent)
                          : 'border-dashed border-input text-muted-foreground hover:border-foreground/40',
                      )}
                      onClick={() => patch({
                        allowedWeather: toggled(settings.allowedWeather, type, WEATHER_TYPE_ORDER),
                      })}
                    >
                      {t(WEATHER_TYPE_LABEL[type])}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
