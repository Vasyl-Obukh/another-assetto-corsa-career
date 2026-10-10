// What the settings screen offers, and in what order. The aid lists themselves
// are shared, since the settings reader coerces the same fields.

import {
  ActivityIcon, BotIcon, CalendarDaysIcon, CarIcon, CloudIcon, GaugeIcon, LayersIcon, MonitorIcon, PackageIcon,
  SettingsIcon, TerminalIcon, TrophyIcon, UserIcon,
} from 'lucide-react';

import type {
  AidMode, SectionLink, SettingsCmFlag, SettingsTab, WeatherCapability,
} from './types.ts';
import { path } from '@/lib/routes';

/**
 * The settings screen's tabs, in the order they are shown.
 */
export const SETTINGS_TABS: readonly SettingsTab[] = [
  {
    to: path.settings(), label: 'settings.tabs.general', icon: SettingsIcon, end: true,
  },
  {
    to: path.diagnostics(), label: 'settings.tabs.diagnostics', icon: ActivityIcon, end: false,
  },
  {
    to: path.settingsSources(), label: 'settings.tabs.sources', icon: PackageIcon, end: false,
  },
  {
    to: path.settingsClasses(), label: 'settings.tabs.classes', icon: LayersIcon, end: false,
  },
  {
    to: path.settingsChampionships(), label: 'settings.tabs.championships', icon: TrophyIcon, end: false,
  },
  {
    to: path.settingsContent(), label: 'settings.tabs.content', icon: CarIcon, end: false,
  },
];

/**
 * The General tab's sections, in page order, for the index beside them.
 */
export const GENERAL_SECTIONS: readonly SectionLink[] = [
  { id: 'appearance', label: 'settings.appearance', icon: MonitorIcon },
  { id: 'driver', label: 'settings.driver', icon: UserIcon },
  { id: 'aids', label: 'settings.drivingAids', icon: GaugeIcon },
  { id: 'opponents', label: 'settings.opponents', icon: BotIcon },
  { id: 'calendar', label: 'settings.calendar', icon: CalendarDaysIcon },
  { id: 'weather', label: 'settings.weather', icon: CloudIcon },
  { id: 'content-manager', label: 'settings.contentManager', icon: TerminalIcon },
];

/**
 * How far below the top of the view a section's heading has to pass for the
 * index to call it the one being read - a little past the top, so a section
 * scrolled to by the index counts as reached.
 */
export const INDEX_OFFSET = 24;

/**
 * The grid both groups of driving aids are laid out in.
 */
export const AID_TILES = 'grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-2.5';

/**
 * What a weather system card says it can and cannot do, in order.
 */
export const WEATHER_CAPABILITIES: readonly WeatherCapability[] = ['rain', 'dynamic', 'exactRain'];

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
