import type { ReactNode } from 'react';
import { NavLink, useMatch } from 'react-router';

import { Button } from '@/components/ui/button.tsx';
import { path, ROUTE } from '@/lib/routes';
import type { NavId } from '@/lib/routes';

interface NavItemProps {
  /**
   * Which destination the item leads to.
   */
  id: NavId;
  /**
   * The already-translated label.
   */
  label: string;
  /**
   * The icon shown beside the label.
   */
  icon: ReactNode;
}

export const NavItem = ({ id, label, icon }: NavItemProps) => {
  // The pattern is matched and the URL is linked to, both read off the registry
  // rather than passed in, so a destination whose pattern gains a parameter
  // cannot end up matching one thing and linking to another.
  //
  // Not an exact match: a section stays lit while one of its own pages is open,
  // so opening a car from the browser does not darken the Cars tab.
  const active = useMatch({ path: ROUTE[id], end: false }) !== null;

  return (
    <Button asChild size="sm" variant={active ? 'secondary' : 'ghost'}>
      <NavLink to={path[id]()}>
        {icon}
        {label}
      </NavLink>
    </Button>
  );
};
