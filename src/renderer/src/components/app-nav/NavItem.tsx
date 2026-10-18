import type { ReactNode } from 'react';
import { matchPath, NavLink, useLocation } from 'react-router';

import { Button } from '@/components/ui/button.tsx';
import { path, ROUTE, sectionOf } from '@/lib/routes';
import type { NavId, RouteId } from '@/lib/routes';
import { cn } from '@/lib/utils.ts';

interface NavItemProps {
  /**
   * Which destination the item leads to.
   */
  id: NavId;
  /**
   * Where it leads, when that is not where it stays lit - a destination with
   * no parameters, so its pattern is its URL.
   */
  to?: RouteId;
  /**
   * Other destinations it stays lit on.
   */
  also?: readonly RouteId[];
  /**
   * The already-translated label.
   */
  label: string;
  /**
   * The icon shown beside the label.
   */
  icon: ReactNode;
}

export const NavItem = ({
  id, to, also = [], label, icon,
}: NavItemProps) => {
  // The pattern is matched and the URL is linked to, both read off the registry
  // rather than passed in, so a destination whose pattern gains a parameter
  // cannot end up matching one thing and linking to another.
  //
  // Not an exact match: a section stays lit while one of its own pages is open,
  // so opening a car from the browser does not darken the Cars tab. A page
  // opened as part of another section says so in its state, and that wins.
  const location = useLocation();
  const matched = [id, ...also].some((one) => matchPath({ path: ROUTE[one], end: false }, location.pathname) !== null);
  const section = sectionOf(location.state);
  const active = section === null ? matched : section === id;

  // Tinted with the app's own accent rather than the grey a secondary button
  // wears: the header is the one thing on screen at all times, and "which
  // section am I in" should not be a shade of the same neutral as everything
  // around it.
  return (
    <Button
      asChild
      size="sm"
      variant="ghost"
      className={cn(active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary')}
    >
      <NavLink to={to ? ROUTE[to] : path[id]()}>
        {icon}
        {label}
      </NavLink>
    </Button>
  );
};
