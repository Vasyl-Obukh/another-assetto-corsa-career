import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';


import type { WeatherType } from '../../../../shared/constants';
import { WEATHER_ICON, WEATHER_TYPE_LABEL, WeatherPicker } from '@/components';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { useKindTranslation } from '@/i18n';

interface WeatherSlotButtonProps {
  /**
   * The trigger's id.
   */
  id: string;
  /**
   * What the slot is, already translated, for assistive technology.
   */
  label: string;
  /**
   * The weather the slot runs, if it names one.
   */
  value: WeatherType | undefined;
  /**
   * The types that may be picked.
   */
  offered: readonly WeatherType[];
  /**
   * Whether nothing may change just now.
   */
  disabled: boolean;
  /**
   * Called with the weather picked.
   * @param type The weather
   */
  onPick: (type: WeatherType) => void;
}

/**
 * One slot of a weather that changes: its weather as a field, opening the
 * same two-step picker a weather that holds is picked with.
 */
export const WeatherSlotButton = ({
  id, label, value, offered, disabled, onPick,
}: WeatherSlotButtonProps) => {
  const { t } = useKindTranslation();
  const [open, setOpen] = useState(false);
  const Icon = value === undefined ? undefined : WEATHER_ICON[value];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-label={label}
          disabled={disabled}
          className="flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm shadow-xs hover:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        >
          {Icon ? <Icon className="size-4 shrink-0" /> : null}
          <span className="min-w-0 flex-1 truncate">{value === undefined ? null : t(WEATHER_TYPE_LABEL[value])}</span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(36rem,calc(100vw-2rem))]">
        <WeatherPicker
          value={value}
          offered={offered}
          banner={false}
          onPick={(type) => {
            onPick(type);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
