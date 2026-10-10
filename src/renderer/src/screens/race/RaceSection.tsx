import type { ReactNode } from 'react';

interface RaceSectionProps {
  /**
   * The section's heading.
   */
  title: string;
  /**
   * A quiet line beside it.
   */
  hint: string;
  /**
   * The section's card.
   */
  children: ReactNode;
}

/**
 * One part of a race event's setup, headed above its card rather than inside
 * it - the rules arrive as the championship editor's own card, so every part
 * is headed the same way around it.
 */
export const RaceSection = ({ title, hint, children }: RaceSectionProps) => (
  <section className="flex flex-col gap-2">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="min-w-0 flex-1 text-sm text-muted-foreground">{hint}</p>
    </div>
    {children}
  </section>
);
