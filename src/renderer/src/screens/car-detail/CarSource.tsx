import { useTranslation } from 'react-i18next';

import type { Car } from '../../../../shared/types';
import { DetailPanel, ProvenanceBadges } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { ProvenanceLinks } from '@/screens/content-sources';

interface CarSourceProps {
  /**
   * The car.
   */
  car: Car;
}

/**
 * Where a car comes from - the base game, a pack or a mod team - with the page
 * it is got from, the folder it is installed in and the author's tags.
 */
export const CarSource = ({ car }: CarSourceProps) => {
  const { t } = useTranslation();

  return (
    <DetailPanel title={t('cars.detail.source')} className="flex flex-col gap-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <ProvenanceBadges provenance={car.provenance} carId={car.id} />
        <span>{t(`cars.detail.from.${car.provenance.source}`)}</span>
      </div>

      <ProvenanceLinks provenance={car.provenance} />

      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span>{t('cars.detail.folder')}</span>
        <code className="truncate font-mono" title={car.id}>{car.id}</code>
      </div>

      {car.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {/* The author's own words, an open set, so neutral. */}
          {car.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">{tag}</Badge>
          ))}
        </div>
      ) : null}
    </DetailPanel>
  );
};
