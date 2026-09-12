import type { Weather, WeatherController } from '../../../../shared/types';

/**
 * Everything the weather menus offer, whatever screen they are opened from.
 */
export interface WeatherContent {
  /**
   * Every installed weather preset.
   */
  weather: Weather[];
  /**
   * Every installed CSP weather controller.
   */
  controllers: WeatherController[];
}
