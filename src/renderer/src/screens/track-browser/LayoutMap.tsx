import { MapIcon } from 'lucide-react';

import { layoutMapSources } from './utils.ts';
import { ContentImage } from '@/components';
import { cn } from '@/lib/utils.ts';

interface LayoutMapProps {
  /**
   * The layout to draw.
   */
  track: {
    /**
     * The circuit's folder name.
     */
    id: string;
    /**
     * The layout's folder name, absent for a circuit with only one.
     */
    layout?: string | null;
  };
  /**
   * The picture's alternative text.
   */
  alt: string;
  /**
   * The picture's own classes, such as its padding.
   */
  className?: string;
  /**
   * The fallback icon's size classes.
   */
  iconClassName?: string;
}

/**
 * A layout's shape, for a round to say which layout of a circuit it runs - the
 * photographs of one circuit's layouts look alike. Fills the positioned box it
 * is placed in, and the outline is drawn white, so it is inverted in light mode.
 */
export const LayoutMap = ({
  track, alt, className, iconClassName = 'size-4',
}: LayoutMapProps) => (
  <ContentImage
    sources={layoutMapSources({ id: track.id, layout: track.layout ?? '' })}
    alt={alt}
    // Double-quoted: Tailwind reads the source as text, and an escaped quote
    // would reach the generated selector as a backslash.
    className={cn("object-contain [&[src*='/outline']]:invert dark:[&[src*='/outline']]:invert-0", className)}
    fallback={(
      <div className="absolute inset-0 flex items-center justify-center">
        <MapIcon className={cn('text-muted-foreground/40', iconClassName)} />
      </div>
    )}
  />
);
