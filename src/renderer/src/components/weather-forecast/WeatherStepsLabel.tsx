import { useTranslation } from 'react-i18next';

import { WEATHER_TYPE_LABEL } from './constants.ts';
import type { ForecastStep } from '../../../../shared/types';

interface WeatherStepsLabelProps {
  /**
   * The stretches of weather to name, in order.
   */
  steps: readonly ForecastStep[];
  /**
   * Whether the weather was generated, which is what tells an empty list with
   * nothing on offer from one naming a preset folder.
   */
  generated: boolean;
}

/**
 * A session's weather in words: one weather, what it changes into, or why there
 * is no type to name.
 */
export const WeatherStepsLabel = ({ steps, generated }: WeatherStepsLabelProps) => {
  const { t } = useTranslation();
  const [first, last] = [steps[0], steps[steps.length - 1]];

  if (!first) return <>{generated ? t('forecast.unavailable') : t('forecast.preset')}</>;
  if (steps.length === 1) return <>{t(WEATHER_TYPE_LABEL[first.weather])}</>;

  return (
    <>
      {t('forecast.change', {
        from: t(WEATHER_TYPE_LABEL[first.weather]),
        to: t(WEATHER_TYPE_LABEL[last.weather]),
      })}
    </>
  );
};
