import { useTranslation } from 'react-i18next';

import { BriefTile } from './BriefTile.tsx';
import { sessionLength } from './utils.ts';
import type { EventSession } from '../../../../shared/types';
import { WeatherStepIcons, WeatherStepsLabel } from '@/components';
import { useFormat } from '@/i18n';

interface SessionBriefingProps {
  /**
   * The session to brief.
   */
  session: EventSession;
}

export const SessionBriefing = ({ session }: SessionBriefingProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const { forecast, inherit, pending } = session;
  const race = session.type === 'race';
  // Two ways to have no forecast, and they mean opposite things: a generated
  // weekend the clock has not reached yet has one coming, an authored one never
  // will.
  const missing = pending ? t('event.brief.pending') : t('event.brief.authored');

  let source: string;
  if (inherit === null) {
    source = race ? t('event.source.skill') : t('event.source.pitLane');
  } else if (inherit.reverse !== undefined) {
    source = inherit.from === null
      ? t('event.source.previousReversed', { count: inherit.reverse })
      : t('event.source.reversed', { from: inherit.from, count: inherit.reverse });
  } else {
    source = inherit.from === null
      ? t('event.source.previous')
      : t('event.source.from', { from: inherit.from });
  }

  let start: string;
  if (!race) start = t('event.start.pitLane');
  else if (session.startSlot === null) start = t('event.start.later');
  else start = t('event.position', { position: session.startSlot });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <BriefTile label={t('event.brief.length')}>
          <span className="text-lg font-semibold">{sessionLength(session, t, formatNumber) ?? '-'}</span>
        </BriefTile>

        <BriefTile label={t('event.brief.weather')}>
          {forecast ? (
            <>
              <span className="flex items-center gap-2 text-lg font-semibold">
                <WeatherStepIcons steps={forecast.steps} />
                {t('event.brief.temperature', { value: formatNumber(forecast.ambient) })}
              </span>
              <span className="text-xs text-muted-foreground">
                <WeatherStepsLabel steps={forecast.steps} generated={forecast.generated} />
              </span>
            </>
          ) : <span className="text-sm text-muted-foreground">{missing}</span>}
        </BriefTile>

        <BriefTile label={t('event.brief.wind')}>
          {forecast && forecast.windMin !== null && forecast.windMax !== null ? (
            <span className="text-lg font-semibold">
              {t('event.brief.windRange', {
                min: formatNumber(forecast.windMin), max: formatNumber(forecast.windMax),
              })}
            </span>
          ) : <span className="text-sm text-muted-foreground">{missing}</span>}
        </BriefTile>

        <BriefTile label={t('event.brief.start')}>
          <span className="text-lg font-semibold">{start}</span>
        </BriefTile>
      </div>

      <p className="text-sm text-muted-foreground">{source}</p>
    </div>
  );
};
