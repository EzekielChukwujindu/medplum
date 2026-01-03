// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import type { ExtensionDisplayProps } from './ExtensionDisplay';
import { ExtensionDisplay } from './ExtensionDisplay';

const medplum = new MockClient();

const defaultProps: ExtensionDisplayProps = {
  value: { url: '' },
  path: 'Resource.extension',
  elementDefinitionType: { code: 'Extension', profile: [] },
};

describe('ExtensionDisplay', () => {
  async function setup(props: ExtensionDisplayProps): Promise<void> {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ExtensionDisplay {...props} />
      </MedplumProvider>
    ));
  }

  test('Renders simple value', async () => {
    await setup({
      ...defaultProps,
      value: { url: 'https://example.com', valueString: 'extension str value' },
    });
    
    await waitFor(() => {
      expect(screen.getByText('extension str value')).toBeTruthy();
    });
  });

  test('Renders with undefined value', async () => {
    const { container } = render(() => (
      <MedplumProvider medplum={medplum}>
        <ExtensionDisplay {...defaultProps} />
      </MedplumProvider>
    ));
    expect(container).toBeTruthy();
  });

  test('Renders boolean value', async () => {
    await setup({
      ...defaultProps,
      value: { url: 'https://example.com', valueBoolean: true },
    });
    
    await waitFor(() => {
      // Boolean values render as 'true' or checkbox
      expect(screen.getByText('true') || screen.queryByRole('checkbox')).toBeTruthy();
    });
  });
});
