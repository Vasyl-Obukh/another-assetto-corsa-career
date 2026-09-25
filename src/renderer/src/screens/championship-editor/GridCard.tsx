import { GaugeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EditorSection } from './EditorSection.tsx';
import { GridFields } from './GridFields.tsx';
import type { SeriesGrid } from '../../../../shared/types';

interface GridCardProps {
  /**
   * The AI offsets as the championship states them.
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
   * Called with both offsets whenever either changes.
   * @param grid The offsets to apply
   */
  onChange: (grid: SeriesGrid) => void;
}

export const GridCard = ({
  grid, idPrefix, locked, onChange,
}: GridCardProps) => {
  const { t } = useTranslation();

  return (
    <EditorSection
      icon={<GaugeIcon />}
      title={t('editor.grid.title')}
      hint={t('editor.grid.hint')}
    >
      <GridFields grid={grid} idPrefix={idPrefix} locked={locked} onChange={onChange} />
    </EditorSection>
  );
};
