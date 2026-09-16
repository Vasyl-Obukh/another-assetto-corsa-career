import { useTranslation } from 'react-i18next';

import { WEATHER_TYPE_LABEL } from './constants.ts';
import { WeatherStepIcons } from './WeatherStepIcons.tsx';
import { WeatherStepsLabel } from './WeatherStepsLabel.tsx';
import type { SessionForecast } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { useFormat } from '@/i18n';

interface SessionForecastChipProps {
  /**
   * The session's forecast.
   */
  session: SessionForecast;
}

/**
 * One session's weather at a glance - its icons and its air temperature - with
 * the words on hover.
 *
 * Neutral on purpose: which weather it is is already carried by the icon, and a
 * strip of these would be a rainbow if each weather wore a colour as well.
 */
export const SessionForecastChip = ({ session }: SessionForecastChipProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();
  const name = session.name ?? t(`race.sessionType.${session.type}`);
  const swapped = session.steps.filter((step) => step.intended !== step.weather);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="relative z-10 gap-1 tabular-nums" tabIndex={0}>
          <WeatherStepIcons steps={session.steps} />
          {t('forecast.ambient', { value: formatNumber(session.ambient) })}
        </Badge>
      </TooltipTrigger>

      <TooltipContent>
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{name}</span>
          <span><WeatherStepsLabel steps={session.steps} generated={session.generated} /></span>
          {session.generated ? null : <span>{t('forecast.authored')}</span>}
          {swapped.map((step) => (
            <span key={`${step.intended}-${step.weather}`}>
              {t('forecast.substituted', {
                intended: t(WEATHER_TYPE_LABEL[step.intended]),
                actual: t(WEATHER_TYPE_LABEL[step.weather]),
              })}
            </span>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
