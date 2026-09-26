import type { ReactNode } from 'react';

import { Card } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';

interface DetailPanelProps {
  /**
   * The panel's heading.
   */
  title: string;
  /**
   * An icon before the heading, when the panel has one.
   */
  icon?: ReactNode;
  /**
   * Anything after the heading - a count, a legend.
   */
  aside?: ReactNode;
  /**
   * Classes for the body, which pads itself by default.
   */
  className?: string;
  /**
   * The body.
   */
  children: ReactNode;
}

/**
 * One panel of a detail page - a car's or a track's: a small heading over its body, so every panel in
 * both columns starts its text on the same line.
 */
export const DetailPanel = ({
  title, icon, aside, className, children,
}: DetailPanelProps) => (
  <Card className="gap-0 py-0">
    <h2 className="flex items-center gap-2 px-4 pt-3.5 text-sm font-semibold [&>svg]:size-3.5">
      {icon}
      {title}
      {aside}
    </h2>
    <div className={cn('px-4 pt-2.5 pb-4', className)}>{children}</div>
  </Card>
);
