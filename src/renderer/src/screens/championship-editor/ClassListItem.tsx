
import { GripVerticalIcon } from 'lucide-react';
import { useRef } from 'react';

import type { ClassEntry, EntryAvailability } from '../../../../shared/types';
import { carSpecName } from '../../../../shared/utils/car-classes';
import { useClasses } from '@/app';
import { Button } from '@/components/ui/button.tsx';
import type { RowDrag } from '@/hooks';
import { useKindTranslation } from '@/i18n';
import { cn } from '@/lib/utils.ts';
import { TierMedal } from '@/screens/championships';

interface ClassListItemProps {
  /**
   * Where it sits in the list, counting from zero, which is what the drag
   * moves it by.
   */
  index: number;
  /**
   * The list's drag state.
   */
  drag: RowDrag;
  /**
   * Whether the list has another class to move it past, which is what draws
   * its grip - drawn still while the list is held, so nothing shifts.
   */
  movable: boolean;
  /**
   * The class entry it stands for.
   */
  entry: ClassEntry;
  /**
   * What it can field on this install, or undefined before the draft has been
   * checked.
   */
  availability: EntryAvailability | undefined;
  /**
   * Whether it is the class open beside the list.
   */
  selected: boolean;
  /**
   * Whether another class may not be opened just now, which it may not while
   * a row's form is open.
   */
  disabled: boolean;
  /**
   * Called to open it.
   */
  onSelect: () => void;
}

/**
 * One class in the list down the side of the classes tab: its rung, its name,
 * and how big a grid of what - dragged by its grip into a faster or a slower
 * place, and opened from anywhere else on it.
 */
export const ClassListItem = ({
  index, drag, movable, entry, availability, selected, disabled, onSelect,
}: ClassListItemProps) => {
  const { t } = useKindTranslation();
  const { catalogue } = useClasses();
  const cars = entry.eligibility.kind === 'spec'
    ? carSpecName(entry.eligibility.spec, catalogue)
    : t('editor.entries.carCount', { count: entry.eligibility.cars.length });

  const edge = drag.edgeOf(index);
  // The drag ghost would otherwise be a snapshot of the grip alone.
  const card = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={card}
      className={cn(
        'relative flex min-w-56 shrink-0 items-center rounded-lg border bg-card lg:min-w-0 lg:shrink',
        selected ? 'border-primary ring-1 ring-primary' : 'hover:bg-accent/50',
        drag.dragging === index && 'opacity-50',
      )}
      onDragOver={(event) => drag.onRowDragOver(index, event)}
      onDrop={(event) => drag.onRowDrop(index, event)}
    >
      {/* Outside the card's border, in the gap between two cards. */}
      {edge === null ? null : (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-1 h-0.5 rounded-full bg-primary',
            edge === 'before' ? '-top-1.5' : '-bottom-1.5',
          )}
        />
      )}
      {/* Above the card's own button, which covers the rest of it. */}
      {movable ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="relative z-10 -mr-3 ml-0.5 size-7 shrink-0 cursor-grab text-muted-foreground"
          aria-label={t('editor.rows.drag', { label: entry.name })}
          disabled={!drag.enabled}
          draggable={drag.enabled}
          onDragStart={(event) => {
            if (card.current !== null) {
              event.dataTransfer.setDragImage(card.current, 0, card.current.offsetHeight / 2);
            }
            drag.onRowDragStart(index, event);
          }}
          onDragEnd={drag.onRowDragEnd}
        >
          <GripVerticalIcon />
        </Button>
      ) : null}
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled && !selected}
        className="flex min-w-0 flex-1 items-center gap-3 p-2.5 text-left after:absolute after:inset-0 after:rounded-lg disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onSelect}
      >
        <TierMedal tier={entry.ladder.tier} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-semibold">{entry.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {t('editor.entries.listLine', { count: entry.seats.length, cars })}
          </span>
        </span>
        {/* Only when it cannot be raced here: the panel says how many are installed. */}
        {availability && !availability.enough ? (
          <span role="img" aria-label={t('editor.tabs.problem')} className="size-2 shrink-0 rounded-full bg-destructive" />
        ) : null}
      </button>
    </div>
  );
};
