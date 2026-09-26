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
     * A livery's colour swatch.
     */
    kind: 'carLivery';
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
  }
  | {
    /**
     * One of a track layout's loading-screen photographs.
     */
    kind: 'trackPhoto';
    /**
     * Track folder name.
     */
    trackId: string;
    /**
     * Layout folder name, or an empty string for a single-layout track.
     */
    layout: string;
    /**
     * The photograph's name, matching TRACK_PHOTO_NAME.
     */
    photo: string;
  }
  | {
    /**
     * A track layout's logo.
     */
    kind: 'trackLogo';
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
     * A nation's flag.
     */
    kind: 'nationFlag';
    /**
     * The nation's code, one of NATION_CODES.
     */
    code: string;
  };
