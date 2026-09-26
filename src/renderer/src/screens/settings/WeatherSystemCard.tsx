import { CheckIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { WEATHER_CAPABILITIES } from './constants.ts';
import type { WeatherSystem } from '../../../../shared/types';
import { supportsDynamic } from '../../../../shared/utils/weather-system';
import { cn } from '@/lib/utils.ts';

interface WeatherSystemCardProps {
  /**
   * The weather system the card offers.
   */
  system: WeatherSystem;
  /**
   * Whether it is the one in use.
   */
  selected: boolean;
  /**
   * Makes it the one in use.
   */
  onSelect(): void;
}

/**
 * One weather system, offered as what it can do rather than as a name: rain
 * works under all three, and the planner apps are what the other two add.
 */
export const WeatherSystemCard = ({ system, selected, onSelect }: WeatherSystemCardProps) => {
  const { t } = useTranslation();
  // Rain under plain CSP is real, only its strength comes from the type; PURE
  // and Sol read a preset's own figures, and only they have a planner.
  const can = {
    rain: true,
    dynamic: supportsDynamic(system),
    exactRain: system !== 'none',
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-card p-3 text-left hover-outline',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        selected && 'border-primary ring-1 ring-primary',
      )}
      onClick={onSelect}
    >
      <span className="flex items-center justify-between gap-2 text-sm font-semibold">
        {t(`weatherSystem.${system}`)}
        <span
          aria-hidden
          className={cn(
            'grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] border-input',
            selected && 'border-primary after:size-2 after:rounded-full after:bg-primary',
          )}
        />
      </span>

      <span className="flex flex-col gap-1 text-xs">
        {WEATHER_CAPABILITIES.map((capability) => (
          <span
            key={capability}
            className={cn('flex items-center gap-1.5', can[capability] ? 'text-success' : 'text-muted-foreground')}
          >
            {can[capability] ? <CheckIcon className="size-3.5" /> : <XIcon className="size-3.5" />}
            {t(`settings.weatherCan.${capability}`)}
          </span>
        ))}
      </span>
    </button>
  );
};
