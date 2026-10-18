import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import type { ReactNode } from 'react';

import type { SlotContextValue } from './types.ts';
import { SlotContext } from './utils.ts';
import type { Career } from '../../../shared/types';
import { invoke, subscribe } from '@/lib/ipc';

interface SlotProviderProps {
  /**
   * The career main has open before the first render - none, unless the
   * window was reloaded with one open.
   */
  initialCareer: Career | null;
  /**
   * The tree that reads which mode the app is in.
   */
  children: ReactNode;
}

/**
 * Which mode the app is in: the start screen, a career, a standalone
 * championship - which is a career of its own kind - or quick race mode.
 *
 * A career is open in main, so it is what main says - pushed on every change
 * and set straight from what opening one answers, so a page navigated to the
 * moment it opens is never shown the start screen first. Quick race mode keeps
 * nothing in main, so it is the renderer's alone.
 */
export const SlotProvider = ({ initialCareer, children }: SlotProviderProps) => {
  const [career, setCareer] = useState(initialCareer);
  const [quick, setQuick] = useState(false);

  useEffect(() => subscribe('career:changed', setCareer), []);

  const openCareer = useCallback(async (id: string): Promise<void> => {
    setCareer(await invoke('career:open', { id }));
    setQuick(false);
  }, []);

  const createCareer = useCallback<SlotContextValue['createCareer']>(async (request) => {
    setCareer(await invoke('career:create', request));
    setQuick(false);
  }, []);

  const createChampionship = useCallback<SlotContextValue['createChampionship']>(async (request) => {
    setCareer(await invoke('career:createChampionship', request));
    setQuick(false);
  }, []);

  const loadSave = useCallback<SlotContextValue['loadSave']>(async (id, save) => {
    const loaded = await invoke('career:load', { id, save });
    setCareer(loaded.career);
    setQuick(false);

    return loaded;
  }, []);

  const enterQuick = useCallback((): void => setQuick(true), []);

  const toMainMenu = useCallback(async (): Promise<void> => {
    if (career) {
      await invoke('career:close', undefined);
      setCareer(null);
    }
    setQuick(false);
  }, [career]);

  const quit = useCallback((): void => {
    void invoke('app:quit', undefined);
  }, []);

  const value = useMemo((): SlotContextValue => {
    let mode: SlotContextValue['mode'] = quick ? 'quick' : 'start';
    if (career) mode = career.kind === 'championship' ? 'championship' : 'career';

    return {
      mode,
      career,
      openCareer,
      createCareer,
      createChampionship,
      loadSave,
      enterQuick,
      toMainMenu,
      quit,
    };
  }, [career, quick, openCareer, createCareer, createChampionship, loadSave, enterQuick, toMainMenu, quit]);

  return <SlotContext.Provider value={value}>{children}</SlotContext.Provider>;
};
