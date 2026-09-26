import { tierAccent } from './utils.ts';
import type { ClassEntry } from '../../../../shared/types';
import { Badge } from '@/components/ui/badge.tsx';

interface PurseHeadingProps {
  /**
   * The names of the classes the purse is paid to.
   */
  classes: readonly string[];
  /**
   * Every class of the championship, for the tier each is chipped in.
   */
  entries: readonly ClassEntry[];
}

// A prize column's heading when the grid is paid more than one way: the
// classes it pays, each in its tier's metal as the sidebar chips them.
export const PurseHeading = ({ classes, entries }: PurseHeadingProps) => (
  <span className="flex flex-wrap justify-end gap-1">
    {classes.map((name) => {
      const tier = entries.find((entry) => entry.name === name)?.ladder.tier;

      return (
        <Badge key={name} className={tier === undefined ? undefined : tierAccent(tier)}>{name}</Badge>
      );
    })}
  </span>
);
