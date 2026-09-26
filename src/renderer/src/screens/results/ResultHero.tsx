import type { ReactNode } from 'react';

import { isServableLayout, trackOutlineUrl } from '../../../../shared/utils/content-url';
import { ContentImage } from '@/components';
import { useFormat } from '@/i18n';
import { layoutImageSources } from '@/screens/track-browser';

interface ResultHeroProps {
  /**
   * The layout it ran on, or null when it is not installed.
   */
  layout: { id: string; layout: string } | null;
  /**
   * The session's kind, as its chip.
   */
  chip: ReactNode;
  /**
   * The way back to the championship and the round, for one of the career's.
   */
  links: ReactNode;
  /**
   * What the session was.
   */
  title: string;
  /**
   * Where it ran, a part at a time.
   */
  line: readonly string[];
  /**
   * When it was archived, as an ISO timestamp.
   */
  recordedAt: string;
}

/**
 * A result's head: the track's photograph with its outline over it, the kind
 * of session, where it belongs and when it ran.
 */
export const ResultHero = ({
  layout, chip, links, title, line, recordedAt,
}: ResultHeroProps) => {
  const { formatDateTime } = useFormat();

  return (
    <section className="relative h-48 overflow-hidden rounded-xl bg-scrim text-on-scrim">
      {layout ? (
        <>
          <ContentImage sources={layoutImageSources(layout)} alt="" className="object-cover" fallback={null} />
          <span className="absolute inset-0 bg-gradient-to-t from-scrim/90 to-scrim/25" />
          {isServableLayout(layout.id, layout.layout) ? (
            <img
              src={trackOutlineUrl(layout.id, layout.layout)}
              alt=""
              className="absolute top-5 right-6 bottom-5 hidden w-52 object-contain brightness-0 invert sm:block"
            />
          ) : null}
        </>
      ) : null}
      <div className="absolute bottom-4 left-5 flex max-w-[calc(100%-16rem)] flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {chip}
          {links}
        </div>
        <h1 className="text-2xl font-semibold" data-selectable>{title}</h1>
        <p className="text-sm opacity-85">{[...line, formatDateTime(recordedAt)].join(' · ')}</p>
      </div>
    </section>
  );
};
