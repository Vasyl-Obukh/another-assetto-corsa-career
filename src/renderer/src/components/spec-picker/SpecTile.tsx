import { CarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Car } from '../../../../shared/types';
import { ContentImage } from '../content-image/index.ts';
import { cn } from '@/lib/utils.ts';
import { carImageSources } from '@/screens/car-browser';

interface SpecTileProps {
  /**
   * The spec's name.
   */
  name: string;
  /**
   * The installed cars it pictures, up to three.
   */
  cars: readonly Car[];
  /**
   * How many of its cars are installed.
   */
  installed: number;
  /**
   * How many cars it holds.
   */
  total: number;
  /**
   * Whether it is the spec the field holds now.
   */
  selected: boolean;
  /**
   * Called to pick it.
   */
  onPick: () => void;
}

/**
 * One spec to pick: three of its installed cars, its name, and how much of it
 * is installed as a count and a bar. One with nothing installed is dimmed -
 * it can be picked, but it cannot field a car.
 */
export const SpecTile = ({
  name, cars, installed, total, selected, onPick,
}: SpecTileProps) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        'hover-outline flex flex-col gap-2 rounded-lg border bg-card p-2.5 text-left',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        selected && 'border-primary ring-1 ring-primary',
        installed === 0 && 'opacity-55',
      )}
    >
      <span className="flex h-8">
        {cars.length === 0 ? (
          <span className="grid w-14 place-items-center rounded bg-muted">
            <CarIcon className="size-4 text-muted-foreground/50" />
          </span>
        ) : cars.map((car) => (
          <span key={car.id} className="relative -ml-2.5 w-14 overflow-hidden rounded border-2 border-card bg-muted first:ml-0">
            <ContentImage sources={carImageSources(car)} alt="" className="object-cover" fallback={null} />
          </span>
        ))}
      </span>
      <span className="truncate text-sm font-semibold" title={name}>{name}</span>
      <span className="h-1 overflow-hidden rounded-full bg-muted">
        <span className="block h-full bg-success" style={{ width: `${total === 0 ? 0 : (installed / total) * 100}%` }} />
      </span>
      <span className="text-xs text-muted-foreground">{t('specPicker.installed', { installed, count: total })}</span>
    </button>
  );
};
