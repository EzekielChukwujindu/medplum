// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MedplumProvider  } from '@medplum/solid-hooks';
import type {MedplumProviderProps} from '@medplum/solid-hooks';
import { ThemeProvider,   localStorageAdapter } from '../providers/ThemeProvider';
import type {ThemeProviderProps, StorageAdapter} from '../providers/ThemeProvider';
import type { JSX, ParentProps } from 'solid-js';

export interface SolidMedplumProviderProps extends ParentProps {
  /** Medplum client instance (required) */
  readonly medplum: MedplumProviderProps['medplum'];
  /** Optional navigate function */
  readonly navigate?: MedplumProviderProps['navigate'];
  /** Optional QueryClient (MedplumProvider creates one by default) */
  readonly queryClient?: MedplumProviderProps['queryClient'];
  /** Theme mode: 'light', 'dark', or 'system' */
  readonly defaultTheme?: ThemeProviderProps['defaultMode'];
  /** Storage adapter for theme persistence */
  readonly themeStorage?: StorageAdapter;
  /** Custom attribute for theme (defaults to 'data-theme' for DaisyUI) */
  readonly themeAttribute?: string;
}

/**
 * SolidMedplumProvider combines MedplumProvider, QueryClientProvider, and ThemeProvider
 * into a single convenient wrapper for Medplum SolidJS applications.
 * 
 * @param props
 * @example
 * ```tsx
 * import { SolidMedplumProvider } from '@medplum/solid';
 * import { MedplumClient } from '@medplum/core';
 * 
 * const medplum = new MedplumClient({ ... });
 * 
 * function App() {
 *   return (
 *     <SolidMedplumProvider medplum={medplum} defaultTheme="system">
 *       <MyApp />
 *     </SolidMedplumProvider>
 *   );
 * }
 * ```
 */
export function SolidMedplumProvider(props: SolidMedplumProviderProps): JSX.Element {
  return (
    <MedplumProvider
      medplum={props.medplum}
      navigate={props.navigate}
      queryClient={props.queryClient}
    >
      <ThemeProvider
        defaultMode={props.defaultTheme}
        storage={props.themeStorage ?? localStorageAdapter}
        attribute={props.themeAttribute}
      >
        {props.children}
      </ThemeProvider>
    </MedplumProvider>
  );
}
