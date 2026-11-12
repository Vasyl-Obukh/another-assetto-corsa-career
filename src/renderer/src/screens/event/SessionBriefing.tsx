import { InfoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BriefTile } from './BriefTile.tsx';
import { LengthTile } from './LengthTile.tsx';
import type { RaceLengthControl } from './types.ts';
import type { EventSession } from '../../../../shared/types';
import {
  driedAny, WeatherStepIcons, WeatherStepsLabel, weatherWords,
} from '@/components';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
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
  /**
   * Whether the event may race in the wet - always, for a race event of the
   * player's own, whose weather they pick.
   */
  rain?: boolean;
}

export const SessionBriefing = ({ session, length, rain = true }: SessionBriefingProps) => {
  const { t } = useTranslation();
  const { formatNumber } = useFormat();

  const { forecast, inherit, pending } = session;
  const race = session.type === 'race';
  // Two ways to have no forecast, and they mean opposite things: a generated
  // event the clock has not reached yet has one coming, an authored one never
  // will.
  let missing = t('event.brief.authored');
  if (pending) missing = t('event.brief.pending');
  else if (!rain) missing = t('event.brief.authoredDry');
  // Rain not allowed shows the dry weather that runs, and what it stands in for.
  const dried = !rain && forecast !== null && driedAny(forecast.steps);

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
              {dried ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground">
                      {t('event.brief.dried', { weather: weatherWords(forecast.steps.map((step) => step.weather), t) })}
                      <InfoIcon className="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t('event.brief.driedTip', {
                      actual: weatherWords(forecast.steps.map((step) => step.weather), t),
                      intended: weatherWords(forecast.steps.map((step) => step.intended), t),
                    })}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span className="text-xs text-muted-foreground">
                  <WeatherStepsLabel steps={forecast.steps} generated={forecast.generated} />
                </span>
              )}
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
