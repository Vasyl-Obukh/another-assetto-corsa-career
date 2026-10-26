import { useEffect, useState } from 'react';

import type { Track } from '../../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

/**
 * Resolves the layout a race or a round names into the installed track.
 *
 * A race carries folder IDs, which nobody wants to read. Failures are
 * swallowed: a layout that is not installed simply resolves to nothing, and
 * whatever names it says so in its own place. Each answer is stamped with the
 * key it was asked for, so the previous track never flashes under a new one.
 * @param track The layout, or null while there is none
 * @returns The installed track, or null until it is known or when it is not
 * installed
 */
export const useInstalledTrack = (track: { id: string; layout?: string } | null): Track | null => {
  const [resolved, setResolved] = useState<{ key: string; track: Track | null }>({ key: '', track: null });
  const [nonce, setNonce] = useState(0);
  const key = track ? (track.layout ? `${track.id}/${track.layout}` : track.id) : '';

  useEffect(() => {
    if (key === '') return undefined;

    let live = true;
    invoke('content:track', { key }).then(
      (found) => { if (live) setResolved({ key, track: found }); },
      () => { /* a track that is not installed has nothing to resolve to */ },
    );

    return () => { live = false; };
  }, [key, nonce]);

  // A track installed while the screen is open should start reading as itself.
  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  return resolved.key === key ? resolved.track : null;
};
