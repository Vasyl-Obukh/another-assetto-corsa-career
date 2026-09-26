import type { ReactNode } from 'react';

interface NumberedStepProps {
  /**
   * Which step it is, counting from one.
   */
  number: number;
  /**
   * The step's heading, already translated.
   */
  title: string;
  /**
   * A quiet word after the heading, such as that the step is optional.
   */
  aside?: string;
  /**
   * The step's controls.
   */
  children: ReactNode;
}

/**
 * One step of an editor read top to bottom, numbered so the order it is
 * meant to be worked in is plain.
 */
export const NumberedStep = ({
  number, title, aside, children,
}: NumberedStepProps) => (
  <section className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 border-t px-4 py-4 first:border-t-0 sm:px-5">
    <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{number}</span>
    <div className="flex min-w-0 flex-col gap-2.5">
      <h4 className="text-sm font-semibold">
        {title}
        {aside ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">{aside}</span> : null}
      </h4>
      {children}
    </div>
  </section>
);
