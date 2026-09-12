import { BanknoteIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MIN_MONEY } from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { PositionTable } from './PositionTable.tsx';
import { withPrizes } from './utils.ts';
import type { Championship } from '../../../../shared/types';
import type { RowEditState } from '@/hooks';

interface PrizesCardProps {
  /**
   * The championship being edited.
   */
  series: Championship;
  /**
   * Which row of the editor has its form open.
   */
  rows: RowEditState;
  /**
   * Whether a weekend is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Called with the whole championship whenever what it pays changes.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

/**
 * What the championship pays out, as two ranked tables.
 *
 * Edited live rather than behind a Confirm, like the editor's other plain
 * fields, since there is no row here to open. The entry fee is on the details
 * card.
 */
export const PrizesCard = ({
  series, rows, locked, onChange,
}: PrizesCardProps) => {
  const { t } = useTranslation();
  const positions = series.prizes?.positions ?? [];
  const standings = series.prizes?.standings ?? [];
  // A table changes length, so it goes quiet while a row is open anywhere, as
  // a class's car list does.
  const quiet = locked || !rows.editable;

  return (
    <EditorSection
      icon={<BanknoteIcon />}
      title={t('editor.prizes.title')}
      hint={t('editor.prizes.hint')}
      className="flex flex-col gap-6"
    >
      <PositionTable
        idPrefix="prize-round"
        label={t('editor.prizes.round')}
        hint={t('editor.prizes.roundHint')}
        empty={t('editor.prizes.empty')}
        values={positions}
        min={MIN_MONEY}
        disabled={quiet}
        onChange={(next) => onChange(withPrizes(series, { positions: next, standings }))}
      />

      <PositionTable
        idPrefix="prize-season"
        label={t('editor.prizes.season')}
        hint={t('editor.prizes.seasonHint')}
        empty={t('editor.prizes.empty')}
        values={standings}
        min={MIN_MONEY}
        disabled={quiet}
        onChange={(next) => onChange(withPrizes(series, { positions, standings: next }))}
      />
    </EditorSection>
  );
};
