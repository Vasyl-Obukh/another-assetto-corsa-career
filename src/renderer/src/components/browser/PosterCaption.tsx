import type { ReactNode } from 'react';

interface PosterCaptionProps {
  /**
   * The small line over the name - who made it, or where it is.
   */
  overline: ReactNode;
  /**
   * The name, shown in full on hover when it is clamped.
   */
  name: string;
}

/**
 * The name laid over the bottom of a card's picture, on a fade dark enough to
 * read white text over any photograph in either theme.
 */
export const PosterCaption = ({ overline, name }: PosterCaptionProps) => (
  <>
    <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-scrim/90 via-scrim/55 to-transparent" />
    <div className="absolute inset-x-3 bottom-2.5 flex flex-col gap-1 text-on-scrim">
      <div className="flex min-w-0 items-center gap-1.5 text-xs text-on-scrim/85">{overline}</div>
      <span className="line-clamp-2 leading-5 font-semibold [text-shadow:0_1px_2px_var(--scrim)]" title={name}>
        {name}
      </span>
    </div>
  </>
);
