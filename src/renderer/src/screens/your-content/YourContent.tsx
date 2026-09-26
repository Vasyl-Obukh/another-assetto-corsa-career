import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AddedContent } from '../../../../shared/types';
import { useSettings } from '@/app';
import { ScreenStrip, withId } from '@/components';
import type { BrowserToggle } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { CarBrowserBody } from '@/screens/car-browser';
import { TrackBrowserBody } from '@/screens/track-browser';

// Every uncatalogued entry rather than only the ones still hidden, so a switch
// turned on stays on the page to be turned off again.
const ANONYMOUS = { anonymous: true } as const;

export const YourContent = () => {
  const { t } = useTranslation();
  const { settings, patch } = useSettings();
  const [kind, setKind] = useState<keyof AddedContent>('cars');

  const { addedContent } = settings;
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
          <CarBrowserBody baseQuery={ANONYMOUS} memoryId="your-content-cars" toggle={toggles.cars} />
        ) : (
          <TrackBrowserBody baseQuery={ANONYMOUS} memoryId="your-content-tracks" toggle={toggles.tracks} />
        )}
      </div>
    </div>
  );
};
