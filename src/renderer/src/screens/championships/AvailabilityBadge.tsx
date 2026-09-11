import { AlertTriangleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AVAILABILITY_VARIANT } from './constants.ts';
import { availabilityState } from './utils.ts';
import type { SeriesAvailability } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';

interface AvailabilityBadgeProps {
  /**
   * What seriesAvailability said about the championship.
   */
  availability: SeriesAvailability;
}

export const AvailabilityBadge = ({ availability }: AvailabilityBadgeProps) => {
  const { t } = useTranslation();
  const state = availabilityState(availability);

  // One badge with three states rather than two: the card header is already
  // carrying enough that a second badge pushes every card to two lines. Three
  // colours too, since three states that all read grey-or-red would have been
  // two states wearing a third word.
  return (
    <Badge variant={AVAILABILITY_VARIANT[state]}>
      {state === 'misconfigured' ? <AlertTriangleIcon className="size-3" /> : null}
      {t(`championships.${state}`)}
    </Badge>
  );
};
