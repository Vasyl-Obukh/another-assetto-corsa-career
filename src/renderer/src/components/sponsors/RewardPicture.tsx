import { CarIcon, ChevronRightIcon, StoreIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { SponsorCar } from '../../../../shared/types';
import { carPictureSources, ContentImage } from '@/components/content-image/index.ts';
import { path } from '@/lib/routes';

interface RewardPictureProps {
  /**
   * The car a reward names.
   */
  car: SponsorCar;
}

/**
 * The car a reward names, on its offer: its picture and the way to its page.
 */
export const RewardPicture = ({ car }: RewardPictureProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="relative aspect-video overflow-hidden rounded-md bg-scrim">
        <ContentImage
          sources={carPictureSources(car.model, car.skin)}
          alt={car.name}
          className="object-cover"
          fallback={(
            <span className="absolute inset-0 grid place-items-center">
              <CarIcon className="size-6 text-on-scrim/40" />
            </span>
          )}
        />
      </span>
      <Link to={path.car({ id: car.model })} className="flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline">
        <StoreIcon className="size-3.5" />
        {t('trade.openCar')}
        <ChevronRightIcon className="size-3.5" />
      </Link>
    </div>
  );
};
