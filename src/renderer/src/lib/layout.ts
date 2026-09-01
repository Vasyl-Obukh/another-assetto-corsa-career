// The two measurements every screen shares. Both were copied per screen
// before, and both had drifted: seven screens held five different content
// widths, and a select sized itself to its own longest option, so theme and
// language ended up different widths beside each other.

/**
 * The content column every screen centres inside itself.
 *
 * Set by the car and track browsers, which are the widest thing the app shows
 * and therefore the ones that decide what "full width" looks like here.
 */
export const SCREEN_WIDTH = 'mx-auto w-full max-w-7xl px-8';

/**
 * The width every settings control is given.
 *
 * Fixed rather than intrinsic so a row of them lines up regardless of what is
 * selected or which language it is in - Ukrainian's "Як у машині" is the
 * longest thing that has to fit. It carries `shrink-0` because every one of
 * these sits opposite a label in a flex row, and a long label would otherwise
 * take the width back.
 */
export const CONTROL_WIDTH = 'w-36 shrink-0';

/**
 * Two columns of label-and-control rows, which is what a settings card holds.
 *
 * Capped well short of the card it sits in, because these rows put the label
 * and its control at opposite ends: given the whole width they drift so far
 * apart that reading across from one to the other stops being easy. One column
 * until there is room for two.
 *
 * The wide column gap does double duty. It separates the two columns so a row
 * reads as one thing rather than four, and because the cap is on the whole
 * grid, widening the gap is what narrows the columns: 56rem less the 8rem gap
 * leaves each column exactly 24rem, which is as far as a label sits from its
 * control.
 *
 * Reach it through `<FieldGrid>` rather than putting these classes on a
 * `CardContent`, which has padding of its own for the cap to land on.
 */
export const FIELD_GRID = 'grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-x-32';
