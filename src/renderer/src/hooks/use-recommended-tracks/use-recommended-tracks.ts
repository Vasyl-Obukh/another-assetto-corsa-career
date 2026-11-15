import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ChosenTrack, RecommendedTracks } from './types.ts';
import type { RecommendedTrackState, Settings, TrackChoice } from '../../../../shared/types';
import { isInLibrary } from '../../../../shared/utils/library';
import { isRecommendedCircuit } from '../../../../shared/utils/recommended-tracks';
import { useSettings } from '@/app';
import { invoke, subscribe } from '@/lib/ipc';

/**
 * Sets one layout's choice, dropping it once nothing is left in it.
 * @param choices Every choice, by layout id
 * @param layout The layout's id
 * @param next What the player now decided about it
 * @returns Every choice, the one changed
 */
const withChoice = (
  choices: Readonly<Record<string, TrackChoice>>,
  layout: string,
  next: TrackChoice,
): Record<string, TrackChoice> => {
  const { [layout]: unused, ...rest } = choices;

  return next.track || next.refused?.length ? { ...rest, [layout]: next } : rest;
};

/**
 * Reads every recommended layout's state, again whenever the install or the
 * player's choices change, and writes the choices its buttons make.
 * @returns The states and the actions over them
 */
export const useRecommendedTracks = (): RecommendedTracks => {
  const { settings, patch } = useSettings();
  const [states, setStates] = useState<RecommendedTrackState[] | null>(null);
  const [nonce, setNonce] = useState(0);
  // Read afresh when a choice lands, which is when main answers differently.
  const choices = JSON.stringify(settings.trackChoices);

  useEffect(() => {
    let live = true;
    invoke('tracks:recommended', undefined).then(
      (next) => { if (live) setStates(next); },
      () => { /* nothing is scanned yet; the tab reads again once something is */ },
    );

    return () => { live = false; };
  }, [nonce, choices]);

  useEffect(() => subscribe('content:changed', () => setNonce((n) => n + 1)), []);

  const byId = useMemo(() => (states ? new Map(states.map((state) => [state.id, state])) : null), [states]);

  const choose = useCallback((layout: string, track: ChosenTrack) => {
    const current = settings.trackChoices[layout] ?? {};
    const next: Partial<Settings> = {
      trackChoices: withChoice(settings.trackChoices, layout, { ...current, track: track.key }),
    };
    // Picking a mod the library does not hold yet does what switching it on in
    // Your content does.
    const { tracks } = settings.addedContent;
    if (!isRecommendedCircuit(track.id) && !isInLibrary(track.provenance, track.id, tracks)) {
      next.addedContent = { ...settings.addedContent, tracks: [...tracks, track.id] };
    }
    patch(next);
  }, [settings.trackChoices, settings.addedContent, patch]);

  const refuse = useCallback((layout: string, key: string) => {
    const current = settings.trackChoices[layout] ?? {};
    patch({
      trackChoices: withChoice(settings.trackChoices, layout, {
        ...current, refused: [...current.refused ?? [], key],
      }),
    });
  }, [settings.trackChoices, patch]);

  const forget = useCallback((layout: string) => {
    const { track: unused, ...rest } = settings.trackChoices[layout] ?? {};
    patch({ trackChoices: withChoice(settings.trackChoices, layout, rest) });
  }, [settings.trackChoices, patch]);

  return {
    states: byId, choose, accept: choose, refuse, forget,
  };
};
