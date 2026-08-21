import { CarIcon, MapIcon, WrenchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NavItem } from './NavItem.tsx';
import { ROUTES } from '@/app';

export const AppNav = () => {
  const { t } = useTranslation();

  return (
    <nav className="flex items-center gap-1">
      <NavItem to={ROUTES.cars} label={t('nav.cars')} icon={<CarIcon />} />
      <NavItem to={ROUTES.tracks} label={t('nav.tracks')} icon={<MapIcon />} />
      <NavItem to={ROUTES.diagnostics} label={t('nav.diagnostics')} icon={<WrenchIcon />} />
    </nav>
  );
};
