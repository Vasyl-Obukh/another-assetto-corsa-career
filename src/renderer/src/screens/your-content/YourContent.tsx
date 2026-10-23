import { TagIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EditPriceDialog } from './EditPriceDialog.tsx';
import type { AddedContent, Car } from '../../../../shared/types';
import { carPrice, priceOrigin } from '../../../../shared/utils/car-prices';
import { useClasses, useSettings, useToast } from '@/app';
import { ScreenStrip, withId } from '@/components';
import type { BrowserToggle, CarAppraise } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { useFormat } from '@/i18n';
import { PRICE_ORIGIN_ACCENT } from '@/lib/accents';
import { invoke } from '@/lib/ipc';
import { CarBrowserBody } from '@/screens/car-browser';
import { TrackBrowserBody } from '@/screens/track-browser';

// Every uncatalogued entry rather than only the ones still hidden, so a switch
// turned on stays on the page to be turned off again.
const ANONYMOUS = { anonymous: true } as const;

export const YourContent = () => {
  const { t } = useTranslation();
  const { formatMoney } = useFormat();
  const { settings, patch } = useSettings();
  const { catalogue } = useClasses();
  const { show } = useToast();
  const [kind, setKind] = useState<keyof AddedContent>('cars');
  // The car whose price is being edited, or null while none is.
  const [pricing, setPricing] = useState<Car | null>(null);

  const { addedContent, carPrices } = settings;
  const toggles = useMemo((): Record<keyof AddedContent, BrowserToggle> => {
    const toggleFor = (key: keyof AddedContent): BrowserToggle => ({
      section: 'settings',
      isOn: (id) => addedContent[key].includes(id),
      onToggle: (id, on) => patch({
        addedContent: { ...addedContent, [key]: withId(addedContent[key], id, on) },
      }),
    });

    return { cars: toggleFor('cars'), tracks: toggleFor('tracks') };
  }, [addedContent, patch]);

  // A car goes in at its suggested price without stopping to ask, and says so
  // with a way to set its own.
  const cars = useMemo((): BrowserToggle => ({
    ...toggles.cars,
    onToggle: (id, on) => {
      toggles.cars.onToggle(id, on);
      if (!on) return;
      invoke('content:appraisal', { id }).then((appraisal) => {
        if (!appraisal) return;
        show({
          icon: TagIcon,
          tone: PRICE_ORIGIN_ACCENT.suggested,
          title: t('prices.toast.added', { car: appraisal.car.name }),
          detail: t('prices.toast.price', { price: formatMoney(appraisal.price) }),
          action: { label: t('prices.toast.set'), run: () => setPricing(appraisal.car) },
        });
      }, () => { /* the switch already says it is in */ });
    },
  }), [toggles, show, t, formatMoney]);

  const appraise = useMemo((): CarAppraise => ({
    priceOf: (car) => carPrice(car, catalogue, carPrices),
    originOf: (car) => priceOrigin(car.id, carPrices),
    onEdit: setPricing,
  }), [catalogue, carPrices]);

  return (
    <div className="flex h-full flex-col">
      {/* Above the browser's scroller, whose own toolbar is sticky at its top. */}
      <ScreenStrip className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <p className="max-w-2xl text-sm text-muted-foreground">{t('yourContent.subtitle')}</p>

        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(['cars', 'tracks'] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={kind === option ? 'default' : 'ghost'}
              aria-pressed={kind === option}
              onClick={() => setKind(option)}
            >
              {t(`yourContent.kind.${option}`)}
            </Button>
          ))}
        </div>
      </ScreenStrip>

      <div className="min-h-0 flex-1">
        {kind === 'cars' ? (
          <CarBrowserBody baseQuery={ANONYMOUS} memoryId="your-content-cars" toggle={cars} appraise={appraise} />
        ) : (
          <TrackBrowserBody baseQuery={ANONYMOUS} memoryId="your-content-tracks" toggle={toggles.tracks} />
        )}
      </div>

      <EditPriceDialog car={pricing} onClose={() => setPricing(null)} />
    </div>
  );
};
