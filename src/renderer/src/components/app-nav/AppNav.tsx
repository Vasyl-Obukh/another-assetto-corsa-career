import { CarIcon, MapIcon, WrenchIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { NavItem } from './NavItem.tsx';
import { NAV } from '@/lib/routes';
import type { NavId } from '@/lib/routes';

/**
 * The icon for each destination.
 *
 * The one part of a nav entry that is genuinely visual, so it stays here rather
 * than in the registry, which holds no React. Typed against NavId, so adding a
 * destination without an icon does not compile.
 */
const NAV_ICONS: Record<NavId, ReactNode> = {
  cars: <CarIcon />,
  tracks: <MapIcon />,
  diagnostics: <WrenchIcon />,
};

export const AppNav = () => {
  const { t } = useTranslation();

  return (
    <nav className="flex items-center gap-1">
      {NAV.map(({ id, label }) => (
        <NavItem key={id} id={id} label={t(label)} icon={NAV_ICONS[id]} />
      ))}
    </nav>
  );
};
