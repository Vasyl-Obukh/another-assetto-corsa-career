// What the settings screen offers, and in what order. The aid lists themselves
// are shared, since the settings migration reads the same fields.

import type {
  AidMode, SettingsCmFlag, SettingsTab, WeatherGroup,
} from './types.ts';
import { WeatherType } from '../../../../shared/constants';
import { path } from '@/lib/routes';

/**
 * The settings screen's tabs, in the order they are shown.
 */
export const SETTINGS_TABS: readonly SettingsTab[] = [
  { to: path.settings(), label: 'settings.tabs.general', end: true },
  { to: path.settingsContent(), label: 'settings.tabs.content', end: false },
  { to: path.settingsClasses(), label: 'settings.tabs.classes', end: false },
];

/**
 * The aids Assetto Corsa gives three settings rather than two.
 */
export const AID_MODES: readonly AidMode[] = ['abs', 'tractionControl'];

/**
 * Assetto Corsa's three modes: off, whatever the car itself has, forced on.
 */
export const ASSIST_MODES = [0, 1, 2] as const;

/**
 * Highest stability control percentage Assetto Corsa accepts.
 */
export const MAX_STABILITY_CONTROL = 100;

/**
 * The Content Manager flags that are ordinary preferences.
 *
 * Both make a career loop smoother and neither can stop a race happening,
 * which is the line `SettingsCmFlag` draws.
 */
export const SETTINGS_CM_FLAGS: readonly SettingsCmFlag[] = [
  '--skip-all-results',
  '--hide-race-cancel-button',
];

/**
 * The allowed weather list, grouped so thirty-three switches read as six
 * questions rather than one long column.
 */
export const WEATHER_GROUPS: readonly WeatherGroup[] = [
  {
    label: 'settings.weatherGroup.skies',
    types: [
      WeatherType.CLEAR,
      WeatherType.FEW_CLOUDS,
      WeatherType.SCATTERED_CLOUDS,
      WeatherType.BROKEN_CLOUDS,
      WeatherType.OVERCAST_CLOUDS,
    ],
  },
  {
    label: 'settings.weatherGroup.visibility',
    types: [
      WeatherType.HAZE,
      WeatherType.MIST,
      WeatherType.FOG,
      WeatherType.SMOKE,
      WeatherType.DUST,
      WeatherType.SAND,
    ],
  },
  {
    label: 'settings.weatherGroup.rain',
    types: [
      WeatherType.LIGHT_DRIZZLE,
      WeatherType.DRIZZLE,
      WeatherType.HEAVY_DRIZZLE,
      WeatherType.LIGHT_RAIN,
      WeatherType.RAIN,
      WeatherType.HEAVY_RAIN,
    ],
  },
  {
    label: 'settings.weatherGroup.storms',
    types: [
      WeatherType.LIGHT_THUNDERSTORM,
      WeatherType.THUNDERSTORM,
      WeatherType.HEAVY_THUNDERSTORM,
      WeatherType.SQUALLS,
      WeatherType.HAIL,
      WeatherType.TORNADO,
      WeatherType.HURRICANE,
    ],
  },
  {
    label: 'settings.weatherGroup.winter',
    types: [
      WeatherType.LIGHT_SNOW,
      WeatherType.SNOW,
      WeatherType.HEAVY_SNOW,
      WeatherType.LIGHT_SLEET,
      WeatherType.SLEET,
      WeatherType.HEAVY_SLEET,
    ],
  },
  {
    label: 'settings.weatherGroup.effects',
    types: [WeatherType.COLD, WeatherType.HOT, WeatherType.WINDY],
  },
];
