import { CheckIcon } from 'lucide-react';

import type { EventSessionStatus } from '../../../../shared/types';
import { cn } from '@/lib/utils.ts';

interface SessionStatusDotProps {
  /**
   * Where the session stands.
   */
  status: EventSessionStatus;
}

/**
 * A session's place in the event as a dot: filled with a tick once run, a
 * ring in the primary colour for the one to run next, hollow for the rest.
 *
 * A shape as well as a colour, so the three read apart without relying on hue -
 * and success and primary rather than a new family, since run and next are
 * exactly what those two tokens already mean.
 */
export const SessionStatusDot = ({ status }: SessionStatusDotProps) => (
  <span
    aria-hidden
    className={cn(
      'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
      status === 'done' && 'border-success bg-success text-success-foreground',
      status === 'next' && 'border-primary bg-primary shadow-[inset_0_0_0_3px_var(--card)]',
      status === 'later' && 'border-border',
    )}
  >
    {status === 'done' ? <CheckIcon className="size-3" strokeWidth={3.5} /> : null}
  </span>
);
