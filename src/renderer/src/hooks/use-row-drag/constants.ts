/**
 * The data type a dragged row carries.
 *
 * Its presence in `dataTransfer.types` is what tells a row's dragover handler
 * that this is one of our rows rather than a file being dragged in from the
 * desktop - `dataTransfer` is in protected mode during a dragover, so the types
 * are readable and the payload is not.
 *
 * Lower case because the browser lower-cases every type it reports, so a mixed
 * case constant would never match what `types` holds. One format for every list,
 * which is safe while no draggable list nests inside another - seat lists sit
 * inside class entries, and a class entry is not draggable. Give a nested list
 * its own format rather than relying on the bubble order if that ever changes.
 */
export const ROW_DRAG_FORMAT = 'application/x-ac-career-row';
