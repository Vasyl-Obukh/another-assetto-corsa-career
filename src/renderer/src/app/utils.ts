import { createContext, useContext, useEffect } from 'react';

import type {
  ClassesContextValue, SettingsContextValue, SlotContextValue, ToastContextValue, UnsavedContextValue,
} from './types.ts';

/**
 * Holds the settings for the whole renderer. Null until a provider mounts.
 */
export const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Reads the settings context.
 * @returns The settings and the patch function
 * @throws When called outside a SettingsProvider
 */
export const useSettings = (): SettingsContextValue => {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');

  return value;
};

/**
 * Holds the class catalogue for the whole renderer. Null until a provider mounts.
 */
export const ClassesContext = createContext<ClassesContextValue | null>(null);

/**
 * Reads the class catalogue context.
 * @returns The user's layer, the catalogue resolved from it, and adopt
 * @throws When called outside a ClassesProvider
 */
export const useClasses = (): ClassesContextValue => {
  const value = useContext(ClassesContext);
  if (!value) throw new Error('useClasses must be used inside ClassesProvider');

  return value;
};

/**
 * The mode the app is in, as SlotProvider holds it.
 */
export const SlotContext = createContext<SlotContextValue | null>(null);

/**
 * Reads which mode the app is in, and the ways in and out of each.
 * @returns The mode, the open career and its commands
 */
export const useSlot = (): SlotContextValue => {
  const value = useContext(SlotContext);
  if (!value) throw new Error('useSlot must be used inside SlotProvider');

  return value;
};

/**
 * The way to raise a toast, as ToastProvider holds it.
 */
export const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Reads the way to raise a toast.
 * @returns The toast commands
 * @throws When called outside a ToastProvider
 */
export const useToast = (): ToastContextValue => {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');

  return value;
};

/**
 * Whether a page holds unsaved changes, as UnsavedProvider holds it.
 */
export const UnsavedContext = createContext<UnsavedContextValue | null>(null);

/**
 * Reads the way to ask before leaving a page with unsaved changes.
 * @returns The commands
 * @throws When called outside an UnsavedProvider
 */
export const useUnsaved = (): UnsavedContextValue => {
  const value = useContext(UnsavedContext);
  if (!value) throw new Error('useUnsaved must be used inside UnsavedProvider');

  return value;
};

/**
 * Holds the page's unsaved changes for as long as there are any, so loading a
 * save or the main menu asks before losing them.
 * @param dirty Whether the page holds changes it has not written
 * @returns Whether the player has already agreed to lose them, for the page's
 * own guard on navigation
 */
export const useUnsavedChanges = (dirty: boolean): (() => boolean) => {
  const { hold, discarding } = useUnsaved();
  useEffect(() => (dirty ? hold() : undefined), [dirty, hold]);

  return discarding;
};
