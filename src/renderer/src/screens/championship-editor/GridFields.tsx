import { useTranslation } from 'react-i18next';

import { NumberField } from './NumberField.tsx';
import type { SeriesGrid } from '../../../../shared/types';
import { MAX_AI, MIN_AI } from '@/screens/race';

interface GridFieldsProps {
  /**
   * The AI spread as it is stated.
   */
  grid: SeriesGrid;
  /**
   * Prefix for the control ids, so a class entry's own spread does not collide
   * with the championship's.
   */
  idPrefix: string;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole spread whenever any part of it changes.
   * @param grid The spread to apply
   */
  onChange: (grid: SeriesGrid) => void;
}

/**
 * The three numbers an AI field is described by, wherever it is described.
 *
 * Apart from GridCard because a class entry states the same three inside its
 * own panel, where a card would be one frame too many.
 */
export const GridFields = ({
  grid, idPrefix, locked, onChange,
}: GridFieldsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <NumberField
        id={`${idPrefix}-ai-level`}
        label={t('editor.grid.aiLevel')}
        value={grid.aiLevel}
        min={MIN_AI}
        max={MAX_AI}
        disabled={locked}
        onChange={(aiLevel) => onChange({ ...grid, aiLevel })}
      />

      <NumberField
        id={`${idPrefix}-ai-level-min`}
        label={t('editor.grid.aiLevelMin')}
        value={grid.aiLevelMin}
        min={MIN_AI}
        max={MAX_AI}
        disabled={locked}
        onChange={(aiLevelMin) => onChange({ ...grid, aiLevelMin })}
      />

      <NumberField
        id={`${idPrefix}-ai-aggression`}
        label={t('editor.grid.aiAggression')}
        value={grid.aiAggression}
        min={MIN_AI}
        max={MAX_AI}
        disabled={locked}
        onChange={(aiAggression) => onChange({ ...grid, aiAggression })}
      />
    </div>
  );
};
