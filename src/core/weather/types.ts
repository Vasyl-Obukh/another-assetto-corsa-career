/**
 * One career weather preset, before it is written out as a weather.ini.
 */
export interface WeatherPreset {
  /**
   * Folder name it is installed under.
   */
  id: string;
  /**
   * Display name shown in Content Manager's weather list.
   */
  name: string;
  /**
   * CSP weather type (ac.WeatherType).
   */
  type: number;
  /**
   * Rain intensity from 0 to 1.
   */
  intensity: number;
  /**
   * How wet the track surface becomes, from 0 to 1.
   */
  wetness: number;
  /**
   * How much standing water forms, from 0 to 1.
   */
  water: number;
  /**
   * Multiplier applied to ambient temperature when deriving road temperature.
   */
  coeff: number;
  /**
   * Cloud cover from 0 to 1.
   */
  cover: number;
}
