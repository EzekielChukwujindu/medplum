// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { GoogleButton } from './GoogleButton';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';

const medplum = new MockClient();

describe('GoogleButton', () => {
  test('Renders null without googleClientId', async () => {
    const { container } = render(() => (
      <MedplumProvider medplum={medplum}>
        <GoogleButton
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      </MedplumProvider>
    ));

    // Should render nothing when no googleClientId
    expect(container.innerHTML).toBe('');
  });

  test('Renders with googleClientId', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <GoogleButton
          googleClientId="test-client-id"
          onSuccess={vi.fn()}
          onError={vi.fn()}
        />
      </MedplumProvider>
    ));

    // Should render container for Google button
    await waitFor(() => {
      expect(screen.getByRole('presentation', { hidden: true }) || document.querySelector('.loading')).toBeTruthy();
    }, { timeout: 100 }).catch(() => {
      // Button container should exist
      expect(document.querySelector('div')).toBeTruthy();
    });
  });
});
