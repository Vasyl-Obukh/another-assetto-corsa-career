import { CarIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Car, Skin } from '../../../../shared/types';
import {
  CarPicker, carPictureSources, ContentImage, LiveryPlate,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { carImageSources } from '@/screens/car-browser';

interface SeatCarProps {
  /**
   * The installed cars the seat's class may race.
   */
  cars: readonly string[];
  /**
   * The car picked, or null.
   */
  car: Car | null;
  /**
   * Its livery, or null for the car's own choice.
   */
  skin: Skin | null;
  /**
   * Whether the championship is being started, which holds the button.
   */
  busy: boolean;
  /**
   * Picks a car and its livery.
   * @param car The car
   * @param skin Its livery, or null for a car that ships none
   */
  onPick: (car: Car, skin: Skin | null) => void;
}

/**
 * The seat's car as a quick race's car card shows it - the car in its livery,
 * its name and the livery's - with the car picker, narrowed to the class's
 * cars, a dialog away.
 */
export const SeatCar = ({
  cars, car, skin, busy, onPick,
}: SeatCarProps) => {
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);
  // An empty id list would offer the whole library, so a class with no
  // installed car is not offered the picker at all.
  const empty = cars.length === 0;

  const placeholder = (
    <div className="absolute inset-0 flex items-center justify-center">
      <CarIcon className="size-8 text-muted-foreground/40" />
    </div>
  );

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative aspect-[16/9] w-72 shrink-0 overflow-hidden rounded-md bg-muted">
        {car ? (
          <ContentImage
            sources={skin ? carPictureSources(car.id, skin.id) : carImageSources(car)}
            alt={skin?.name ?? car.name}
            className="object-cover"
            fallback={placeholder}
          />
        ) : placeholder}
        {skin?.number == null ? null : <LiveryPlate number={skin.number} className="absolute top-2 left-2" />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        {car ? (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-medium" title={car.name}>{car.name}</span>
            <span className="truncate text-xs text-muted-foreground">{skin?.name ?? t('race.car.anyLivery')}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {empty ? t('newChampionship.noCars') : t('newChampionship.pickCar')}
          </span>
        )}
        <Button
          type="button"
          variant={car ? 'outline' : 'default'}
          size={car ? 'sm' : 'default'}
          disabled={busy || empty}
          onClick={() => setPicking(true)}
        >
          {car ? t('race.car.change') : t('race.car.pick')}
        </Button>
      </div>

      <CarPicker
        open={picking}
        selectedId={car?.id}
        selectedSkinId={skin?.id}
        baseQuery={empty ? undefined : { ids: [...cars] }}
        onOpenChange={setPicking}
        onPick={(picked, livery) => { onPick(picked, livery); setPicking(false); }}
      />
    </div>
  );
};
