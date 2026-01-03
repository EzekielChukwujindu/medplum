// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import type { ExtensionInputProps } from './ExtensionInput';
import { ExtensionInput } from './ExtensionInput';

const medplum = new MockClient();

const defaultProps: ExtensionInputProps = {
  name: 'a',
  path: 'Resource.extension',
  onChange: undefined,
  outcome: undefined,
  propertyType: { code: 'Extension', profile: [] },
};

describe('ExtensionInput', () => {
  async function setup(props: ExtensionInputProps): Promise<void> {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ExtensionInput {...props} />
      </MedplumProvider>
    ));
  }

  test('Renders', async () => {
    await setup({
      ...defaultProps,
      defaultValue: { url: 'https://example.com', valueBoolean: true },
    });
    
    await waitFor(() => {
      expect(screen.getByText('URL')).toBeTruthy();
    });
  });

  test('Renders undefined value', async () => {
    await setup({
      ...defaultProps,
    });
    
    await waitFor(() => {
      expect(screen.getByText('URL')).toBeTruthy();
      expect(screen.getByText('Value X')).toBeTruthy();
    });
  });

  test('Renders input elements', async () => {
    await setup({
      ...defaultProps,
    });

    await waitFor(() => {
      // Check that URL and Value X labels are present
      expect(screen.getByText('URL')).toBeTruthy();
      expect(screen.getByText('Value X')).toBeTruthy();
    });

    // Check that input elements exist
    const urlInput = document.querySelector('input[name="url"]');
    expect(urlInput).toBeTruthy();
  });
});
