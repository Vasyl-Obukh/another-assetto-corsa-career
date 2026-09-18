/**
 * How many skeleton cards stand in for the first page while it loads.
 */
export const SKELETON_COUNT = 8;

/**
 * The track every switch in the app wears: green when on, a darker grey when
 * off. The vendored one is the primary blue over the input border's grey, and
 * that grey vanishes against a white card in the light theme.
 *
 * Green because on means "in" everywhere a switch appears - in the library, in
 * the sim, on the Championships page - which is the success family's meaning
 * rather than the primary accent's. Here rather than in the vendored switch, so
 * that file stays as upstream ships it.
 */
export const SWITCH_TRACK = 'data-[state=checked]:bg-success data-[state=unchecked]:bg-muted-foreground/35 dark:data-[state=unchecked]:bg-muted-foreground/35';

/**
 * How tall a facet list may grow before it scrolls inside the popover.
 */
export const FACET_LIST_HEIGHT = 'max-h-72';
