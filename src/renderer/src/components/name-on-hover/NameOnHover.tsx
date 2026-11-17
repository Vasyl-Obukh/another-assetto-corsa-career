import type { ReactElement } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

interface NameOnHoverProps {
  /**
   * What the tooltip says.
   */
  name: string;
  /**
   * Whether it says it: true while the label is hidden.
   */
  show: boolean;
  /**
   * The one element it names.
   */
  children: ReactElement;
}

// Always a Tooltip, empty when not shown, so turning it on does not remount
// what it wraps - which would drop focus from a link.
export const NameOnHover = ({ name, show, children }: NameOnHoverProps) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    {show ? <TooltipContent>{name}</TooltipContent> : null}
  </Tooltip>
);
