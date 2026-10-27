import { GripVerticalIcon } from 'lucide-react';
import { useRef } from 'react';


import { RowActions } from './RowActions.tsx';
import type { Team } from '../../../../shared/types';
import { BudgetBadge, NationFlag } from '@/components';
import { Button } from '@/components/ui/button.tsx';
import type { RowDrag } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { useFormat } from '@/i18n';
import { cn } from '@/lib/utils.ts';

interface TeamTileProps {
  /**
   * The team the tile stands for.
   */
  team: Team;
  /**
   * Where it sits in the list, counting from zero.
   */
  index: number;
  /**
   * How many teams there are, which is what greys out the last Move later.
   */
  count: number;
  /**
   * What the team fields, already translated: how many seats, and in which
   * classes where there is more than one.
   */
  fields: string;
  /**
   * Whether an event is under way, in which case nothing may change.
   */
  locked: boolean;
  /**
   * Whether the tile may be opened, which it may not while another row is.
   */
  editable: boolean;
  /**
   * The list's drag state.
   */
  drag: RowDrag;
  /**
   * Called to open the team's form.
   */
  onEdit: () => void;
  /**
   * Called to move the team along the list.
   * @param by How far, positive being later
   */
  onMove: (by: number) => void;
  /**
   * Called to drop the team from the championship.
   */
  onRemove: () => void;
}

/**
 * One team, read-only: its name, its budget, where it is from and what it
 * fields. Clicking it opens the team's dialog.
 */
export const TeamTile = ({
  team, index, count, fields, locked, editable, drag, onEdit, onMove, onRemove,
}: TeamTileProps) => {
  const { t } = useKindTranslation();
  const { formatNation } = useFormat();
  const nation = team.nationCode === undefined ? undefined : formatNation(team.nationCode);
  // The drag ghost would otherwise be a snapshot of the grip alone.
  const tile = useRef<HTMLDivElement>(null);
  const edge = drag.edgeOf(index);
  const openable = editable && !locked;

  return (
    <div
      ref={tile}
      className={cn(
        'relative flex flex-col gap-1 rounded-lg border bg-card py-2 pr-1 pl-1',
        openable && 'hover:bg-accent/50 focus-within:bg-accent/50',
        drag.dragging === index && 'opacity-50',
      )}
      onDragOver={(event) => drag.onRowDragOver(index, event)}
      onDrop={(event) => drag.onRowDrop(index, event)}
    >
      {/* A bar at the side the tile would land on, since tiles run across. */}
      {edge === null ? null : (
        <span
          className={cn(
            'pointer-events-none absolute inset-y-0 w-0.5 bg-primary',
            edge === 'before' ? '-left-1' : '-right-1',
          )}
        />
      )}

      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="relative z-10 size-7 text-muted-foreground"
          aria-label={t('editor.rows.drag', { label: team.name })}
          draggable={drag.enabled}
          disabled={locked || !drag.enabled}
          onDragStart={(event) => {
            if (tile.current !== null) event.dataTransfer.setDragImage(tile.current, 0, 0);
            drag.onRowDragStart(index, event);
          }}
          onDragEnd={drag.onRowDragEnd}
        >
          <GripVerticalIcon />
        </Button>

        <NationFlag code={team.nationCode} className="mr-1" />

        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left text-sm font-semibold after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none disabled:cursor-not-allowed"
          disabled={!openable}
          onClick={onEdit}
        >
          {team.name}
        </button>

        {/* Neutral beside its flag, which is the colour. */}
        <span className="shrink-0 text-xs font-semibold text-muted-foreground" title={nation}>{team.nationCode ?? ''}</span>

        <div className="relative z-10">
          <RowActions
            label={team.name}
            first={index === 0}
            last={index === count - 1}
            locked={locked}
            editable={editable}
            onEdit={onEdit}
            onMove={onMove}
            onRemove={onRemove}
          />
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 pl-8 text-xs text-muted-foreground">
        {team.budget === undefined ? null : <BudgetBadge budget={team.budget} className="shrink-0" />}
        <span className="truncate">{fields}</span>
      </div>
    </div>
  );
};
