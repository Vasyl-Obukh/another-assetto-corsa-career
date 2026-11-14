import { CloudSunIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ClimateBadge } from './ClimateBadge.tsx';
import { forecastDays } from './utils.ts';
import { WeatherStepIcons } from './WeatherStepIcons.tsx';
import { WeatherStepsLabel } from './WeatherStepsLabel.tsx';
import type { RoundForecast } from '../../../../shared/types';
import { useUnits } from '@/hooks';

interface EventForecastProps {
  /**
   * The round's forecast.
   */
  forecast: RoundForecast;
}

/**
 * A round's event, day by day and session by session, in words.
 *
 * What the player reads before committing to a round, so it says everything the
 * calendar's strip only draws: the weather by name, the air and the wind.
 */
export const EventForecast = ({ forecast }: EventForecastProps) => {
  const { t } = useTranslation();
  const units = useUnits();

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <CloudSunIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{t('forecast.title')}</span>
        <ClimateBadge climate={forecast.climate} />
      </div>

      {forecastDays(forecast.sessions).map(({ day, sessions }) => (
        <div key={day} className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            {t('forecast.day', { number: day + 1 })}
          </span>

          {sessions.map((session) => (
            <div
              key={session.index}
              // The icon column is wide enough for a change - two icons and the
              // arrow between them - so every row's words start on one edge.
              className="grid grid-cols-[minmax(0,7rem)_3.25rem_minmax(0,1fr)_auto] items-center gap-2 text-sm"
            >
              <span className="truncate">
                {session.name ?? t(`race.sessionType.${session.type}`)}
              </span>
              <WeatherStepIcons steps={session.steps} />
              <span className="truncate"><WeatherStepsLabel steps={session.steps} generated={session.generated} /></span>
              <span className="flex gap-3 text-xs text-muted-foreground tabular-nums">
                <span>{units.format('temperature', session.ambient)}</span>
                {session.windMin !== null && session.windMax !== null ? (
                  <span className="hidden sm:inline">
                    {units.formatRange('speed', session.windMin, session.windMax)}
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      ))}

      <p className="text-xs text-muted-foreground">{t('forecast.hint')}</p>
    </div>
  );
};
