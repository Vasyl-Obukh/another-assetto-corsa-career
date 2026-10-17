import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { ContentImage } from '@/components';
import { MODE_ACCENT, MODE_STRIPE } from '@/lib/accents';
import type { AppMode } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface StartTileProps {
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
   * The photograph behind its name, best first.
   */
  photo: readonly string[];
  /**
   * What its main button carries on with, its skeleton while that is read, or
   * nothing for a first run.
   */
  line: ReactNode;
  /**
   * Its buttons.
   */
  children: ReactNode;
}

/**
 * One mode on the start screen: a card as tall as what it holds, its name over
 * a band of photograph, then what it is, what Continue would open and the ways
 * in.
 */
export const StartTile = ({
  mode, icon: Icon, title, description, photo, line, children,
}: StartTileProps) => (
  <section className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-md">
    <div className={cn('relative h-33 shrink-0 border-t-3 bg-scrim text-on-scrim', MODE_STRIPE[mode])}>
      <ContentImage sources={[...photo]} alt="" className="object-cover" fallback={null} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-scrim/80" />
      <div className="absolute inset-x-4 bottom-3 flex items-center gap-2.5">
        <span className={cn('grid size-9 place-items-center rounded-lg [&_svg]:size-[18px]', MODE_ACCENT[mode])}>
          <Icon />
        </span>
        <h2 className="text-xl font-semibold [text-shadow:0_1px_3px_var(--scrim)]">{title}</h2>
      </div>
    </div>

    <div className="flex flex-1 flex-col gap-3 px-4 pt-3.5 pb-4">
      {/* Two lines held even when one would do, so the cards' lines and
          buttons stay level side by side. */}
      <p className="min-h-10 text-sm text-muted-foreground">{description}</p>
      {line}
      <div className="mt-auto flex flex-wrap items-center gap-2">{children}</div>
    </div>
  </section>
);
