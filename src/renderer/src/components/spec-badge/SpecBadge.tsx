import { useTranslation } from 'react-i18next';

import { carSpecName, carSpecsOf, classificationOf } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';
import { ORIGIN_ACCENT } from '@/lib/accents';

interface SpecBadgeProps {
  /**
   * Folder name of the car to name the grids for.
   */
  carId: string;
  /**
   * Whether to say so when the user deliberately left the car unclassified -
   * worth a chip on the car's own page, noise on a card in a grid of them.
   */
  showUnclassified?: boolean;
}

export const SpecBadge = ({ carId, showUnclassified = false }: SpecBadgeProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  // Usually one, but a car that races in a multi-marque field and its own
  // one-make cup carries both, and both are worth seeing on the card.
  const specs = carSpecsOf(carId, catalogue);
  // The spec names themselves are an open set the user can add to, so what the
  // chip is coloured by is whose classification it is: neutral as shipped, the
  // origin hues where the user restated or made it.
  const origin = classificationOf(carId, catalogue);

  if (specs.length === 0) {
    // A mod nobody classified gets nothing, since that is a missing fact. Only
    // an override is empty on purpose - the user said it races on no grid.
    return showUnclassified && origin !== 'shipped' ? (
      <Badge className={ORIGIN_ACCENT.adjusted}>{t('cars.classify.unclassified')}</Badge>
    ) : null;
  }

  return (
    <>
      {specs.map((spec) => (
        <Badge key={spec} variant="secondary" className={ORIGIN_ACCENT[origin]}>
          {carSpecName(spec, catalogue)}
        </Badge>
      ))}
    </>
  );
};
