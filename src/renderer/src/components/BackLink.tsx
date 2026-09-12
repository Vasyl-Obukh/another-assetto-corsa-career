import { ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button.tsx';

interface BackLinkProps {
  /**
   * Where Back goes - always a fixed route, never the history, so it lands in
   * the same place however the screen was reached.
   */
  to: string;
  /**
   * What it says, already translated.
   */
  label: string;
}

/**
 * The one Back control every screen uses, so they all look and sit alike.
 *
 * A link rather than a button even where leaving can be refused: a navigation
 * blocker intercepts a link just as well, and a link is what it is.
 */
export const BackLink = ({ to, label }: BackLinkProps) => (
  <Button
    asChild
    size="sm"
    variant="ghost"
    className="-ml-2.5 w-fit text-muted-foreground hover:text-foreground"
  >
    <Link to={to}>
      <ArrowLeftIcon />
      {label}
    </Link>
  </Button>
);
