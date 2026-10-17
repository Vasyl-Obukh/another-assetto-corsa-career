import { useTranslation } from 'react-i18next';

import { SAVE_FILTERS } from './constants.ts';
import type { SaveFilter } from './types.ts';
import { filterSaves } from './utils.ts';
import type { SaveSummary } from '../../../../shared/types';
import { Segments } from '@/components/Segments.tsx';

interface SaveFiltersProps {
  /**
   * The career's saves, or null while they are read, which holds each count's
   * place.
   */
  saves: readonly SaveSummary[] | null;
  /**
   * The filter in force.
   */
  value: SaveFilter;
  /**
   * Picks a filter.
   * @param next The filter picked
   */
  onChange(next: SaveFilter): void;
}

/**
 * Every save, or one kind of them, each with how many there are.
 */
export const SaveFilters = ({ saves, value, onChange }: SaveFiltersProps) => {
  const { t } = useTranslation();

  return (
    <Segments
      label={t('saves.filter')}
      items={SAVE_FILTERS.map((one) => ({
        id: one,
        label: t(`saves.filters.${one}`),
        count: saves === null ? null : filterSaves(saves, one).length,
      }))}
      value={value}
      onChange={onChange}
    />
  );
};
