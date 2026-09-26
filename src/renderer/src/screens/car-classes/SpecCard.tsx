import { useTranslation } from 'react-i18next';

import { SpecMenu } from './SpecMenu.tsx';
import type { CatalogueSpec } from '../../../../shared/types';
import { specCars } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';
import { ORIGIN_ACCENT } from '@/lib/accents';

interface SpecCardProps {
  /**
   * The spec the card shows.
   */
  spec: CatalogueSpec;
  /**
   * Whether a command is running, which disables its menu.
   */
  busy: boolean;
  /**
   * Called to open the spec's sheet, its name and cars.
   */
  onOpen: () => void;
  /**
   * Called to move the spec to another class.
   */
  onMove: () => void;
  /**
   * Called to ask whether to delete it.
   */
  onDelete: () => void;
}

export const SpecCard = ({
  spec, busy, onOpen, onMove, onDelete,
}: SpecCardProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const mine = spec.origin === 'user';
  const inShipped = catalogue.classById.get(spec.class)?.origin === 'shipped';

  return (
    <li className="relative flex min-h-20 flex-col gap-2 rounded-lg border bg-muted/50 p-3 hover-outline">
      {/* The whole card opens the sheet; the menu sits above this button
          rather than inside it, since a button may not hold another. */}
      <button
        type="button"
        className="absolute inset-0 rounded-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={t('carClasses.openSpec', { name: spec.name })}
        onClick={onOpen}
      />

      <div className="flex items-start gap-1">
        <span className="min-w-0 flex-1 font-medium break-words">{spec.name}</span>

        {/* The app's own are referenced by the championships it ships, so they
            are not the user's to move or delete. */}
        {mine ? (
          <div className="relative">
            <SpecMenu spec={spec} busy={busy} onRename={onOpen} onMove={onMove} onDelete={onDelete} />
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none mt-auto flex flex-wrap items-center gap-1.5">
        {/* Whose it is, in the hue that already means "yours" - but only in a
            class the app ships, since in one of the user's every spec is. */}
        {mine && inShipped ? <Badge className={ORIGIN_ACCENT.user}>{t('championships.origin.user')}</Badge> : null}

        {/* Neutral on purpose: a count of cars is not one of a closed set. */}
        <Badge variant="outline">{t('carClasses.cars', { count: specCars(spec.id, catalogue).length })}</Badge>
      </div>
    </li>
  );
};
