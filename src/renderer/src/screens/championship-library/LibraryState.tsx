import { useTranslation } from 'react-i18next';

import { AvailabilityTip } from './AvailabilityTip.tsx';
import type { SeriesListing } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip.tsx';
import { OriginBadge } from '@/screens/championships';

interface LibraryStateProps {
  /**
   * The championship and whether the library can race it.
   */
  listing: SeriesListing;
}

// What a row says about itself beyond its figures: whose it is, whether it can
// be raced and whether an event of it is under way. Nothing for one of ours
// that races fine, which is most of the library.
export const LibraryState = ({ listing }: LibraryStateProps) => {
  const { t } = useTranslation();
  const locked = listing.event !== null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <OriginBadge origin={listing.origin} />
      <AvailabilityTip listing={listing} />
      {/* Short on the row, the card's whole sentence on hover. */}
      {locked ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="warning" tabIndex={0} className="cursor-help">
              {t('championshipLibrary.table.underway')}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{t('championships.actions.editLocked')}</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
};
