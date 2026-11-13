import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { CALLOUT_TONE } from './constants.ts';
import type { CalloutTone } from './types.ts';
import { cn } from '@/lib/utils.ts';

interface CalloutProps {
  /**
   * What it is about, which picks its tint.
   */
  tone: CalloutTone;
  /**
   * The icon leading it.
   */
  icon: LucideIcon;
  /**
   * What it says.
   */
  children: ReactNode;
  /**
   * Classes over its own - its text size and colour, which are the caller's.
   */
  className?: string;
}

/**
 * A note set apart from the text around it: a rounded tint with an icon
 * leading it, muted unless the caller says otherwise.
 */
export const Callout = ({
  tone, icon: Icon, children, className,
}: CalloutProps) => (
  <div className={cn('flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground', CALLOUT_TONE[tone], className)}>
    {/* Sized in em, so it sits on the first line at whatever text size the caller sets. */}
    <Icon className="mt-[0.15em] size-[1.15em] shrink-0" aria-hidden />
    <div className="min-w-0">{children}</div>
  </div>
);
