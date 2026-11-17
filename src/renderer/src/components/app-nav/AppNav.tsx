import {
  CalendarDaysIcon, ChartLineIcon, FlagIcon, HouseIcon, MailIcon, MedalIcon, SettingsIcon, StoreIcon, TrophyIcon,
  WarehouseIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { NavItem } from './NavItem.tsx';
import { useSlot } from '@/app';
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
  inbox: <MailIcon />,
  standalone: <TrophyIcon />,
  race: <FlagIcon />,
  results: <ChartLineIcon />,
  calendar: <CalendarDaysIcon />,
  championships: <MedalIcon />,
  store: <StoreIcon />,
  garage: <WarehouseIcon />,
  settings: <SettingsIcon />,
};

interface AppNavProps {
  /**
   * The destinations the mode the app is in offers, in order.
   */
  entries: readonly (NavEntry & { id: NavId })[];
  /**
   * The entries showing their icon alone, for a header too narrow for every
   * label.
   */
  compact: ReadonlySet<string>;
}

export const AppNav = ({ entries, compact }: AppNavProps) => {
  const { t } = useTranslation();
  const { career } = useSlot();
  // What the inbox holds unopened, which its entry carries.
  const unread = career?.inbox.filter((mail) => !mail.opened).length ?? 0;

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
          badge={entry.id === 'inbox' ? unread : 0}
          compact={compact.has(entry.id)}
        />
      ))}
    </nav>
  );
};
