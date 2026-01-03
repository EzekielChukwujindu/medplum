// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, Context } from 'solid-js';

/**
 * Conditionally wraps content with a context provider.
 * Only wraps if contextValue is defined.
 * @param ContextProvider
 * @param contextValue
 * @param contents
 */
export function maybeWrapWithContext<T>(
  ContextProvider: Context<T>,
  contextValue: T | undefined,
  contents: JSX.Element
): JSX.Element {
  if (contextValue !== undefined) {
    return (
      <ContextProvider.Provider value={contextValue}>
        {contents}
      </ContextProvider.Provider>
    );
  }
  return contents as JSX.Element;
}
