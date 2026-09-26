import { ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import {
  carClassName, carSpecName, carSpecsOf, classificationOf, classOfSpec,
} from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { DetailPanel } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { ORIGIN_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';

interface CarClassificationProps {
  /**
   * Folder name of the car.
   */
  carId: string;
}

/**
 * The grids a car races on, read-only: the page is reached from the library,
 * and what a car is classified as is changed from Car classes in settings.
 */
export const CarClassification = ({ carId }: CarClassificationProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();

  const specs = carSpecsOf(carId, catalogue);
  const origin = classificationOf(carId, catalogue);

  return (
    <DetailPanel title={t('cars.detail.classification')} className="flex flex-col gap-2">
      {specs.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('cars.detail.unclassified')}</p>
      ) : specs.map((spec) => {
        const carClass = classOfSpec(spec, catalogue);

        return (
          <div key={spec} className="flex flex-wrap items-center gap-2 text-sm">
            {carClass === null ? null : (
              <>
                <span className="font-semibold">{carClassName(carClass, catalogue)}</span>
                <ChevronRightIcon className="size-3.5 text-muted-foreground" />
              </>
            )}
            {/* Coloured by whose classification it is, as on the cards. */}
            <Badge variant="secondary" className={ORIGIN_ACCENT[origin]}>{carSpecName(spec, catalogue)}</Badge>
          </div>
        );
      })}

      <Link to={path.settingsClasses()} className="text-xs text-muted-foreground hover:text-primary hover:underline">
        {t('cars.detail.classesLink')}
      </Link>
    </DetailPanel>
  );
};
