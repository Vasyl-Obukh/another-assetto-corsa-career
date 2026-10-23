import { StoreIcon, WarehouseIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Car } from '../../../../shared/types';
import { RepaintDialog, ScreenBody, SellDialog } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useGarage } from '@/hooks';
import { CAR_SOURCE_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';
import { CarBrowserBody } from '@/screens/car-browser';

/**
 * A career's Garage: the car browser over the cars it owns, each card in the
 * livery it wears with when it was bought, what it races in, and Repaint and
 * Sell with what each costs or pays.
 */
export const Garage = () => {
  const { t } = useTranslation();
  const garage = useGarage();
  const [repainting, setRepainting] = useState<Car | null>(null);
  const [selling, setSelling] = useState<Car | null>(null);
  // Only a career has a Garage, and the routes mount it in nothing else.
  if (!garage) return null;

  const heading = { title: t('garage.title'), subtitle: t('garage.subtitle') };

  if (garage.cars.length === 0) {
    return (
      <ScreenBody className="flex flex-col gap-6 pb-8">
        <header className="flex flex-col gap-1 pt-8">
          <h1 className="text-2xl font-semibold">{heading.title}</h1>
          <p className="text-sm text-muted-foreground">{heading.subtitle}</p>
        </header>
        <Card className="items-center gap-3 px-6 py-12 text-center">
          <span className={cn('flex size-11 items-center justify-center rounded-xl', CAR_SOURCE_ACCENT.owned)}>
            <WarehouseIcon className="size-5" />
          </span>
          <span className="font-semibold">{t('garage.empty')}</span>
          <Button asChild>
            <Link to={path.store()}>
              <StoreIcon />
              {t('garage.toStore')}
            </Link>
          </Button>
        </Card>
      </ScreenBody>
    );
  }

  return (
    <>
      <CarBrowserBody
        memoryId="garage"
        heading={heading}
        baseQuery={{ ids: garage.cars.map((one) => one.model) }}
        trade={{
          mode: 'garage', garage, onRepaint: setRepainting, onSell: setSelling,
        }}
      />
      <RepaintDialog car={repainting} garage={garage} onClose={() => setRepainting(null)} />
      <SellDialog car={selling} garage={garage} onClose={() => setSelling(null)} />
    </>
  );
};
