import { useState } from 'react';

import { ROW_DRAG_FORMAT } from './constants.ts';
import type { RowDrag, RowDragOptions } from './types.ts';
import { dropEdge } from './utils.ts';

export type { RowDrag, RowEdge } from './types.ts';

/**
 * Lets one list's rows be dragged into order.
 *
 * Native HTML5 drag and drop, because the project ships no drag library and is
 * not going to gain one. The grip a row renders is the drag source and the rows
 * are the drop targets; the index being dragged is held here rather than read
 * back out of `dataTransfer`, which a dragover is not allowed to read.
 *
 * One instance per list. A row dragged at another list finds that list's own
 * `dragging` null, so its drop does nothing - cross-list drops are inert by
 * construction rather than by a guard.
 * @param options How long the list is, whether dragging is off, and what to do
 * with a drop
 * @returns The list's drag state and the handlers its rows wire up
 */
export const useRowDrag = ({ count, locked, onMove }: RowDragOptions): RowDrag => {
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  /**
   * Forgets the drag, however it ended.
   */
  const clear = (): void => {
    setDragging(null);
    setOver(null);
  };

  return {
    dragging,
    enabled: !locked && count > 1,

    edgeOf: (index) => dropEdge(dragging, over, index),

    onRowDragStart: (index, event) => {
      event.dataTransfer.effectAllowed = 'move';
      // Not how the drop finds the source - that is state - but some browsers
      // refuse to start a drag carrying no data at all, and the type is what a
      // dragover matches on.
      event.dataTransfer.setData(ROW_DRAG_FORMAT, String(index));
      setDragging(index);
    },

    onRowDragOver: (index, event) => {
      if (dragging === null || !event.dataTransfer.types.includes(ROW_DRAG_FORMAT)) return;

      // Without this the drop never fires at all.
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      // Guarded because dragover fires as fast as the pointer moves.
      if (over !== index) setOver(index);
    },

    onRowDrop: (index, event) => {
      event.preventDefault();
      // A drop on itself would mark the draft dirty and spend a validate on a
      // list nobody changed.
      if (dragging !== null && dragging !== index) onMove(dragging, index);
      clear();
    },

    onRowDragEnd: clear,
  };
};
