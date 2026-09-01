/**
 * Extra data to send alongside the race configuration.
 */
export interface RaceUriOptions {
  /**
   * Content Manager's serialized assists, from `assistsPresetJson` - the JSON
   * its own .cmpreset files carry, not an assists.ini.
   */
  assistsPreset?: string;
}

/**
 * Extra arguments to pass to Content Manager on the command line.
 */
export interface LaunchOptions {
  /**
   * Arguments placed before the URI, such as diagnostic flags.
   */
  extraArgs?: string[];
}
