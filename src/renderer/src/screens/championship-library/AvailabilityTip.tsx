import { useTranslation } from 'react-i18next';

import { TIP_LIST_LIMIT } from './constants.ts';
import type { SeriesListing } from '../../../../shared/types';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { useAppError } from '@/i18n';
import {
  AvailabilityBadge, availabilityState, missingContent, missingTrackLabel,
} from '@/screens/championships';

interface AvailabilityTipProps {
  /**
   * The championship and whether the library can race it.
   */
  listing: SeriesListing;
}

// Unavailable or Misconfigured, with what is wrong on hover, so a row stays one
// line high. A button, so the answer is reachable from the keyboard too.
export const AvailabilityTip = ({ listing }: AvailabilityTipProps) => {
  const { t } = useTranslation();
  const describeError = useAppError();
  const state = availabilityState(listing.availability);

  if (state === 'available') return null;

  const { problems } = listing.availability;
  const { cars, tracks, pitboxes } = missingContent(listing);
  const named = (ids: readonly string[]): string => (ids.length > TIP_LIST_LIMIT
    ? [...ids.slice(0, TIP_LIST_LIMIT), t('championshipLibrary.table.andMore', { count: ids.length - TIP_LIST_LIMIT })]
      .join(', ')
    : ids.join(', '));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex cursor-help rounded-md">
          <AvailabilityBadge availability={listing.availability} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="end" className="flex max-w-sm flex-col gap-1.5 py-2 text-left">
        {state === 'misconfigured' ? (
          <>
            <span className="font-semibold">{t('championships.problems.series', { count: problems.length })}</span>
            <ul className="flex list-disc flex-col gap-0.5 pl-4">
              {problems.map((problem) => <li key={(problem.code ?? '') + problem.message}>{describeError(problem)}</li>)}
            </ul>
            <span className="opacity-70">{t('championships.problems.seriesHint')}</span>
          </>
        ) : (
          <>
            {cars.length > 0 ? (
              <span>
                <span className="mr-1.5 opacity-70">{t('championships.missing.cars')}</span>
                <span className="font-mono">{named(cars.map((car) => car.id))}</span>
              </span>
            ) : null}
            {tracks.length > 0 ? (
              <span>
                <span className="mr-1.5 opacity-70">{t('championships.missing.tracks')}</span>
                <span>{named(tracks.map((track) => missingTrackLabel(track, t)))}</span>
              </span>
            ) : null}
            {pitboxes.length > 0 ? (
              <span>
                <span className="mr-1.5 opacity-70">{t('championships.missing.pitboxes')}</span>
                <span>
                  {named(pitboxes.map((one) => t('championships.missing.pitboxesAt', {
                    track: one.track, available: one.available, needed: one.needed,
                  })))}
                </span>
              </span>
            ) : null}
            <span className="opacity-70">{t('championshipLibrary.unavailable')}</span>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
};
