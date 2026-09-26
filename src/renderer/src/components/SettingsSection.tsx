import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { SECTION_ACCENT } from '@/lib/accents';
import type { SectionTone } from '@/lib/accents';
import { cn } from '@/lib/utils.ts';

interface SettingsSectionProps {
  /**
   * The element id, for a section index to scroll to.
   */
  id?: string;
  /**
   * The icon in its well.
   */
  icon: LucideIcon;
  /**
   * What the section is about, which colours the well.
   */
  tone: SectionTone;
  /**
   * Its heading.
   */
  title: string;
  /**
   * The line under the heading saying what it is for.
   */
  hint?: ReactNode;
  /**
   * A strip under the body, for a note or an action about the whole section.
   */
  footer?: ReactNode;
  /**
   * The section's controls.
   */
  children: ReactNode;
}

/**
 * A card of settings: an icon in a coloured well beside its heading, so a long
 * page reads as a run of landmarks rather than a run of identical cards.
 */
export const SettingsSection = ({
  id, icon: Icon, tone, title, hint, footer, children,
}: SettingsSectionProps) => (
  <section id={id} className="scroll-mt-4 rounded-xl border bg-card text-card-foreground shadow-sm">
    <header className="flex items-start gap-3 px-5 pt-4">
      <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', SECTION_ACCENT[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="font-semibold">{title}</h2>
        {hint ? <p className="max-w-3xl text-sm text-muted-foreground">{hint}</p> : null}
      </div>
    </header>

    <div className="px-5 pt-4 pb-5">{children}</div>

    {footer ? (
      <footer className="flex flex-wrap items-center gap-2 border-t px-5 py-2.5 text-xs text-muted-foreground">
        {footer}
      </footer>
    ) : null}
  </section>
);
