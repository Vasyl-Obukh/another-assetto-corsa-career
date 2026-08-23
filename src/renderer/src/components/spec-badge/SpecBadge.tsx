import { carSpecName, carSpecsOf } from '../../../../shared/utils/car-classes';
import { Badge } from '@/components/ui/badge.tsx';

interface SpecBadgeProps {
  /**
   * Folder name of the car to name the grids for.
   */
  carId: string;
}

export const SpecBadge = ({ carId }: SpecBadgeProps) => {
  // Usually one, but a car that races in a multi-marque field and its own
  // one-make cup carries both, and both are worth seeing on the card. A mod the
  // catalogue does not name gets nothing: inventing an "unclassified" badge
  // would put a UI decision in front of a missing fact.
  const specs = carSpecsOf(carId);

  return (
    <>
      {specs.map((spec) => (
        <Badge key={spec} variant="secondary">{carSpecName(spec)}</Badge>
      ))}
    </>
  );
};
