import type { DragEvent } from 'react';

/**
 * Which edge of a row a drop indicator sits on.
 */
export type RowEdge = 'before' | 'after';

/**
 * What a list needs to know to let its rows be dragged into order.
 */
export interface RowDragOptions {
  /**
   * How many rows there are. A list of one has nothing to reorder.
   */
  count: number;
  /**
   * Whether dragging is off - a weekend under way, or a row already open for
   * editing, since renumbering a list under a visible form is bewildering.
   */
  locked: boolean;
  /**
   * Called with the move a drop asks for.
   * @param from Which row was dragged
   * @param to Which row it was dropped on
   */
  onMove(from: number, to: number): void;
}

/**
 * The drag state of one list, and the handlers its rows wire up.
 *
 * Named handlers rather than a bag to spread: a row wires them once, and a
 * spread would hide which of them a row actually carries.
 */
export interface RowDrag {
  /**
   * Which row is being dragged, so it can be shown as lifted. Null otherwise.
   */
  dragging: number | null;
  /**
   * Whether to offer a grip at all.
   */
  enabled: boolean;
  /**
   * Which edge of one row should show the drop indicator.
   * @param index The row to ask about
   * @returns The edge, or null when this row is not the one hovered
   */
  edgeOf(index: number): RowEdge | null;
  /**
   * Starts a drag from one row's grip.
   * @param index The row being dragged
   * @param event The drag event
   */
  onRowDragStart(index: number, event: DragEvent<HTMLElement>): void;
  /**
   * Offers one row as a drop target.
   * @param index The row under the pointer
   * @param event The drag event
   */
  onRowDragOver(index: number, event: DragEvent<HTMLElement>): void;
  /**
   * Takes the drop on one row.
   * @param index The row dropped on
   * @param event The drag event
   */
  onRowDrop(index: number, event: DragEvent<HTMLElement>): void;
  /**
   * Ends the drag, however it ended.
   */
  onRowDragEnd(): void;
}
