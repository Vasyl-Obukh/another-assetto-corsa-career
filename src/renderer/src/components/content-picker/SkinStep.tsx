import { ChevronLeftIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SkinTile } from './SkinTile.tsx';
import type { Car, Skin } from '../../../../shared/types';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import { SearchField, TOOLBAR_SEARCH } from '@/components/browser/index.ts';
import { ContentImage } from '@/components/content-image/index.ts';
import { ProvenanceBadges } from '@/components/provenance-badges/index.ts';
import { SpecBadge } from '@/components/spec-badge/index.ts';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { carImageSources } from '@/screens/car-browser';

interface SkinStepProps {
  /**
   * The car whose liveries are being chosen between.
   */
  car: Car;
  /**
   * Folder name of the livery already chosen, when there is one.
   */
  selectedId?: string;
  /**
   * Called to go back to the list of cars.
   */
  onBack: () => void;
  /**
   * Called with the livery that was picked.
   * @param skin The chosen livery
   */
  onPick: (skin: Skin) => void;
}

export const SkinStep = ({
  car, selectedId, onBack, onPick,
}: SkinStepProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  // Filtered here rather than in main: the liveries all arrived with the car,
  // and a mod car can ship a couple of hundred of them.
  const terms = useMemo(() => searchTerms(search), [search]);
  const skins = useMemo(
    () => car.skins.filter(
      (skin) => matchesTerms(terms, [skin.name, skin.id, skin.driver, skin.team, skin.number]),
    ),
    [car, terms],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 px-6 pb-3">
        <Button type="button" size="sm" variant="ghost" onClick={onBack}>
          <ChevronLeftIcon />
          {t('race.pick.allCars')}
        </Button>
        <div className="ml-auto w-full max-w-sm">
          <SearchField
            value={search}
            placeholder={t('cars.detail.searchPlaceholder')}
            onChange={setSearch}
            inputClassName={TOOLBAR_SEARCH}
          />
        </div>
      </div>

      {/* Which car this is, since the browser it was picked from is covered. */}
      <Card className="mx-6 mb-2 shrink-0 flex-row items-center gap-3 px-3 py-2.5">
        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-muted">
          <ContentImage sources={carImageSources(car)} alt="" className="object-cover" fallback={null} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-semibold" title={car.name}>{car.name}</span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{car.brand ?? t('browse.unknown')}</span>
            <ProvenanceBadges provenance={car.provenance} carId={car.id} />
            <SpecBadge carId={car.id} />
          </div>
        </div>
        <span className="ml-auto shrink-0 text-sm text-muted-foreground">
          {t('cars.skins', { count: car.skins.length })}
        </span>
      </Card>

      {/* Vertical room for a tile's hover halo, which is a 22px bloom and gets
          clipped against the top of the scroller without it. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-2 pb-6">
        {skins.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4">
            {skins.map((skin) => (
              <SkinTile
                key={skin.id}
                carId={car.id}
                skin={skin}
                selected={skin.id === selectedId}
                onPick={() => onPick(skin)}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">{t('cars.detail.noMatch')}</p>
        )}
      </div>
    </div>
  );
};
