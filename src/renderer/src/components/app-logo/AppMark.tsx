import { SMALL_MARK_PX } from './constants.ts';
import { cn } from '@/lib/utils.ts';

interface AppMarkProps {
  /**
   * Its width and height in pixels, which also picks the drawing: at
   * `SMALL_MARK_PX` and below, the bolder one.
   */
  size: number;
  /**
   * Anything the caller adds to the drawing.
   */
  className?: string;
}

// The app's mark: a circuit in the shape of an A, its start line on the left
// foot and the car, in kerb red, on the right leg. The track is the current
// text colour, so it follows whatever it sits on.
export const AppMark = ({ size, className }: AppMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    aria-hidden
    className={cn('shrink-0', className)}
  >
    {size <= SMALL_MARK_PX ? (
      // The thin start line and the triangle are lost below this size.
      <>
        <path
          d="M9 57 L29.5 9 Q32 4 34.5 9 L55 57 L42 57 L38.5 47 L25.5 47 L22 57 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <circle cx="43.9" cy="31" r="6" className="fill-logo-red" />
      </>
    ) : (
      <>
        <path
          d="M10 56 L30 9.5 Q32 5.5 34 9.5 L54 56 L42.5 56 L38.5 45.5 L25.5 45.5 L21.5 56 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
        <path d="M28.5 36.5 L32 27 L35.5 36.5 Z" fill="currentColor" />
        <path d="M18 51 V61" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="43.5" cy="31.5" r="4" className="fill-logo-red" />
      </>
    )}
  </svg>
);
