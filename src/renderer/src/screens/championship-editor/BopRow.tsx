import { useTranslation } from 'react-i18next';

import { ListRow } from './ListRow.tsx';
import type { BopEntry } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';

interface BopRowProps {
  /**
   * The adjustment the row stands for.
   */
  bop: BopEntry;
  /**
   * Where it sits in the table, counting from zero.
   */
  index: number;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the row may be acted on, which it may not while any row in the
   * editor has its form open.
   */
  editable: boolean;
  /**
   * Names a car, for the ones the library could resolve.
   * @param car The car folder ID
   * @returns What to show for it
   */
  nameOf: (car: string) => string;
  /**
   * Called to open the adjustment's form.
   */
  onEdit: () => void;
  /**
   * Called to stop balancing this car.
   */
  onRemove: () => void;
}

/**
 * One car's balance of performance, read-only.
 *
 * Neither numbered nor reorderable: the table is keyed by car and applies
 * wherever that car runs, so the order it is written in means nothing.
 */
export const BopRow = ({
  bop, index, locked, editable, nameOf, onEdit, onRemove,
}: BopRowProps) => {
  const { t } = useTranslation();

  return (
    <ListRow
      index={index}
      name={nameOf(bop.car)}
      label={nameOf(bop.car)}
      locked={locked}
      editable={editable}
      onEdit={onEdit}
      onRemove={onRemove}
    >
      {bop.ballast === undefined ? null : (
        <Badge variant="secondary" className="shrink-0">
          {t('championships.entries.ballast', { value: bop.ballast })}
        </Badge>
      )}

      {bop.restrictor === undefined ? null : (
        <Badge variant="secondary" className="shrink-0">
          {t('championships.entries.restrictor', { value: bop.restrictor })}
        </Badge>
      )}
    </ListRow>
  );
};
