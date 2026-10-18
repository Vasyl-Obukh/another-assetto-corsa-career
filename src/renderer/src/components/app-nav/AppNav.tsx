import {
  CalendarDaysIcon, CarIcon, ChartLineIcon, FlagIcon, HouseIcon, MapIcon, MedalIcon, SettingsIcon, TrophyIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { NavItem } from './NavItem.tsx';
import type { NavEntry, NavId } from '@/lib/routes';

/**
 * The icon for each destination.
 *
 * The one part of a nav entry that is genuinely visual, so it stays here rather
 * than in the registry, which holds no React. Typed against NavId, so adding a
 * destination without an icon does not compile.
 */
const NAV_ICONS: Record<NavId, ReactNode> = {
  home: <HouseIcon />,
  standalone: <TrophyIcon />,
  race: <FlagIcon />,
  results: <ChartLineIcon />,
  calendar: <CalendarDaysIcon />,
  championships: <MedalIcon />,
  cars: <CarIcon />,
  tracks: <MapIcon />,
  settings: <SettingsIcon />,
};

interface AppNavProps {
  /**
   * The destinations the mode the app is in offers, in order.
   */
  entries: readonly (NavEntry & { id: NavId })[];
}

export const AppNav = ({ entries }: AppNavProps) => {
  const { t } = useTranslation();

  return (
    <nav className="flex items-center gap-1">
      {entries.map((entry) => (
        <NavItem
          key={entry.id}
          id={entry.id}
          to={entry.to}
          also={entry.also}
          label={t(entry.label)}
          icon={NAV_ICONS[entry.id]}
        />
      ))}
    </nav>
  );
};
