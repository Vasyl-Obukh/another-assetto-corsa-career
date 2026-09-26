import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { INDEX_OFFSET } from './constants.ts';
import type { SectionLink } from './types.ts';
import { cn } from '@/lib/utils.ts';

interface SectionIndexProps {
  /**
   * The sections, in page order.
   */
  sections: readonly SectionLink[];
  /**
   * The element the page scrolls in, which is what says where the reader is.
   */
  scroller: HTMLElement | null;
}

/**
 * The list of a long settings page's sections, beside them: each scrolls its
 * section into view, and the one being read is marked.
 */
export const SectionIndex = ({ sections, scroller }: SectionIndexProps) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState<string | undefined>(sections[0]?.id);

  useEffect(() => {
    if (!scroller) return undefined;

    // The last section whose top has passed the top of the view, or the last
    // of all once the page cannot scroll further - a short final section
    // never reaches the top.
    const update = (): void => {
      const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      const top = scroller.getBoundingClientRect().top + INDEX_OFFSET;
      const passed = sections.filter((section) => {
        const element = document.getElementById(section.id);
        return element !== null && element.getBoundingClientRect().top <= top;
      });

      setCurrent((atEnd ? sections.at(-1) : passed.at(-1) ?? sections[0])?.id);
    };

    update();
    scroller.addEventListener('scroll', update, { passive: true });

    return () => scroller.removeEventListener('scroll', update);
  }, [scroller, sections]);

  return (
    <nav aria-label={t('settings.sections')} className="sticky top-6 flex flex-col gap-0.5 self-start">
      {sections.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-current={current === id ? 'location' : undefined}
          className={cn(
            'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground',
            'hover:bg-accent hover:text-foreground',
            current === id && 'bg-accent font-medium text-foreground',
          )}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Icon className="size-4 shrink-0" />
          {t(label)}
        </button>
      ))}
    </nav>
  );
};
