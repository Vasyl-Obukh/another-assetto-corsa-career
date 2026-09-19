import { CarIcon } from 'lucide-react';
import { Link } from 'react-router';

import type { Car } from '../../../../shared/types';
import { ContentImage } from '@/components';
import { path } from '@/lib/routes';
import { carImageSources } from '@/screens/car-browser';

interface EntryCarsProps {
  /**
   * The installed cars a class may field, in the order to show them.
   */
  cars: readonly Car[];
}

export const EntryCars = ({ cars }: EntryCarsProps) => (
  // A picture and a name and nothing else: this answers "what would I be
  // driving", and each card opens the car's own page for anything more.
  <ul className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2">
    {cars.map((car) => (
      <li key={car.id}>
        <Link
          to={path.car({ id: car.id })}
          className="group flex flex-col overflow-hidden rounded-md border bg-card transition-colors hover:bg-accent/60"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <ContentImage
              sources={carImageSources(car)}
              alt={car.name}
              className="object-cover"
              fallback={(
                <div className="absolute inset-0 flex items-center justify-center">
                  <CarIcon className="size-6 text-muted-foreground/40" />
                </div>
              )}
            />
          </div>
          <span className="truncate px-2 py-1.5 text-xs font-medium" title={car.name}>
            {car.name}
          </span>
        </Link>
      </li>
    ))}
  </ul>
);
