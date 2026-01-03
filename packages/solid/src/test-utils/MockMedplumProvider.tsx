// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient } from '@medplum/core';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { JSX, ParentProps } from 'solid-js';

export interface MockMedplumProviderProps extends ParentProps {
  /** Whether medplum is in loading state */
  readonly isLoading?: boolean;
  /** Custom MedplumClient */
  readonly medplum?: MedplumClient;
  /** Navigation callback */
  readonly navigate?: (path: string) => void;
}

/**
 * MockMedplumProvider for testing AppShell and other components
 * that depend on useMedplum and useMedplumProfile.
 * @param props
 */
export function MockMedplumProvider(props: MockMedplumProviderProps): JSX.Element {
  const mockClient = props.medplum ?? new MockMockClient(props.isLoading ?? false);
  
  return (
    <MedplumProvider medplum={mockClient} navigate={props.navigate}>
      {props.children}
    </MedplumProvider>
  );
}

/**
 * A mock client that can simulate loading state.
 */
class MockMockClient extends MockClient {
  private _isLoading: boolean;

  constructor(isLoading: boolean = false) {
    super();
    this._isLoading = isLoading;
  }

  isLoading(): boolean {
    return this._isLoading;
  }
}
