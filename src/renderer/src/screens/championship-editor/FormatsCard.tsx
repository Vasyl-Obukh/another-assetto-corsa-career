import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormatPage } from './FormatPage.tsx';
import { nextFormat, roundsRunning } from './utils.ts';
import type {
  Championship, Weather, WeatherController, WeatherSystem,
} from '../../../../shared/types';
import { cn } from '@/lib/utils.ts';
import { nextSession } from '@/screens/race';

interface FormatsCardProps {
  /**
   * The championship being edited.
   */
  series: Championship;
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
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole championship whenever a format changes.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

/**
 * The event formats as tabs across the top, each saying how many rounds run
 * it, and the one picked opened below.
 */
export const FormatsCard = ({
  series, weather, controllers, system, locked, onChange,
}: FormatsCardProps) => {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<string | null>(null);
  const formats = series.eventFormats;
  const format = formats.find((one) => one.id === picked) ?? formats[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h2 className="text-base font-semibold">{t('editor.formats.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('editor.formats.hintShort')}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {formats.map((one) => {
          const running = roundsRunning(series, one.id);

          return (
            <button
              key={one.id}
              type="button"
              aria-pressed={one.id === format?.id}
              className={cn(
                'flex items-baseline gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm font-medium',
                one.id === format?.id ? 'border-primary ring-1 ring-primary' : 'hover:bg-accent/50',
              )}
              onClick={() => setPicked(one.id)}
            >
              {one.name}
              <span className="text-xs font-normal text-muted-foreground">
                {series.defaultEventFormat === one.id
                  ? t('editor.formats.tabDefault', { count: running })
                  : t('editor.formats.rounds', { count: running })}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={locked}
          onClick={() => {
            // A new format starts as one day with one race, edited from there.
            const next = nextFormat(series, [nextSession([])]);
            onChange({ ...series, eventFormats: [...formats, next] });
            setPicked(next.id);
          }}
        >
          <PlusIcon className="size-4" />
          {t('editor.formats.add')}
        </button>
      </div>

      {format === undefined ? null : (
        <FormatPage
          key={format.id}
          series={series}
          format={format}
          weather={weather}
          controllers={controllers}
          system={system}
          locked={locked}
          onChange={onChange}
          onDuplicate={() => {
            const copy = { ...nextFormat(series, format.sessions), name: t('editor.formats.copyName', { name: format.name }) };
            onChange({ ...series, eventFormats: [...formats, copy] });
            setPicked(copy.id);
          }}
        />
      )}
    </div>
  );
};
