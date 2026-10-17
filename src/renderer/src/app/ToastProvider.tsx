import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';

import { MAX_TOASTS, TOAST_MS } from './constants.ts';
import type { ToastContextValue, ToastMessage } from './types.ts';
import { ToastContext } from './utils.ts';
import { ToastCard } from '@/components/ToastCard.tsx';

interface ToastProviderProps {
  /**
   * The tree that raises toasts.
   */
  children: ReactNode;
}

/**
 * Notifications in the window's bottom-right corner, each going again on its
 * own: what was loaded, and why something could not be.
 */
export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<readonly { id: number; message: ToastMessage }[]>([]);
  const next = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const close = useCallback((id: number): void => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((shown) => shown.filter((one) => one.id !== id));
  }, []);

  const show = useCallback((message: ToastMessage): void => {
    next.current += 1;
    const id = next.current;
    setToasts((shown) => [...shown, { id, message }].slice(-MAX_TOASTS));
    timers.current.set(id, setTimeout(() => close(id), TOAST_MS));
  }, [close]);

  useEffect(() => {
    const held = timers.current;

    return () => {
      for (const timer of held.values()) clearTimeout(timer);
    };
  }, []);

  const value = useMemo((): ToastContextValue => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-6 bottom-6 z-50 flex flex-col items-end gap-2">
        {toasts.map((one) => <ToastCard key={one.id} message={one.message} onClose={() => close(one.id)} />)}
      </div>
    </ToastContext.Provider>
  );
};
