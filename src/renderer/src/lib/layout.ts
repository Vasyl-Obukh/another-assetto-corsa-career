// The two measurements every screen shares. Both were copied per screen
// before, and both had drifted: seven screens held five different content
// widths, and a select sized itself to its own longest option, so theme and
// language ended up different widths beside each other.

/**
 * The content column every screen centres inside itself.
 *
 * Set by the browsers, which are the widest thing the app shows: 100rem is what
 * three championship cards need beside a filter rail. A form inside it keeps to
 * its own narrower cap, so only grids and boards spread out.
 */
export const SCREEN_WIDTH = 'mx-auto w-full max-w-[100rem] px-8';

/**
 * The content column for a screen that uses the whole window: the same gutter
 * as SCREEN_WIDTH, and no cap. For content that is a board or a grid of cards,
 * which only gains from the room - never for a form, whose rows drift apart.
 */
export const WIDE_SCREEN_WIDTH = 'w-full px-8';

/**
 * Where the back-to-top button floats: beside the content column rather than
 * in the window's corner, which on a wide window is a long way from anything.
 *
 * Measured off SCREEN_WIDTH's 100rem cap - half the space either side of the
 * column, less the button's own width and a little, puts it about 48px clear
 * of the content. It never comes closer to the window edge than 24px,
 * which is where it lands once the window is narrower than the column.
 */
export const BACK_TO_TOP_POSITION = 'fixed bottom-6 right-[max(1.5rem,calc((100vw_-_100rem)_/_2_-_2.75rem))]';

/**
 * Where the back-to-top button floats on a WIDE_SCREEN_WIDTH screen: that
 * column runs to the window's edge, so there is nothing beside it to float in
 * and the button keeps to the corner, over the gutter.
 */
export const WIDE_BACK_TO_TOP_POSITION = 'fixed bottom-6 right-6';
