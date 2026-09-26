import { ExternalLinkIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { hostOf } from './utils.ts';
import { SWITCH_TRACK } from '@/components';
import { Switch } from '@/components/ui/switch.tsx';
import { cn } from '@/lib/utils.ts';

interface SourceRowProps {
  /**
   * The chips naming the source, in the hues the same source wears everywhere.
   */
  chips: ReactNode;
  /**
   * The source's full, already translated name.
   */
  name: string;
  /**
   * What the source means for the library - how many championships need it,
   * or that it is always offered.
   */
  status: string;
  /**
   * Whether the status is a warning, for a source switched off.
   */
  warn?: boolean;
  /**
   * The page the source is got from, for any source but the base game.
   */
  url?: string;
  /**
   * Whether the source is offered, for one the user can switch.
   */
  on?: boolean;
  /**
   * Switches it, for one the user can switch.
   * @param next Whether it is now offered
   */
  onChange?: (next: boolean) => void;
}

// A plain anchor with target="_blank": createWindow's setWindowOpenHandler
// sends it to the real browser and denies the frame, so no IPC is involved.
export const SourceRow = ({
  chips, name, status, warn = false, url, on, onChange,
}: SourceRowProps) => (
  <div className="grid grid-cols-[7.5rem_minmax(0,1fr)_11rem_14rem_2.5rem] items-center gap-3 border-t py-2 first:border-t-0">
    <span className="flex flex-wrap items-center gap-1">{chips}</span>
    <span className={cn('truncate text-sm', on === false && 'text-muted-foreground')}>{name}</span>
    <span className={cn('text-xs', warn ? 'text-warning-foreground dark:text-warning' : 'text-muted-foreground')}>
      {status}
    </span>

    {url === undefined ? <span /> : (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 justify-self-end truncate text-xs text-muted-foreground hover:text-primary"
      >
        {hostOf(url)}
        {/* Appended rather than an aria-label, which would replace the
            accessible name the visible host gives the link. */}
        <span className="sr-only">{name}</span>
        <ExternalLinkIcon className="size-3.5 shrink-0" />
      </a>
    )}

    {on === undefined || onChange === undefined ? <span /> : (
      <Switch checked={on} aria-label={name} className={cn(SWITCH_TRACK, 'justify-self-end')} onCheckedChange={onChange} />
    )}
  </div>
);
