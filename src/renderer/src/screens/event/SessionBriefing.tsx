import { useTranslation } from 'react-i18next';

import { BriefTile } from './BriefTile.tsx';
import { LengthTile } from './LengthTile.tsx';
import type { RaceLengthControl } from './types.ts';
import type { EventSession } from '../../../../shared/types';
import { WeatherStepIcons, WeatherStepsLabel } from '@/components';
import { useFormat } from '@/i18n';

interface SessionBriefingProps {
  /**
   * The session to brief.
   */
  session: EventSession;
  /**
   * How the race is shortened for its launch, for a career round's race that
   * runs next.
   */
  length?: RaceLengthControl;
}

export const SessionBriefing = ({ session, length }: SessionBriefingProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const { forecast, inherit, pending } = session;
  const race = session.type === 'race';
  // Two ways to have no forecast, and they mean opposite things: a generated
  // event the clock has not reached yet has one coming, an authored one never
  // will.
  const missing = pending ? t('event.brief.pending') : t('event.brief.authored');

  // A grid of several classes reverses the front of each class unless it
  // mixes them.
  const each = session.classGrid === 'byClass';
  let source: string;
  if (inherit === null) {
    source = race ? t('event.source.skill') : t('event.source.pitLane');
  } else if (inherit.reverse !== undefined) {
    const count = inherit.reverse;
    if (inherit.from === null) {
      source = each
        ? t('event.source.previousReversedEach', { count })
        : t('event.source.previousReversed', { count });
    } else {
      source = each
        ? t('event.source.reversedEach', { from: inherit.from, count })
        : t('event.source.reversed', { from: inherit.from, count });
    }
  } else {
    source = inherit.from === null
      ? t('event.source.previous')
      : t('event.source.from', { from: inherit.from });
  }
  let classes: string | null = null;
  if (session.classGrid === 'byClass') classes = t('event.source.byClass');
  else if (session.classGrid === 'mixed') classes = t('event.source.mixed');

  let start: string;
  if (!race) start = t('event.start.pitLane');
  else if (session.startSlot === null) start = t('event.start.later');
  else start = t('event.position', { position: session.startSlot });

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <LengthTile session={session} length={length} />

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

      <p className="text-sm text-muted-foreground">
        {classes === null ? source : t('common.sentences', { first: source, second: classes })}
      </p>
    </div>
  );
};
