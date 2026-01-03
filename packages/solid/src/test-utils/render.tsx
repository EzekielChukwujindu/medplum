// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render as solidRender } from '@solidjs/testing-library';
import { MedplumProvider } from '@medplum/solid-hooks';
import type { MedplumClient } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { ThemeProvider  } from '../providers/ThemeProvider';
import type {ThemeProviderProps} from '../providers/ThemeProvider';
import type { JSX, ParentProps } from 'solid-js';

export interface RenderOptions {
  /** Medplum client instance. Defaults to MockClient. */
  medplum?: MedplumClient;
  /** Theme provider options */
  theme?: Omit<ThemeProviderProps, 'children'>;
  /** Additional wrapper component */
  wrapper?: (props: ParentProps) => JSX.Element;
}

/**
 * Custom render function that wraps components with all necessary providers.
 * - MedplumProvider (from solid-hooks, includes QueryClientProvider)
 * - ThemeProvider
 * @param ui
 * @param options
 */
export function render(
  ui: () => JSX.Element,
  options: RenderOptions = {}
): ReturnType<typeof solidRender> {
  const medplum = options.medplum ?? new MockClient();
  const themeProps = options.theme ?? { defaultMode: 'light' as const };

  const AllProviders = (props: ParentProps): JSX.Element => {
    const wrapped = (
      <MedplumProvider medplum={medplum}>
        <ThemeProvider {...themeProps}>
          {props.children}
        </ThemeProvider>
      </MedplumProvider>
    );

    if (options.wrapper) {
      return options.wrapper({ children: wrapped });
    }
    return wrapped;
  };

  return solidRender(() => <AllProviders>{ui()}</AllProviders>);
}

// Re-export everything from testing-library
export * from '@solidjs/testing-library';
export { MockClient } from '@medplum/mock';
export { MedplumProvider } from '@medplum/solid-hooks';

/**
 * Helper to create a mock MedplumClient for tests.
 */
export function createMockMedplumClient(): MockClient {
  return new MockClient();
}
