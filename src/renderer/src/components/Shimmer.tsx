import { cn } from '@/lib/utils.ts';

interface ShimmerProps {
  /**
   * Its size and shape - a width and a height, and `rounded-full` for a pill or
   * a dot. A line of text is the height of its text rather than of its line.
   */
  className?: string;
  /**
   * Whether it stands for a picture rather than for text, which is drawn a
   * shade deeper so a poster reads as an image still to come.
   */
  deep?: boolean;
}

/**
 * One block of a loading skeleton, sized and placed like what it stands for.
 *
 * Every skeleton in the app is built from these over the screen's own real
 * chrome, so a page keeps its shape while it loads and nothing moves when the
 * data arrives. The sweep and the delayed fade-in are the `shimmer` utility in
 * `globals.css`.
 */
export const Shimmer = ({ className, deep = false }: ShimmerProps) => (
  <div
    aria-hidden
    className={cn('shimmer shrink-0', deep && '[--shimmer-fill:var(--skeleton-deep)]', className)}
  />
);
