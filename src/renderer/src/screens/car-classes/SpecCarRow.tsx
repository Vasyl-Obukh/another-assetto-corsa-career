import { CarIcon, ExternalLinkIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { Car } from '../../../../shared/types';
import { carSpecName, carSpecsOf, classOfSpec } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { ContentImage, ProvenanceBadges } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { ORIGIN_ACCENT } from '@/lib/accents';
import { path } from '@/lib/routes';
import { carImageSources } from '@/screens/car-browser';

interface SpecCarRowProps {
  /**
   * Folder name of the car.
   */
  carId: string;
  /**
   * The car, or undefined while it loads and when it is not in the library.
   */
  car: Car | undefined;
  /**
   * The class the spec is in, to say which of the car's other specs it leaves.
   */
  specClass: string;
  /**
   * The spec being edited, or null for one not yet made.
   */
  specId: string | null;
  /**
   * Whether the user put this car in a spec the app ships.
   */
  added: boolean;
  /**
   * Whether a command is running, which freezes the row.
   */
  busy: boolean;
  /**
   * Takes the car off the spec.
   */
  onRemove: () => void;
}

/**
 * One car in a spec's sheet: what it is, what else it races in, and the way to
 * its page or off the spec.
 */
export const SpecCarRow = ({
  carId, car, specClass, specId, added, busy, onRemove,
}: SpecCarRowProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const name = car?.name ?? carId;

  const others = carSpecsOf(carId, catalogue).filter((spec) => spec !== specId);
  // A car holds one spec per class, so joining this one moves it out of that.
  const leaving = others.find((spec) => classOfSpec(spec, catalogue) === specClass);

  return (
    <li>
      <Card className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-3 px-2.5 py-2">
        <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
          <ContentImage
            sources={car ? carImageSources(car) : []}
            alt=""
            className="object-cover"
            fallback={(
              <div className="absolute inset-0 grid place-items-center">
                <CarIcon className="size-5 text-muted-foreground/40" />
              </div>
            )}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-semibold" title={name}>{name}</span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {car ? (
              <>
                <span>{car.brand ?? t('browse.unknown')}</span>
                <ProvenanceBadges provenance={car.provenance} carId={car.id} />
              </>
            ) : <span>{t('carClasses.notInLibrary')}</span>}
            {added ? <Badge className={ORIGIN_ACCENT.user}>{t('carClasses.addedByYou')}</Badge> : null}
            {/* Spec names are an open set, so the car's other grids stay neutral. */}
            {others.filter((spec) => spec !== leaving).map((spec) => (
              <Badge key={spec} variant="secondary">{carSpecName(spec, catalogue)}</Badge>
            ))}
            {leaving === undefined ? null : (
              <span>{t('carClasses.movesFrom', { spec: carSpecName(leaving, catalogue) })}</span>
            )}
          </div>
        </div>

        <div className="flex">
          {car ? (
            <Button asChild size="icon" variant="ghost" className="size-8 text-muted-foreground">
              <Link to={path.car({ id: carId })} aria-label={t('carClasses.openCar', { name })}>
                <ExternalLinkIcon />
              </Link>
            </Button>
          ) : null}
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground"
            disabled={busy}
            aria-label={t('carClasses.removeCar', { name })}
            onClick={onRemove}
          >
            <XIcon />
          </Button>
        </div>
      </Card>
    </li>
  );
};
