import { InfoIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StrengthNoteProps {
  /**
   * What the note says.
   */
  children: ReactNode;
}

/**
 * A note under an AI strength step, saying what it reaches and what it does not.
 */
export const StrengthNote = ({ children }: StrengthNoteProps) => (
  <p className="flex items-start gap-2 rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">
    <InfoIcon className="mt-px size-3.5 shrink-0" />
    <span>{children}</span>
  </p>
);
