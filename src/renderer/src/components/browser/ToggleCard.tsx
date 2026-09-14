import { useId } from 'react';
import type { ReactNode } from 'react';

import { Switch } from '@/components/ui/switch.tsx';
import { cn } from '@/lib/utils.ts';

/**
 * A darker track for a switch that is off. The vendored one is the input
 * border's grey, which vanishes against the white backing in the light theme.
 */
const OFF_TRACK = 'data-[state=unchecked]:bg-muted-foreground/35 dark:data-[state=unchecked]:bg-muted-foreground/35';

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
   * The card itself.
   */
  children: ReactNode;
}

/**
 * A browser card with a switch in its corner, where clicking anywhere on the
 * card flips it.
 *
 * A label rather than a button around the card, so the switch stays the one
 * control and nothing interactive is nested inside another.
 */
export const ToggleCard = ({
  checked, label, onChange, children,
}: ToggleCardProps) => {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        'relative block w-full rounded-xl text-left',
        'has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
      )}
    >
      {children}
      {/* A backing of its own, so it reads over any picture. */}
      <span className="absolute top-3 right-3 flex rounded-full bg-background/90 p-1 shadow-sm">
        <Switch
          id={id}
          checked={checked}
          aria-label={label}
          className={OFF_TRACK}
          onCheckedChange={onChange}
        />
      </span>
    </label>
  );
};
