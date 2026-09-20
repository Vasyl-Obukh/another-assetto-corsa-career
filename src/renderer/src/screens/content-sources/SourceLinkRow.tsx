import { ExternalLinkIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { hostOf } from './utils.ts';
import { Button } from '@/components/ui/button.tsx';

interface SourceLinkRowProps {
  /**
   * The chips naming the source, which are what colours the row - the DLC,
   * mod and redistribution hues the same source wears everywhere else.
   */
  children: ReactNode;
  /**
   * The source's already-translated name, which the link's accessible name
   * ends with. The chips carry it visually, but eleven rows reading
   * "store.steampowered.com" are one link repeated to a screen reader.
   */
  name: string;
  /**
   * The page the source is got from.
   */
  url: string;
}

// A plain anchor with target="_blank": createWindow's setWindowOpenHandler
// sends it to the real browser and denies the frame, so no IPC is involved.
export const SourceLinkRow = ({ children, name, url }: SourceLinkRowProps) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>

    <Button asChild variant="ghost" size="sm" className="shrink-0 font-normal">
      <a href={url} target="_blank" rel="noreferrer">
        {hostOf(url)}
        {/* Appended rather than an aria-label, which would replace the
            accessible name: "click store.steampowered.com" has to keep
            matching what the row visibly says. */}
        <span className="sr-only">{name}</span>
        <ExternalLinkIcon className="opacity-60" />
      </a>
    </Button>
  </div>
);
