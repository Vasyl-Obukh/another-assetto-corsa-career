import { PencilIcon, Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { CatalogueSpec } from '../../../../shared/types';
import { specCars } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ORIGIN_ACCENT } from '@/lib/accents';

interface SpecRowProps {
  /**
   * The spec the row shows.
   */
  spec: CatalogueSpec;
  /**
   * Whether its actions may be used, which they may not while a form is open.
   */
  editable: boolean;
  /**
   * Called to open the spec's form.
   */
  onEdit: () => void;
  /**
   * Called to ask whether to delete it.
   */
  onDelete: () => void;
}

export const SpecRow = ({
  spec, editable, onEdit, onDelete,
}: SpecRowProps) => {
  const { t } = useTranslation();
  const { catalogue } = useClasses();
  const mine = spec.origin === 'user';

  return (
    <li className="flex min-h-9 items-center gap-2 border-b py-1 last:border-b-0">
      <span className="min-w-0 flex-1 truncate">{spec.name}</span>

      {/* Whose it is, in the hue that already means "yours"; the app's own wear
          nothing, as a shipped championship does. */}
      {mine ? <Badge className={ORIGIN_ACCENT.user}>{t('championships.origin.user')}</Badge> : null}

      {/* Neutral on purpose: a count of cars is not one of a closed set. */}
      <Badge variant="outline">{t('carClasses.cars', { count: specCars(spec.id, catalogue).length })}</Badge>

      {/* The app's own are referenced by the championships it ships, so they
          are not the user's to rename or delete. */}
      {mine ? (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label={t('carClasses.edit', { name: spec.name })}
            disabled={!editable}
            onClick={onEdit}
          >
            <PencilIcon />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label={t('carClasses.delete', { name: spec.name })}
            disabled={!editable}
            onClick={onDelete}
          >
            <Trash2Icon />
          </Button>
        </>
      ) : null}
    </li>
  );
};
