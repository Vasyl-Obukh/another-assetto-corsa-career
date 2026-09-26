import { cn } from '@/lib/utils.ts';

interface LiveryPlateProps {
  /**
   * The racing number, as the livery writes it.
   */
  number: string;
  /**
   * Classes for where it sits - absolute over a photo, or in a line of text.
   */
  className?: string;
}

/**
 * A livery's racing number as a plate, the way it reads on the car: light on a
 * photograph, in the scrim pair since that is what sits over pictures.
 */
export const LiveryPlate = ({ number, className }: LiveryPlateProps) => (
  <span
    className={cn(
      'inline-grid h-5.5 min-w-7 shrink-0 place-items-center rounded-[5px] bg-on-scrim px-1.5',
      'text-[13px] font-bold tracking-tight text-scrim tabular-nums shadow-sm',
      className,
    )}
  >
    {number}
  </span>
);
