import { CarIcon, GiftIcon, WarehouseIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { SponsorCar } from '../../../../shared/types';
import { carPictureSources, CarSourceBadge, ContentImage } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { SPONSOR_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface GoalRewardProps {
  /**
   * The car a goal met brought.
   */
  car: SponsorCar;
}

// The car a goal met brought, already in the garage.
export const GoalReward = ({ car }: GoalRewardProps) => {
  const { t } = useTranslation();

  return (
    // Washed lighter than its chip, so the chip still stands on it.
    <div className="flex flex-wrap items-center gap-3.5 rounded-lg bg-sponsor/45 p-3">
      <span className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-md bg-scrim">
        <ContentImage
          sources={carPictureSources(car.model, car.skin)}
          alt={car.name}
          className="object-cover"
          fallback={(
            <span className="absolute inset-0 grid place-items-center">
              <CarIcon className="size-5 text-on-scrim/40" />
            </span>
          )}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge className={cn('gap-1', SPONSOR_ACCENT.main)}>
            <GiftIcon className="size-3" />
            {t('inbox.sponsorNews.goalMet.reward')}
          </Badge>
          <CarSourceBadge source="owned" />
        </span>
        <span className="truncate font-semibold">{car.name}</span>
      </span>
      <Button variant="outline" asChild>
        <Link to={path.garage()}>
          <WarehouseIcon />
          {t('inbox.sponsorNews.goalMet.garage')}
        </Link>
      </Button>
    </div>
  );
};
