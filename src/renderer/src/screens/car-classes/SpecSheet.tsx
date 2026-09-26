import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SpecCarRow } from './SpecCarRow.tsx';
import type { SpecSheetTarget } from './types.ts';
import { SHIPPED_CATALOGUE, specCars } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { CarSetPicker, ErrorCard } from '@/components';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from '@/components/ui/sheet.tsx';
import { useCars, useClassCommands } from '@/hooks';
import { ORIGIN_ACCENT } from '@/lib/accents';

interface SpecSheetProps {
  /**
   * The spec being edited, or the class a new one is being made in.
   */
  target: SpecSheetTarget;
  /**
   * Called when the sheet closes, saved or not.
   * @param saved The class the saved spec is in, or null when nothing was saved
   */
  onClose: (saved: string | null) => void;
}

/**
 * A spec's name and every car in it, edited together and saved as one: a new
 * spec opens here too, so it is never created empty and filled in later.
 *
 * Mounted only while open, so it always starts from the spec as it stands.
 */
export const SpecSheet = ({ target, onClose }: SpecSheetProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const commands = useClassCommands();

  const spec = target.kind === 'edit' ? target.spec : null;
  const carClass = catalogue.classById.get(target.kind === 'edit' ? target.spec.class : target.carClass.id);
  const shipped = spec?.origin === 'shipped';
  // What the app itself puts in a shipped spec, so a car the user added reads as theirs.
  const shippedCars = new Set(spec && shipped ? specCars(spec.id, SHIPPED_CATALOGUE) : []);
  const savedCars = spec ? specCars(spec.id, catalogue) : [];

  const [name, setName] = useState(spec?.name ?? '');
  const [cars, setCars] = useState<readonly string[]>(savedCars);
  const [picking, setPicking] = useState(false);
  const installed = useCars(cars);

  const changed = name.trim() !== (spec?.name ?? '')
    || cars.length !== savedCars.length
    || cars.some((car) => !savedCars.includes(car));

  const save = async (): Promise<void> => {
    if (!carClass) return;
    const id = await commands.saveSpecCars({ id: spec?.id, name, class: carClass.id }, [...cars]);
    if (id !== null) onClose(carClass.id);
  };

  return (
    <Sheet open onOpenChange={(next) => { if (!next) onClose(null); }}>
      <SheetContent className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="gap-1 px-5 pt-5 pb-3">
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            {carClass?.name}
            {spec?.origin === 'user' ? <Badge className={ORIGIN_ACCENT.user}>{t('championships.origin.user')}</Badge> : null}
          </span>
          <SheetTitle className="text-lg">
            {spec ? spec.name : t('carClasses.newSpecTitle', { name: carClass?.name ?? '' })}
          </SheetTitle>
          <SheetDescription>{t('carClasses.sheetHint')}</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4">
          {commands.error !== null ? <ErrorCard error={commands.error} onDismiss={commands.dismissError} /> : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="spec-name" className="text-sm font-medium">{t('carClasses.specName')}</label>
            <Input
              id="spec-name"
              value={name}
              disabled={shipped || commands.busy}
              placeholder={t('carClasses.specNamePlaceholder')}
              autoFocus={target.kind === 'new'}
              onChange={(event) => setName(event.target.value)}
            />
            {shipped ? <p className="text-xs text-muted-foreground">{t('carClasses.nameLocked')}</p> : null}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="font-semibold">{t('carClasses.carsHeading')}</span>
            <span className="text-muted-foreground tabular-nums">{cars.length}</span>
            {cars.length > 0 ? (
              <Button size="sm" variant="outline" className="ml-auto" disabled={commands.busy} onClick={() => setPicking(true)}>
                <PlusIcon />
                {t('carClasses.addCars')}
              </Button>
            ) : null}
          </div>

          {cars.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-5 py-7 text-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t('carClasses.noCars')}</span>
              <span>{t('carClasses.noCarsHint')}</span>
              <Button size="sm" variant="outline" className="mt-1" disabled={commands.busy} onClick={() => setPicking(true)}>
                <PlusIcon />
                {t('carClasses.addCars')}
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {cars.map((car) => (
                <SpecCarRow
                  key={car}
                  carId={car}
                  car={installed.get(car)}
                  specClass={carClass?.id ?? ''}
                  specId={spec?.id ?? null}
                  added={shipped && !shippedCars.has(car)}
                  busy={commands.busy}
                  onRemove={() => setCars((current) => current.filter((one) => one !== car))}
                />
              ))}
            </ul>
          )}
        </div>

        <SheetFooter className="flex-row items-center border-t px-5 py-3">
          <Button
            disabled={commands.busy || name.trim() === '' || !changed}
            onClick={() => { void save(); }}
          >
            {spec ? t('carClasses.save') : t('carClasses.createSpec')}
          </Button>
          {spec === null && name.trim() === '' ? (
            <span className="text-xs text-muted-foreground">{t('carClasses.needsName')}</span>
          ) : null}
          <Button variant="ghost" className="ml-auto" disabled={commands.busy} onClick={() => onClose(null)}>
            {t('carClasses.cancel')}
          </Button>
        </SheetFooter>
      </SheetContent>

      {picking ? (
        <CarSetPicker
          title={t('carClasses.pickCarsTitle', { name: name.trim() || carClass?.name || '' })}
          initial={cars}
          onCancel={() => setPicking(false)}
          onDone={(next) => {
            setCars(next);
            setPicking(false);
          }}
        />
      ) : null}
    </Sheet>
  );
};
