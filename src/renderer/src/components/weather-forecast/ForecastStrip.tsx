import { SessionForecastChip } from './SessionForecastChip.tsx';
import { forecastDays } from './utils.ts';
import type { RoundForecast } from '../../../../shared/types';
import { Separator } from '@/components/ui/separator.tsx';

interface ForecastStripProps {
  /**
   * The round's forecast.
   */
  forecast: RoundForecast;
}

/**
 * A round's whole event in one line: every session's weather, a rule between
 * the days.
 */
export const ForecastStrip = ({ forecast }: ForecastStripProps) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {forecastDays(forecast.sessions).map(({ day, sessions }, at) => (
      <div key={day} className="flex items-center gap-1.5">
        {at > 0 ? <Separator orientation="vertical" className="mx-1 h-4" /> : null}
        {sessions.map((session) => (
          <SessionForecastChip key={session.index} session={session} />
        ))}
      </div>
    ))}
  </div>
);
