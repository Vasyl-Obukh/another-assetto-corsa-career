import { SearchIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ALL_SPECS, RECENT_SPECS, SEARCH_CARS, SEARCH_DEBOUNCE_MS, TILE_CARS,
} from './constants.ts';
import { SpecTile } from './SpecTile.tsx';
import { recentSpecs, rememberSpec } from './utils.ts';
import type { SpecId } from '../../../../shared/types';
import { carSpecsOf, classOfSpec, specCars } from '../../../../shared/utils/car-classes';
import { matchesTerms, searchTerms } from '../../../../shared/utils/search';
import { useClasses } from '@/app';
import { SWITCH_TRACK } from '@/components/browser/index.ts';
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { useCars, useDebouncedValue, useSpecCounts } from '@/hooks';
import { invoke } from '@/lib/ipc';
import { cn } from '@/lib/utils.ts';

interface SpecPickerBodyProps {
  /**
   * The spec the field holds now, if any.
   */
  selected?: SpecId;
  /**
   * Called with the spec picked.
   * @param spec The spec
   */
  onPick: (spec: SpecId) => void;
  /**
   * Called once a spec is picked, to close the dialog.
   */
  onClose: () => void;
}

/**
 * The spec picker's contents, mounted afresh on every opening, so each starts
 * on the class of the spec held with nothing searched.
 */
export const SpecPickerBody = ({ selected, onPick, onClose }: SpecPickerBodyProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const counts = useSpecCounts(true);
  const [search, setSearch] = useState('');
  const [installedOnly, setInstalledOnly] = useState(true);
  const installedId = useId();
  const [group, setGroup] = useState<string>(
    () => (selected ? classOfSpec(selected, catalogue) ?? ALL_SPECS : ALL_SPECS),
  );
  const settled = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  // The specs of every car the search names, so "488" finds the Ferrari's -
  // kept with the search they answer, so a stale answer is never read.
  const [found, setFound] = useState<{ search: string; specs: ReadonlySet<SpecId> } | null>(null);

  useEffect(() => {
    if (settled.trim() === '') return undefined;

    let live = true;
    invoke('content:cars', { search: settled, limit: SEARCH_CARS }).then(
      (page) => {
        if (!live) return;
        setFound({ search: settled, specs: new Set(page.items.flatMap((car) => carSpecsOf(car.id, catalogue))) });
      },
      () => { /* a failed lookup leaves the names to match on */ },
    );

    return () => { live = false; };
  }, [settled, catalogue]);

  const carSpecs: ReadonlySet<SpecId> = found && found.search === settled ? found.specs : new Set();
  const installedIn = (spec: SpecId): number => counts?.get(spec) ?? 0;
  const terms = searchTerms(search);
  const searching = terms.length > 0;

  let pool: readonly SpecId[];
  if (searching || group === ALL_SPECS) pool = catalogue.classes.flatMap((one) => one.specs);
  else if (group === RECENT_SPECS) pool = recentSpecs();
  else pool = catalogue.classById.get(group)?.specs ?? [];

  const specs = pool
    .filter((spec) => !searching || carSpecs.has(spec)
      || matchesTerms(terms, [catalogue.specById.get(spec)?.name ?? spec]))
    .filter((spec) => !installedOnly || installedIn(spec) > 0)
    // Whatever cannot field a car sorts after whatever can, each in its own order.
    .sort((left, right) => Number(installedIn(right) > 0) - Number(installedIn(left) > 0));

  // The first few cars of every spec shown, to picture each by what is
  // installed of it.
  const shownCars = useCars(specs.flatMap((spec) => specCars(spec, catalogue)));

  const rail = [
    ...(recentSpecs().length > 0 ? [{ id: RECENT_SPECS, name: t('specPicker.recent'), count: recentSpecs().length }] : []),
    { id: ALL_SPECS, name: t('specPicker.all'), count: null },
    ...catalogue.classes
      .filter((one) => one.specs.length > 0)
      .map((one) => ({ id: one.id, name: one.name, count: one.specs.filter((spec) => installedIn(spec) > 0).length })),
  ];

  return (
    <>
      <DialogHeader className="gap-3 border-b px-5 py-4">
        <DialogTitle>{t('specPicker.title')}</DialogTitle>
        <DialogDescription className="sr-only">{t('specPicker.hint')}</DialogDescription>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-72">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              placeholder={t('specPicker.search')}
              aria-label={t('specPicker.search')}
              className="pl-8"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={installedId}
              checked={installedOnly}
              className={SWITCH_TRACK}
              onCheckedChange={setInstalledOnly}
            />
            <label htmlFor={installedId} className="text-sm text-muted-foreground">
              {t('specPicker.installedOnly')}
            </label>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{t('specPicker.count', { count: specs.length })}</span>
        </div>
      </DialogHeader>

      <div className="grid min-h-0 flex-1 grid-cols-[13rem_minmax(0,1fr)]">
        <nav className="flex flex-col gap-0.5 overflow-y-auto border-r bg-muted/30 p-2" aria-label={t('specPicker.classes')}>
          {rail.map((one) => (
            <button
              key={one.id}
              type="button"
              aria-current={!searching && group === one.id}
              onClick={() => { setGroup(one.id); setSearch(''); }}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm',
                !searching && group === one.id ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-accent',
              )}
            >
              <span className="truncate">{one.name}</span>
              {one.count === null ? null : <span className="text-xs text-muted-foreground tabular-nums">{one.count}</span>}
            </button>
          ))}
        </nav>

        <div className="overflow-y-auto p-4">
          {specs.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('specPicker.none')}</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2.5">
              {specs.map((spec) => {
                const cars = specCars(spec, catalogue);
                const pictured = cars.flatMap((id) => {
                  const car = shownCars.get(id);
                  return car ? [car] : [];
                }).slice(0, TILE_CARS);

                return (
                  <SpecTile
                    key={spec}
                    name={catalogue.specById.get(spec)?.name ?? spec}
                    cars={pictured}
                    installed={installedIn(spec)}
                    total={cars.length}
                    selected={spec === selected}
                    onPick={() => {
                      rememberSpec(spec);
                      onPick(spec);
                      onClose();
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
