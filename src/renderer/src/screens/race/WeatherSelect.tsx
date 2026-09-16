import { useTranslation } from 'react-i18next';

import { NOT_SET } from './constants.ts';
import type { WeatherChoice } from './types.ts';
import { chosenWeather, weatherChoice, weatherValue } from './utils.ts';
import type { WeatherType } from '../../../../shared/constants';
import type { Conditions, WeatherController } from '../../../../shared/types';
import { WEATHER_TYPE_LABEL } from '@/components';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select.tsx';

interface WeatherSelectProps {
  /**
   * The race's conditions, which say what is currently chosen.
   */
  conditions: Conditions;
  /**
   * Every installed CSP weather controller, to tell a dynamic one from a
   * renderer when reading back what is already chosen.
   */
  controllers: WeatherController[];
  /**
   * The weather types worth offering, already filtered to what this install and
   * this weather system can actually render.
   */
  types: WeatherType[];
  /**
   * What makes this picker's control id unique on the page.
   */
  id: string;
  /**
   * Whether the weekend has started, in which case nothing can change.
   */
  locked: boolean;
  /**
   * What the first entry reads as. The weekend picker offers "whatever Assetto
   * Corsa would pick"; a session picker offers "same as weekend", which is a
   * different question with the same empty value behind it.
   */
  noneLabel: string;
  /**
   * Called with what the user picked.
   * @param choice The chosen entry
   */
  onChange: (choice: WeatherChoice) => void;
}

/**
 * The weather a session runs in, as one flat list of CSP weather types.
 *
 * Installed presets are deliberately not offered: listing them alongside the
 * types asks the same question twice, since a preset is just a folder carrying a
 * type. Nothing is lost, because `presetForType` already resolves a type to the
 * best preset behind it. A race file may still name one by hand through
 * `Conditions.weather`.
 */
export const WeatherSelect = ({
  conditions, controllers, types, id, locked, noneLabel, onChange,
}: WeatherSelectProps) => {
  const { t } = useTranslation();

  return (
    <Select
      value={weatherValue(chosenWeather(conditions, controllers))}
      disabled={locked}
      onValueChange={(value) => onChange(weatherChoice(value))}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value={NOT_SET}>{noneLabel}</SelectItem>

        {types.map((type) => (
          <SelectItem key={type} value={weatherValue({ kind: 'type', type })}>
            {t(WEATHER_TYPE_LABEL[type])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
