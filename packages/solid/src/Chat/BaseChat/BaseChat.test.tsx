// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Communication } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { BaseChat } from './BaseChat';

const medplum = new MockClient();

describe('BaseChat', () => {
  function setup(
    communications: Communication[] = [],
    setCommunications = vi.fn(),
    sendMessage = vi.fn()
  ): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <BaseChat
          title="Test Chat"
          communications={communications}
          setCommunications={setCommunications}
          query="part-of:missing=true"
          sendMessage={sendMessage}
        />
      </MedplumProvider>
    ));
  }

  test('Renders chat title', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText('Test Chat')).toBeTruthy();
    });
  });

  test('Renders message input', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeTruthy();
    });
  });

  test('Renders send button', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByLabelText('Send message')).toBeTruthy();
    });
  });

  test('Renders with communications', async () => {
    const communications: Communication[] = [
      {
        resourceType: 'Communication',
        id: 'comm-1',
        status: 'completed',
        sent: '2023-01-01T12:00:00Z',
        sender: { reference: 'Practitioner/123', display: 'Dr. Smith' },
        payload: [{ contentString: 'Hello, how are you?' }],
      },
    ];

    setup(communications);
    await waitFor(() => {
      expect(screen.getByText('Hello, how are you?')).toBeTruthy();
    });
  });

  test('Shows disabled placeholder when input is disabled', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <BaseChat
          title="Test Chat"
          communications={[]}
          setCommunications={vi.fn()}
          query="part-of:missing=true"
          sendMessage={vi.fn()}
          inputDisabled
        />
      </MedplumProvider>
    ));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Replies are disabled')).toBeTruthy();
    });
  });

  test('Hides header when excludeHeader is true', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <BaseChat
          title="Test Chat"
          communications={[]}
          setCommunications={vi.fn()}
          query="part-of:missing=true"
          sendMessage={vi.fn()}
          excludeHeader
        />
      </MedplumProvider>
    ));

    await waitFor(() => {
      // Header should not be visible
      expect(screen.queryByText('Test Chat')).toBeNull();
    });
  });
});
