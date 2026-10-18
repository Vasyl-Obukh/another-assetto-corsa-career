import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { MODE_ACCENT } from '@/lib/accents';
import type { AppMode } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface ModeBlockProps {
  /**
   * Which mode it opens, which decides its colours.
   */
  mode: AppMode;
  /**
   * The mode's icon.
   */
  icon: LucideIcon;
  /**
   * The mode's name.
   */
  title: string;
  /**
   * What the mode is.
   */
  description: string;
  /**
   * What its main button carries on with, its skeleton while that is read, or
   * nothing for a mode never played.
   */
  line: ReactNode;
  /**
   * Its buttons.
   */
  children: ReactNode;
}

/**
 * One mode in the start screen's panel: its icon in its colour, its name, what
 * it is, what it would carry on with and the ways in - a block of the menu
 * rather than a card, with a rule under every block but the last.
 */
export const ModeBlock = ({
  mode, icon: Icon, title, description, line, children,
}: ModeBlockProps) => (
  <section className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border-b py-5 last-of-type:border-b-0">
    <span className={cn('row-span-2 grid size-12 place-items-center rounded-xl [&_svg]:size-6', MODE_ACCENT[mode])}>
      <Icon />
    </span>
    <h2 className="text-[22px] leading-12 font-semibold">{title}</h2>
    <div className="col-start-2 flex min-w-0 flex-col gap-2.5">
      <p className="text-[13.5px] text-muted-foreground">{description}</p>
      {line}
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  </section>
);
