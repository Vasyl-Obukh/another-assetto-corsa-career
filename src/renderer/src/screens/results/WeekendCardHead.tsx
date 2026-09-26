import type { ReactNode } from 'react';

import { isServableLayout, trackOutlineUrl } from '../../../../shared/utils/content-url';
import { ContentImage } from '@/components';
import { cn } from '@/lib/utils.ts';
import { layoutImageSources } from '@/screens/track-browser';

interface WeekendCardHeadProps {
  /**
   * The layout the weekend ran on, or null when it is not known.
   */
  layout: { id: string; layout: string } | null;
  /**
   * The short line in the top corner - when it ran, or where it is up to.
   */
  pill: ReactNode;
  /**
   * Classes for the pill, for one that wears a colour of its own over the
   * photograph's scrim.
   */
  pillClassName?: string;
  /**
   * The weekend's name.
   */
  title: string;
  /**
   * Something in the top-right corner, above the photograph - a card's menu.
   * The outline steps down below it.
   */
  corner?: ReactNode;
  /**
   * The line under it.
   */
  line: ReactNode;
}

/**
 * The top of a weekend's card: the layout's photograph with its outline over
 * it, a pill in the corner and the weekend's name along the bottom. Shared by
 * the Results page's weekends and the Race tab's, so the two lists read as one.
 */
export const WeekendCardHead = ({
  layout, pill, pillClassName, title, line, corner,
}: WeekendCardHeadProps) => (
  <div className="relative h-30 bg-scrim">
    {layout ? (
      <>
        <ContentImage sources={layoutImageSources(layout)} alt="" className="object-cover" fallback={null} />
        <span className="absolute inset-0 bg-gradient-to-t from-scrim/85 to-transparent" />
        {isServableLayout(layout.id, layout.layout) ? (
          <img
            src={trackOutlineUrl(layout.id, layout.layout)}
            alt=""
            className={cn('absolute right-3 h-16 w-24 object-contain brightness-0 invert', corner ? 'top-11' : 'top-3')}
          />
        ) : null}
      </>
    ) : null}
    <span className={cn('absolute top-3 left-3 rounded-full bg-scrim/55 px-2 py-0.5 text-xs text-on-scrim', pillClassName)}>
      {pill}
    </span>
    {corner ? <div className="absolute top-2 right-2 z-10">{corner}</div> : null}
    <div className="absolute inset-x-3 bottom-2.5 flex flex-col text-on-scrim">
      <span className="truncate text-base font-semibold" data-selectable>{title}</span>
      <span className="truncate text-xs opacity-85">{line}</span>
    </div>
  </div>
);
