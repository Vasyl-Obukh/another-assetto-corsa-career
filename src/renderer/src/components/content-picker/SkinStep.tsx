import { ChevronLeftIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SkinTile } from './SkinTile.tsx';
import type { Car, Skin } from '../../../../shared/types';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import { SearchField } from '@/components/browser/index.ts';
import { Button } from '@/components/ui/button.tsx';

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

  // Filtered here rather than in main, exactly as the car page does it: the
  // liveries all arrived with the car, so a query channel would be paging a
  // list that is already in hand. A layout step needs none of this; a mod car
  // can ship a couple of hundred liveries.
  const terms = useMemo(() => searchTerms(search), [search]);
  const skins = useMemo(
    () => car.skins.filter(
      (skin) => matchesTerms(terms, [skin.name, skin.id, skin.driver, skin.team, skin.number]),
    ),
    [car, terms],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 px-6 pb-2">
        <Button type="button" size="sm" variant="ghost" onClick={onBack}>
          <ChevronLeftIcon />
          {t('race.pick.allCars')}
        </Button>
        <span className="truncate text-sm text-muted-foreground">{car.name}</span>
        <div className="ml-auto">
          <SearchField
            value={search}
            placeholder={t('cars.detail.searchPlaceholder')}
            onChange={setSearch}
          />
        </div>
      </div>

      {/* Vertical room for a tile's hover halo, which is a 22px bloom and gets
          clipped against the top of the scroller without it. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-2 pb-6">
        {skins.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
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
