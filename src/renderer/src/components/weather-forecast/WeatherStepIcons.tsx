import { ArrowRightIcon, CircleHelpIcon } from 'lucide-react';
import { Fragment } from 'react';

import { WEATHER_ICON } from './constants.ts';
import type { ForecastStep } from '../../../../shared/types';

interface WeatherStepIconsProps {
  /**
   * The stretches of weather to draw, in order.
   */
  steps: readonly ForecastStep[];
}

/**
 * A session's weather as icons, an arrow between each change.
 *
 * Drawn in the current text colour on purpose: the icon already says which
 * weather it is, and the colour a forecast spends is on its climate.
 */
export const WeatherStepIcons = ({ steps }: WeatherStepIconsProps) => {
  // A preset folder, or nothing on offer at all: there is no type to draw.
  if (steps.length === 0) return <CircleHelpIcon className="size-4 opacity-60" aria-hidden />;

  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {steps.map((step, index) => {
        const Icon = WEATHER_ICON[step.weather];

        return (
          // Steps carry no identity of their own, so their position is their key.
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={index}>
            {index > 0 ? <ArrowRightIcon className="size-3 opacity-60" /> : null}
            <Icon className="size-4" />
          </Fragment>
        );
      })}
    </span>
  );
};
