import { FormatsCard } from './FormatsCard.tsx';
import { RacePrizes } from './RacePrizes.tsx';
import { RulesSheet } from './RulesSheet.tsx';
import { SeasonPrizes } from './SeasonPrizes.tsx';
import { pursesOf } from './utils.ts';
import type { Championship } from '../../../../shared/types';

interface SeasonRulesProps {
  /**
   * The championship whose points, prize money and events are laid out.
   */
  series: Championship;
  /**
   * The progression speed its prize money is shown at, 1 for the purse as
   * written.
   */
  speed?: number;
}

// Points, prize money and the event formats, as cards laid out to what there
// is to show rather than tables stretched across the page. Up to two ways of
// paying fit side by side; a lone format stacks under the season prizes, the
// shorter of the two; anything wider takes a row of its own.
export const SeasonRules = ({ series, speed = 1 }: SeasonRulesProps) => {
  const purses = pursesOf(series.prizes, series.entries, speed);
  const race = purses.filter((purse) => purse.prizes?.positions?.length);
  const season = purses.filter((purse) => purse.prizes?.standings?.length);
  const split = purses.length > 1;
  const wide = Math.max(race.length, season.length) > 2;
  const several = series.eventFormats.length > 1;

  const seasonCard = season.length > 0
    ? <SeasonPrizes purses={season} entries={series.entries} split={split} />
    : null;

  if (wide) {
    return (
      <div className="flex flex-col gap-4">
        <RacePrizes series={series} purses={race} split={split} />
        {seasonCard}
        <FormatsCard series={series} />
        <RulesSheet regulations={series.regulations ?? {}} />
      </div>
    );
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <RacePrizes series={series} purses={race} split={split} />
      <div className="flex flex-col gap-4">
        {seasonCard}
        {several ? null : <FormatsCard series={series} />}
        <RulesSheet regulations={series.regulations ?? {}} />
      </div>
      {several ? <FormatsCard series={series} className="lg:col-span-2" /> : null}
    </div>
  );
};
