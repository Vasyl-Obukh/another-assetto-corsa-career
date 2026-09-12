import { TrophyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ROW_SCOPE } from './constants.ts';
import { EditorSection } from './EditorSection.tsx';
import { PointsForm } from './PointsForm.tsx';
import { PointsRow } from './PointsRow.tsx';
import { RowList } from './RowList.tsx';
import { nextPoints, withoutPoints, withPoints } from './utils.ts';
import type { Championship, PointsSystem } from '../../../../shared/types';
import type { RowEditState } from '@/hooks';

interface PointsCardProps {
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
   * Called with the whole championship whenever the points systems change.
   * @param next The championship to apply
   */
  onChange: (next: Championship) => void;
}

export const PointsCard = ({
  series, rows, locked, onChange,
}: PointsCardProps) => {
  const { t } = useTranslation();
  const systems = series.pointsSystems;

  /**
   * Puts the systems back on the championship.
   * @param next The systems, in the order they are offered
   */
  const apply = (next: readonly PointsSystem[]): void => onChange({
    ...series, pointsSystems: next,
  });

  return (
    <EditorSection
      icon={<TrophyIcon />}
      title={t('editor.points.title')}
      hint={t('editor.points.hint')}
      summary={t('editor.points.count', { count: systems.length })}
      className="flex flex-col gap-3"
    >
      <RowList
        items={systems}
        scope={ROW_SCOPE.POINTS}
        rows={rows}
        locked={locked}
        idOf={(points) => points.id}
        addLabel={t('editor.points.add')}
        onReorder={apply}
        renderRow={(points, controls) => (
          <PointsRow
            {...controls}
            points={points}
            isDefault={series.defaultPointsSystem === points.id}
            onDefault={() => onChange({ ...series, defaultPointsSystem: points.id })}
            onRemove={() => onChange(withoutPoints(series, points.id))}
          />
        )}
        renderForm={(points) => (
          <PointsForm
            points={points ?? nextPoints(series)}
            locked={locked}
            onConfirm={(next) => {
              onChange(points
                ? withPoints(series, points.id, next)
                : { ...series, pointsSystems: [...systems, next] });
              rows.close();
            }}
            onCancel={rows.close}
          />
        )}
      />
    </EditorSection>
  );
};
