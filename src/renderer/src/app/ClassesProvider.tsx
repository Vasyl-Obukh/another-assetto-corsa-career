import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import type { ReactNode } from 'react';

import { ClassesContext } from './utils.ts';
import type { ClassLayer } from '../../../shared/types';
import { resolveCatalogue } from '../../../shared/utils/car-classes';
import { subscribe } from '@/lib/ipc';

interface ClassesProviderProps {
  /**
   * The user's class layer, read from main before the first render.
   */
  initialLayer: ClassLayer;
  /**
   * The tree that reads the catalogue.
   */
  children: ReactNode;
}

export const ClassesProvider = ({ initialLayer, children }: ClassesProviderProps) => {
  const [layer, setLayer] = useState(initialLayer);

  // Main writes the layer and pushes it after every command, whichever screen
  // sent it, so this is the one place the renderer's copy changes.
  useEffect(() => subscribe('classes:changed', setLayer), []);

  // Resolved here rather than sent: the catalogue is maps, and the same shared
  // function main resolves with gives the same answer from the same layer.
  const catalogue = useMemo(() => resolveCatalogue(layer), [layer]);
  const adopt = useCallback((next: ClassLayer) => setLayer(next), []);

  const value = useMemo(() => ({ layer, catalogue, adopt }), [layer, catalogue, adopt]);

  return <ClassesContext value={value}>{children}</ClassesContext>;
};
