import { CarIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Car } from '../../../../shared/types';
import { CarPicker, ContentImage, ProvenanceBadges } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card.tsx';
import { carImageSources } from '@/screens/car-browser';

interface CarFieldProps {
  /**
   * The player's car, or null when the race names none or names one that is
   * not installed.
   */
  car: Car | null;
  /**
   * Whether the weekend has started, in which case the car cannot change.
   */
  locked: boolean;
  /**
   * Called with the car the user picked.
   * @param car The chosen car
   */
  onPick: (car: Car) => void;
}

export const CarField = ({ car, locked, onPick }: CarFieldProps) => {
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('race.car.label')}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-start gap-4">
          <div className="relative aspect-[16/9] w-40 shrink-0 overflow-hidden rounded-md bg-muted">
            {car ? (
              <ContentImage
                sources={carImageSources(car)}
                alt={car.name}
                className="object-cover"
                fallback={(
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CarIcon className="size-8 text-muted-foreground/40" />
                  </div>
                )}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <CarIcon className="size-8 text-muted-foreground/40" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {car ? (
              <>
                <span className="truncate font-medium" title={car.name}>{car.name}</span>
                <div className="flex flex-wrap gap-1">
                  <ProvenanceBadges provenance={car.provenance} />
                </div>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">{t('race.car.none')}</span>
            )}

            <div>
              <Button
                type="button"
                size="sm"
                variant={car ? 'outline' : 'default'}
                disabled={locked}
                onClick={() => setPicking(true)}
              >
                {car ? t('race.car.change') : t('race.car.pick')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CarPicker
        open={picking}
        selectedId={car?.id}
        onOpenChange={setPicking}
        onPick={onPick}
      />
    </Card>
  );
};
