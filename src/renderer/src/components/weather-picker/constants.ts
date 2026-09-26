import {
  CloudFogIcon, CloudLightningIcon, CloudRainIcon, SnowflakeIcon, SunIcon, ThermometerSunIcon,
} from 'lucide-react';

import type { WeatherKind } from './types.ts';
import { WeatherType } from '../../../../shared/constants';

/**
 * Every CSP weather type as six kinds, each lightest to heaviest, so
 * thirty-three types read as six questions rather than one long list - in the
 * settings' allowed weather and in every weather picker alike. A type wears
 * its kind's colour - see the weather notes in globals.css for why those six.
 */
export const WEATHER_KINDS: readonly WeatherKind[] = [
  {
    label: 'settings.weatherGroup.skies',
    icon: SunIcon,
    accent: 'bg-weather-dry text-weather-dry-foreground',
    tint: 'text-weather-dry-foreground',
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
    icon: CloudFogIcon,
    accent: 'bg-weather-cloudy text-weather-cloudy-foreground',
    tint: 'text-weather-cloudy-foreground',
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
    icon: CloudRainIcon,
    accent: 'bg-weather-wet text-weather-wet-foreground',
    tint: 'text-weather-wet-foreground',
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
    icon: CloudLightningIcon,
    accent: 'bg-weather-storm text-weather-storm-foreground',
    tint: 'text-weather-storm-foreground',
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
    icon: SnowflakeIcon,
    accent: 'bg-weather-snow text-weather-snow-foreground',
    tint: 'text-weather-snow-foreground',
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
    icon: ThermometerSunIcon,
    accent: 'bg-climate-mediterranean text-climate-mediterranean-foreground',
    tint: 'text-climate-mediterranean-foreground',
    types: [WeatherType.COLD, WeatherType.HOT, WeatherType.WINDY],
  },
];
