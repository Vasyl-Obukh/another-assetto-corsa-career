import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';
import { useBack } from '@/hooks';

interface BackLinkProps {
  /**
   * Where Back leads when the window has been on no page before this one -
   * right after launch - which is the screen's fixed parent.
   */
  to: string;
  /**
   * What it says then, already translated.
   */
  label: string;
}

/**
 * The one Back control every screen uses, so they all look and sit alike.
 *
 * It returns to the page the user came from and names it - a round, a car, the
 * calendar - stepping back through the history rather than adding to it, so a
 * chain of pages unwinds in order and a navigation blocker still gets its say.
 * Only with nowhere to go back to does it lead to the fixed parent instead.
 */
export const BackLink = ({ to, label }: BackLinkProps) => {
  const back = useBack({ to, label });

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="-ml-2.5 w-fit text-muted-foreground hover:text-foreground"
      onClick={back.go}
    >
      <ArrowLeftIcon />
      {back.label}
    </Button>
  );
};
