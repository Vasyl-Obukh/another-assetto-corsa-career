import {
  useCallback, useMemo, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { LeaveAction, UnsavedContextValue } from './types.ts';
import { UnsavedContext } from './utils.ts';
import { ConfirmDialog } from '@/components/ConfirmDialog.tsx';

interface UnsavedProviderProps {
  /**
   * The tree whose pages may hold unsaved changes.
   */
  children: ReactNode;
}

/**
 * Knows whether a page holds changes it has not written, and asks before
 * anything outside the page - loading a save, the main menu - takes the player
 * off it. A page's own guard on navigation cannot do that: by the time it
 * fires, the save is already loaded or the career closed.
 */
export const UnsavedProvider = ({ children }: UnsavedProviderProps) => {
  const { t } = useTranslation();
  const holds = useRef(new Set<symbol>());
  // Set once the player agrees to lose the changes, so the page's own guard
  // lets them off without asking twice; cleared as the page lets go.
  const discarding = useRef(false);
  // Kept once answered, so the dialog does not change its words as it fades.
  const [action, setAction] = useState<LeaveAction>('load');
  const [answer, setAnswer] = useState<((go: boolean) => void) | null>(null);

  const hold = useCallback((): (() => void) => {
    const held = Symbol('unsaved');
    holds.current.add(held);

    return () => {
      holds.current.delete(held);
      if (holds.current.size === 0) discarding.current = false;
    };
  }, []);

  const leave = useCallback(async (asked: LeaveAction, go: () => Promise<boolean>): Promise<boolean> => {
    if (holds.current.size > 0) {
      setAction(asked);
      const agreed = await new Promise<boolean>((resolve) => { setAnswer(() => resolve); });
      setAnswer(null);
      if (!agreed) return false;
      discarding.current = true;
    }
    const gone = await go();
    // Still on the page, so its changes are still worth asking about.
    if (!gone) discarding.current = false;

    return gone;
  }, []);

  const value = useMemo((): UnsavedContextValue => ({
    hold, leave, discarding: () => discarding.current,
  }), [hold, leave]);

  return (
    <UnsavedContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={answer !== null}
        title={t('unsaved.title')}
        description={t(`unsaved.${action}.body`)}
        confirmLabel={t(`unsaved.${action}.confirm`)}
        onConfirm={() => answer?.(true)}
        onClose={() => answer?.(false)}
      />
    </UnsavedContext.Provider>
  );
};
