/**
 * What an accontent:// URL points at, before it is turned into a path.
 *
 * The filename is deliberately absent: it is derived from the kind, so a URL can
 * only ever select one of four fixed image names.
 */
export type ContentUrlTarget =
  | {
    /**
     * A livery's photo.
     */
    kind: 'carSkin';
    /**
     * Car folder name.
     */
    carId: string;
    /**
     * Skin folder name.
     */
    skinId: string;
  }
  | {
    /**
     * A car's manufacturer badge.
     */
    kind: 'carBadge';
    /**
     * Car folder name.
     */
    carId: string;
  }
  | {
    /**
     * A track layout's photo.
     */
    kind: 'trackPreview';
    /**
     * Track folder name.
     */
    trackId: string;
    /**
     * Layout folder name, or an empty string for a single-layout track.
     */
    layout: string;
  }
  | {
    /**
     * A track layout's map outline.
     */
    kind: 'trackOutline';
    /**
     * Track folder name.
     */
    trackId: string;
    /**
     * Layout folder name, or an empty string for a single-layout track.
     */
    layout: string;
  };
