import { useTranslation } from 'react-i18next';

import { NumberField } from './NumberField.tsx';
import { MAX_GRID_OFFSET } from '../../../../shared/constants';
import type { SeriesGrid } from '../../../../shared/types';

interface GridFieldsProps {
  /**
   * The AI offsets as they are stated.
   */
  grid: SeriesGrid;
  /**
   * Prefix for the control ids, so a class entry's own spread does not collide
   * with the championship's.
   */
  idPrefix: string;
  /**
   * An already-translated line under the fields, saying what they are laid
   * over.
   */
  hint?: string;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with both offsets whenever either changes.
   * @param grid The offsets to apply
   */
  onChange: (grid: SeriesGrid) => void;
}

/**
 * The two offsets an AI field is described by, wherever it is described.
 *
 * Apart from GridCard because a class entry and a round state the same two
 * inside their own forms, where a card would be one frame too many.
 */
export const GridFields = ({
  grid, idPrefix, hint, locked, onChange,
}: GridFieldsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      <NumberField
        id={`${idPrefix}-ai-strength`}
        label={t('editor.grid.strength')}
        value={grid.strength}
        min={-MAX_GRID_OFFSET}
        max={MAX_GRID_OFFSET}
        placeholder="0"
        disabled={locked}
        onChange={(strength) => onChange({ ...grid, strength })}
      />

      <NumberField
        id={`${idPrefix}-ai-aggression`}
        label={t('editor.grid.aggression')}
        value={grid.aggression}
        min={-MAX_GRID_OFFSET}
        max={MAX_GRID_OFFSET}
        placeholder="0"
        disabled={locked}
        onChange={(aggression) => onChange({ ...grid, aggression })}
      />

      {hint ? <p className="col-span-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
};
