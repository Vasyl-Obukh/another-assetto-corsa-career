import type { ReactNode } from 'react';

import { Shimmer } from '@/components/Shimmer.tsx';
import { Card } from '@/components/ui/card.tsx';

interface PosterSkeletonProps {
  /**
   * What sits over the picture's top-right corner, when the card has
   * something there - a circuit's map.
   */
  corner?: ReactNode;
  /**
   * The lines under the picture, which differ from browser to browser.
   */
  children: ReactNode;
}

/**
 * A browser's poster card while the library is read: the picture with its
 * source chip and caption where they will land, and the card's own lines
 * below.
 */
export const PosterSkeleton = ({ corner, children }: PosterSkeletonProps) => (
  <Card className="h-full gap-0 overflow-hidden py-0">
    <div className="relative aspect-[4/3] w-full">
      <Shimmer deep className="absolute inset-0 rounded-none" />
      <Shimmer className="absolute top-2 left-2 h-5.5 w-16" />
      {corner}
      <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2">
        <Shimmer className="h-2.5 w-24" />
        <Shimmer className="h-3.5 w-3/4" />
      </div>
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-3">{children}</div>
  </Card>
);
