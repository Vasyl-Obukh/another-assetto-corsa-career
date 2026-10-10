import { CarIcon, LockIcon, TriangleAlertIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Car, QuickRace, Skin } from '../../../../shared/types';
import { carsOf } from '../../../../shared/utils/eligibility';
import {
  carFits, followingClassOf, playerClassOf, withCar,
} from '../../../../shared/utils/quick-race';
import { useClasses } from '@/app';
import {
  CarPicker, carPictureSources, ContentImage, LiveryPlate,
} from '@/components';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { classAccent } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';
import { carImageSources } from '@/screens/car-browser';
import { ChoiceChips } from '@/screens/championship-editor';

interface CarCardProps {
  /**
   * The race event.
   */
  race: QuickRace;
  /**
   * The player's car, or null while it names none or names one that is not
   * installed.
   */
  car: Car | null;
  /**
   * Whether the event has started, in which case nothing here can change.
   */
  locked: boolean;
  /**
   * Called with the race whenever the car or the class changes.
   * @param next The race
   */
  onChange: (next: QuickRace) => void;
}

/**
 * The player's car, and which class it races in.
 *
 * With no classes yet, or one class of a single car, any installed car can be
 * picked and becomes the field. Otherwise the picker offers the player's
 * class's cars alone, and once there are two the card asks which class that
 * is. A car that no longer fits its class - the class was changed under it, or
 * the player moved to another - is kept and said so in amber, never swapped
 * for them.
 */
export const CarCard = ({
  race, car, locked, onChange,
}: CarCardProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const [picking, setPicking] = useState(false);

  const entry = playerClassOf(race);
  const following = followingClassOf(race);
  const allowed = entry && !following ? carsOf(entry.eligibility, catalogue) : null;
  const empty = allowed !== null && allowed.length === 0;
  const fits = carFits(race, catalogue);
  const skin = car?.skins.find((one) => one.id === race.car?.skin) ?? null;

  /**
   * Puts the player in a car, the class following it where it should.
   * @param picked The car
   * @param livery The livery, or null when the car has none to choose
   */
  const pick = (picked: Car, livery: Skin | null): void => {
    onChange(withCar(race, { model: picked.id, ...(livery ? { skin: livery.id } : {}) }, picked.name));
  };

  /**
   * What picking a car will do, said while none is picked.
   * @returns The hint
   */
  const pickHint = (): string => {
    if (following) return t('race.car.replacesClass', { class: following.name });

    return entry ? t('race.car.fromClass', { class: entry.name }) : t('race.car.anyCar');
  };
  const placeholder = (
    <div className="absolute inset-0 flex items-center justify-center">
      <CarIcon className="size-8 text-muted-foreground/40" />
    </div>
  );

  return (
    <Card className={cn('gap-2.5 p-3', !fits && 'border-warning ring-1 ring-warning')}>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t('race.car.label')}</span>
        {car && !locked ? (
          <Button type="button" size="sm" variant="outline" disabled={empty} onClick={() => setPicking(true)}>
            {t('race.car.change')}
          </Button>
        ) : null}
      </div>

      {race.classes.length > 1 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{t('race.car.racesIn')}</span>
          <ChoiceChips<string>
            label={t('race.car.racesIn')}
            options={race.classes.map((one) => one.id)}
            value={race.playerClass ?? ''}
            labelOf={(id) => race.classes.find((one) => one.id === id)?.name ?? id}
            accentOf={(id) => classAccent(race.classes.findIndex((one) => one.id === id)).chip}
            disabled={locked}
            onChange={(id) => onChange({ ...race, playerClass: id })}
          />
        </div>
      ) : null}

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
        {car ? (
          <ContentImage
            sources={skin ? carPictureSources(car.id, skin.id) : carImageSources(car)}
            alt={skin?.name ?? car.name}
            className="object-cover"
            fallback={placeholder}
          />
        ) : placeholder}
        {skin?.number == null ? null : <LiveryPlate number={skin.number} className="absolute top-2 left-2" />}
      </div>

      {car ? (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium" title={car.name}>{car.name}</span>
          <span className="truncate text-xs text-muted-foreground">{skin?.name ?? t('race.car.anyLivery')}</span>
        </div>
      ) : null}

      {!fits && car && entry ? (
        <div className="flex flex-col gap-2 rounded-md bg-warning/15 p-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <TriangleAlertIcon className="size-4 shrink-0 text-warning-foreground dark:text-warning" />
            {t('race.car.notInClass', { car: car.name, class: entry.name })}
          </span>
          <Button type="button" size="sm" className="self-start" disabled={locked || empty} onClick={() => setPicking(true)}>
            {t('race.car.change')}
          </Button>
        </div>
      ) : null}

      {!car && empty && entry ? (
        <span className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <LockIcon className="size-3.5 shrink-0" />
          {t('race.car.classFirst', { class: entry.name })}
        </span>
      ) : null}

      {car ? null : (
        <>
          {empty ? null : (
            <span className="text-xs text-muted-foreground">
              {pickHint()}
            </span>
          )}
          <Button type="button" disabled={locked || empty} onClick={() => setPicking(true)}>{t('race.car.pick')}</Button>
        </>
      )}

      <CarPicker
        open={picking}
        selectedId={car?.id}
        selectedSkinId={skin?.id}
        baseQuery={allowed ? { ids: [...allowed] } : undefined}
        onOpenChange={setPicking}
        onPick={pick}
      />
    </Card>
  );
};
