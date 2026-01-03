// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createContext, createEffect, createSignal, onMount, useContext    } from 'solid-js';
import type {Accessor, JSX, ParentProps} from 'solid-js';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Storage adapter interface for persistence.
 * Allows swapping localStorage for other storage mechanisms (e.g., for desktop apps).
 */
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem?(key: string): void | Promise<void>;
}

/** Default localStorage adapter */
export const localStorageAdapter: StorageAdapter = {
  getItem: (key) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key, value) => { if (typeof localStorage !== 'undefined') {localStorage.setItem(key, value);} },
  removeItem: (key) => { if (typeof localStorage !== 'undefined') {localStorage.removeItem(key);} },
};

export interface ThemeContextValue {
  /** Current theme mode setting */
  readonly mode: Accessor<ThemeMode>;
  /** Resolved theme (light or dark, based on system preference if mode is 'system') */
  readonly resolvedTheme: Accessor<'light' | 'dark'>;
  /** Set the theme mode */
  readonly setMode: (mode: ThemeMode) => void;
  /** Toggle between light and dark */
  readonly toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>();

export interface ThemeProviderProps extends ParentProps {
  /** Initial theme mode. Defaults to 'system'. */
  defaultMode?: ThemeMode;
  /** Storage key for persisting theme preference. Defaults to 'medplum-theme'. */
  storageKey?: string;
  /** Attribute to set on the document element. Defaults to 'data-theme' for DaisyUI. */
  attribute?: string;
  /** Storage adapter for persistence. Defaults to localStorage. */
  storage?: StorageAdapter;
}

/**
 * ThemeProvider manages light/dark mode for the application.
 * It integrates with DaisyUI's theme system by setting data-theme attribute.
 * @param props
 */
export function ThemeProvider(props: ThemeProviderProps): JSX.Element {
  const storageKey = props.storageKey ?? 'medplum-theme';
  const attribute = props.attribute ?? 'data-theme';
  const storage = props.storage ?? localStorageAdapter;
  
  // Initialize from storage or default
  const getInitialMode = (): ThemeMode => {
    if (typeof window === 'undefined') {return props.defaultMode ?? 'system';}
    // For sync initialization, only use sync storage
    const stored = storage.getItem(storageKey);
    if (typeof stored === 'string' && (stored === 'light' || stored === 'dark' || stored === 'system')) {
      return stored;
    }
    return props.defaultMode ?? 'system';
  };

  const [mode, setModeInternal] = createSignal<ThemeMode>(getInitialMode());
  const [systemPreference, setSystemPreference] = createSignal<'light' | 'dark'>('light');

  // Resolve the actual theme based on mode and system preference
  const resolvedTheme = (): 'light' | 'dark' => {
    const m = mode();
    if (m === 'system') {
      return systemPreference();
    }
    return m;
  };

  // Listen to system preference changes
  onMount(() => {
    if (typeof window === 'undefined') {return;}
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    
    const handler = (e: MediaQueryListEvent): void => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  });

  // Apply theme to document
  createEffect(() => {
    if (typeof document === 'undefined') {return;}
    document.documentElement.setAttribute(attribute, resolvedTheme());
  });

  // Persist to storage when mode changes
  const setMode = (newMode: ThemeMode): void => {
    setModeInternal(newMode);
    storage.setItem(storageKey, newMode);
  };

  const toggle = (): void => {
    const current = resolvedTheme();
    setMode(current === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextValue = {
    mode,
    resolvedTheme,
    setMode,
    toggle,
  };

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
