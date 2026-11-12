import { useTranslation } from 'react-i18next';

import { weatherWords } from './utils.ts';
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

  if (steps.length === 0) return <>{generated ? t('forecast.unavailable') : t('forecast.preset')}</>;

  return <>{weatherWords(steps.map((step) => step.weather), t)}</>;
};
