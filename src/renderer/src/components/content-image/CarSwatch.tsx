import { ContentImage } from './ContentImage.tsx';
import { carSwatchSources } from './utils.ts';

interface CarSwatchProps {
  /**
   * The car's folder name.
   */
  model: string;
  /**
   * The livery's folder name, when one is known.
   */
  skin?: string;
}

/**
 * A car's livery as the small square a results row or a card's car line opens
 * with, the car's badge standing in for a livery with no swatch.
 */
export const CarSwatch = ({ model, skin }: CarSwatchProps) => (
  <span className="relative size-4.5 shrink-0 overflow-hidden rounded bg-muted">
    <ContentImage sources={carSwatchSources(model, skin)} alt="" className="object-cover" fallback={null} />
  </span>
);
