import { useId } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { CARD_LINK, SWITCH_TRACK } from './constants.ts';
import { Switch } from '@/components/ui/switch.tsx';
import type { NavId, NavState } from '@/lib/routes';

interface ToggleCardProps {
  /**
   * Whether the switch is on.
   */
  checked: boolean;
  /**
   * The already-translated name of what is being switched, for the switch's own
   * accessible name - the card around it says far more than that.
   */
  label: string;
  /**
   * Flips the switch.
   * @param next Whether it should now be on
   */
  onChange(next: boolean): void;
  /**
   * The URL of the entry's own page.
   */
  to: string;
  /**
   * The section navigation keeps lit on that page, when the rest of the card
   * opens it; unset, the whole card flips the switch.
   */
  section: NavId | undefined;
  /**
   * The card itself.
   */
  children: ReactNode;
}

/**
 * A browser card with a switch in its corner. Given a section, the switch alone
 * flips and the rest of the card opens the entry's page, as any other browser
 * card does; without one, clicking anywhere on the card flips it.
 *
 * The switch sits beside the link rather than inside it, and the flipping card
 * is a label rather than a button, so nothing interactive is nested inside
 * another.
 */
export const ToggleCard = ({
  checked, label, onChange, to, section, children,
}: ToggleCardProps) => {
  const id = useId();

  return (
    <div className="relative h-full">
      {section === undefined ? (
        <label htmlFor={id} className="block h-full w-full rounded-xl text-left has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50">
          {children}
        </label>
      ) : (
        <Link
          to={to}
          state={{ section } satisfies NavState}
          className={CARD_LINK}
        >
          {children}
        </Link>
      )}
      {/* A backing of its own, so it reads over any picture. */}
      <span className="absolute top-3 right-3 flex rounded-full bg-background/90 p-1 shadow-sm">
        <Switch id={id} checked={checked} aria-label={label} className={SWITCH_TRACK} onCheckedChange={onChange} />
      </span>
    </div>
  );
};
