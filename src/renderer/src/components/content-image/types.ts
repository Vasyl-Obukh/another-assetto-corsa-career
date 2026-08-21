import type { ReactNode } from 'react';

/**
 * An image served out of the Assetto Corsa install, with somewhere to fall back
 * to when it is not there.
 *
 * The image and its fallback are both positioned absolutely, so **the element
 * this is rendered into must be `relative`** and must size itself - typically an
 * `aspect-[16/9]` box. That is what keeps every card the same height whatever
 * the source image's own dimensions turn out to be.
 */
export interface ContentImageProps {
  /**
   * Candidate accontent:// URLs, tried in order as each one fails.
   */
  sources: string[];
  /**
   * What to render once every source has failed, or when there were none.
   */
  fallback: ReactNode;
  /**
   * Alt text, already translated.
   */
  alt: string;
  /**
   * Classes for the image itself, so a badge can contain rather than cover.
   */
  className?: string;
}
