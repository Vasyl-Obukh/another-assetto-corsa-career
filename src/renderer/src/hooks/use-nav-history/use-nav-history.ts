import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router';

import { MOUSE_BACK, MOUSE_FORWARD } from './constants.ts';
import {
  currentIndex, hasNextVisit, previousVisit, recordVisit, visitIndex,
} from '@/lib/nav-history';

/**
 * Keeps the window's history for Back to read, and steps through it from the
 * mouse's side buttons and Alt+Left / Alt+Right, as a browser would. Mounted
 * once, at the root of the app.
 */
export const useNavHistory = (): void => {
  const location = useLocation();
  const action = useNavigationType();
  const navigate = useNavigate();
  // The keys read it rather than re-subscribing on every page.
  const key = useRef(location.key);

  useEffect(() => {
    key.current = location.key;
    recordVisit(currentIndex(), location.key, location.pathname, action);
  }, [location.key, location.pathname, action]);

  useEffect(() => {
    // Only within the app's own pages: past the first one there is nothing of
    // ours to go back to. Placed by the router's location, as Back is.
    const step = (by: -1 | 1): boolean => {
      const index = visitIndex(key.current);
      const possible = by < 0 ? previousVisit(index) !== null : hasNextVisit(index);
      if (possible) void navigate(by);

      return possible;
    };

    const onKey = (event: KeyboardEvent): void => {
      if (!event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' && step(-1)) event.preventDefault();
      if (event.key === 'ArrowRight' && step(1)) event.preventDefault();
    };
    const onMouse = (event: MouseEvent): void => {
      if (event.button === MOUSE_BACK && step(-1)) event.preventDefault();
      if (event.button === MOUSE_FORWARD && step(1)) event.preventDefault();
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('mouseup', onMouse);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mouseup', onMouse);
    };
  }, [navigate]);
};
