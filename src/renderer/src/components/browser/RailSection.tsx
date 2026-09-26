import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import { useFormat } from '@/i18n';

interface RailSectionProps {
  /**
   * The section's name, already translated, or undefined for a group of
   * switches that name themselves and never fold.
   */
  title?: string;
  /**
   * What is picked in it, already translated - counted on the heading, and
   * spelled out under it while the section is folded.
   */
  picked?: readonly string[];
  /**
   * The section's controls.
   */
  children: ReactNode;
}

/**
 * One foldable group of a filter rail.
 */
export const RailSection = ({ title, picked = [], children }: RailSectionProps) => {
  const { formatNumber } = useFormat();
  const [open, setOpen] = useState(true);
  const id = useId();
  const summary = picked.join(', ');

  if (title === undefined) return <section className="border-b px-4 py-2 last:border-b-0">{children}</section>;

  return (
    <section className="border-b last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold hover:bg-accent/50"
        onClick={() => setOpen(!open)}
      >
        {title}
        {picked.length > 0 ? (
          <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground tabular-nums">
            {formatNumber(picked.length)}
          </span>
        ) : null}
        {open
          ? <ChevronDownIcon className="ml-auto size-3.5 text-muted-foreground" />
          : <ChevronRightIcon className="ml-auto size-3.5 text-muted-foreground" />}
      </button>

      {open ? <div id={id} className="px-4 pb-3">{children}</div> : null}

      {/* A folded section still says what it holds, so nothing filters unseen. */}
      {!open && picked.length > 0 ? (
        <p className="-mt-1 truncate px-4 pb-2.5 text-xs text-primary" title={summary}>{summary}</p>
      ) : null}
    </section>
  );
};
