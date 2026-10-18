import { Shimmer } from '@/components';

interface PlayedCaptionProps {
  /**
   * What was played last and what of it the photograph shows, or null while
   * the modes are read.
   */
  played: {
    /**
     * The small capitals over it: when, and which mode.
     */
    kicker: string;
    /**
     * Who or what it is.
     */
    title: string;
    /**
     * Where it stands.
     */
    detail: string;
  } | null;
}

/**
 * What the start screen's photograph is, in its far corner: whatever was
 * played last, which its track is the photograph of.
 */
export const PlayedCaption = ({ played }: PlayedCaptionProps) => (
  <div className="absolute right-12 bottom-9 flex max-w-[40%] flex-col items-end gap-1 text-right text-on-scrim [text-shadow:0_1px_4px_var(--scrim)]">
    {played ? (
      <>
        <span className="text-xs font-semibold tracking-[.08em] text-on-scrim/80 uppercase">{played.kicker}</span>
        <span className="max-w-full truncate text-[26px] leading-tight font-semibold">{played.title}</span>
        <span className="max-w-full truncate text-sm text-on-scrim/85">{played.detail}</span>
      </>
    ) : (
      <>
        <Shimmer className="h-3 w-24 opacity-40" />
        <Shimmer className="h-6.5 w-72 opacity-40" />
      </>
    )}
  </div>
);
