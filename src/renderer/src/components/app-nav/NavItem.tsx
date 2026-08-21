import type { ReactNode } from 'react';
import { NavLink, useMatch } from 'react-router';

import type { Route } from '@/app';
import { Button } from '@/components/ui/button.tsx';

interface NavItemProps {
  /**
   * Where the item leads.
   */
  to: Route;
  /**
   * The already-translated label.
   */
  label: string;
  /**
   * The icon shown beside the label.
   */
  icon: ReactNode;
}

export const NavItem = ({ to, label, icon }: NavItemProps) => {
  const active = useMatch(to) !== null;

  return (
    <Button asChild size="sm" variant={active ? 'secondary' : 'ghost'}>
      <NavLink to={to}>
        {icon}
        {label}
      </NavLink>
    </Button>
  );
};
