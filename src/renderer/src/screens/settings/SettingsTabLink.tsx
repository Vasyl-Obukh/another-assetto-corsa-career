import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';

import type { SettingsTab } from './types.ts';
import { NameOnHover } from '@/components';
import { NAV_FIT_LABEL, navFitItem } from '@/hooks';
import { cn } from '@/lib/utils.ts';

interface SettingsTabLinkProps {
  /**
   * The tab.
   */
  tab: SettingsTab;
  /**
   * Whether its label gives way to the icon alone, named on hover.
   */
  compact: boolean;
}

export const SettingsTabLink = ({ tab: { to, end, label, icon: Icon }, compact }: SettingsTabLinkProps) => {
  const { t } = useTranslation();

  return (
    <NameOnHover name={t(label)} show={compact}>
      <NavLink
        to={to}
        end={end}
        {...navFitItem(to, compact)}
        // A string, not a function of isActive: the tooltip's Slot joins class
        // names as strings and would turn a function into its own source, both
        // branches included. NavLink adds the active class itself.
        className={cn(
          'group -mb-px flex shrink-0 items-center gap-2 border-b-2 border-transparent pb-2 text-sm font-medium',
          'whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',
          '[&.active]:border-primary [&.active]:text-foreground',
        )}
      >
        <Icon className="size-4 group-[.active]:text-primary" />
        <span {...NAV_FIT_LABEL} className={cn(compact && 'sr-only')}>{t(label)}</span>
      </NavLink>
    </NameOnHover>
  );
};
