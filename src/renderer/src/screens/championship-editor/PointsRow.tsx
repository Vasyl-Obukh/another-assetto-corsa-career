import { useTranslation } from 'react-i18next';

import { ListRow } from './ListRow.tsx';
import type { PointsSystem } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';
import type { RowDrag } from '@/hooks';
import { PODIUM_ACCENT } from '@/lib/accents';

interface PointsRowProps {
  /**
   * The points system the row stands for.
   */
  points: PointsSystem;
  /**
   * Where it sits in the list, counting from zero.
   */
  index: number;
  /**
   * How many systems there are, which is what disables the last Move later and
   * refuses the last Remove.
   */
  count: number;
  /**
   * Whether a race pays this when it names none.
   */
  isDefault: boolean;
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
   * The list's drag state.
   */
  drag: RowDrag;
  /**
   * Called to open the system's form.
   */
  onEdit: () => void;
  /**
   * Called to make this the system a race pays when it names none.
   */
  onDefault: () => void;
  /**
   * Called to move the system along the list.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the system from the championship.
   */
  onRemove: () => void;
}

/**
 * One way of scoring a race, read-only.
 *
 * The top three are shown in their podium metals, as on the read screen's card.
 */
export const PointsRow = ({
  points, index, count, isDefault, locked, editable, drag,
  onEdit, onDefault, onMove, onRemove,
}: PointsRowProps) => {
  const { t } = useTranslation();

  return (
    <ListRow
      index={index}
      number={index + 1}
      name={points.name}
      label={points.name}
      first={index === 0}
      last={index === count - 1}
      locked={locked}
      editable={editable}
      // A championship with no points systems cannot score a race, which
      // validateSeries refuses.
      removable={count > 1}
      drag={drag}
      onEdit={onEdit}
      onMakeDefault={isDefault ? undefined : onDefault}
      onMove={onMove}
      onRemove={onRemove}
    >
      {/* Only worth saying when there is something to default against. */}
      {count > 1 && isDefault ? (
        <Badge className="shrink-0">{t('championships.points.default')}</Badge>
      ) : null}

      {points.positions.slice(0, PODIUM_ACCENT.length).map((value, place) => (
        <Badge
          // By place: two places may pay the same points.
          // eslint-disable-next-line react/no-array-index-key
          key={place}
          variant="outline"
          className={PODIUM_ACCENT[place]}
        >
          {value}
        </Badge>
      ))}

      {points.fastestLap ? (
        <Badge variant="secondary" className="shrink-0">
          {t('championships.points.row', {
            label: t('championships.points.fastestLap'), points: points.fastestLap,
          })}
        </Badge>
      ) : null}

      {/* Neutral like the fastest lap beside it: a run of figures, not one of a
          closed set. */}
      {points.qualifying?.length ? (
        <Badge variant="secondary" className="shrink-0">
          {t('editor.points.qualifyingBonus', { points: points.qualifying.join('-') })}
        </Badge>
      ) : null}

      {/* Neutral: a count, not one of a closed set. The fixed column the row
          ends with. */}
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {t('editor.points.positions', { count: points.positions.length })}
      </span>
    </ListRow>
  );
};
