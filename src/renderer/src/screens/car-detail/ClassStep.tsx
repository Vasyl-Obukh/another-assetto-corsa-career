import { CheckIcon } from 'lucide-react';

import type { ClassPicks } from './types.ts';
import type { ClassId } from '../../../../shared/types';
import { useClasses } from '@/app';
import { Button } from '@/components/ui/button.tsx';

interface ClassStepProps {
  /**
   * What the form holds.
   */
  picks: ClassPicks;
  /**
   * Whether a command is running, which freezes the choices.
   */
  busy: boolean;
  /**
   * Ticks or unticks one class.
   * @param carClass The class to switch
   */
  onToggle: (carClass: ClassId) => void;
}

export const ClassStep = ({ picks, busy, onToggle }: ClassStepProps) => {
  const { catalogue } = useClasses();
  // A class with no specs has nothing to pick in the second step, so it is not
  // offered here at all rather than offered and dead-ended.
  const offered = catalogue.classes.filter((one) => one.specs.length > 0);

  return (
    <div className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3">
      {offered.map((one) => {
        const on = picks.classes.includes(one.id);

        return (
          <Button
            key={one.id}
            type="button"
            variant={on ? 'secondary' : 'outline'}
            size="sm"
            className="justify-start"
            aria-pressed={on}
            disabled={busy}
            onClick={() => onToggle(one.id)}
          >
            {on ? <CheckIcon /> : null}
            <span className="truncate">{one.name}</span>
          </Button>
        );
      })}
    </div>
  );
};
